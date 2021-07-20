import * as React from 'react';
import { DefaultButton, ICommandBarItemProps, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { CategoryModel } from '../../../../models/CategoryModel';
import RecordService from '../../../../services/RecordService';
import { FormInputToggle } from '../FormComponents/FormInputToggle';

export interface ICategoryConfigProps { }

export interface CategoryConfigState {
    draftModel: CategoryModel;
    showPane: boolean;
}

export default class CategoryConfig extends React.Component <ICategoryConfigProps, CategoryConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;

    constructor(props: ICategoryConfigProps) {
        super(props);
        this.state = {
            draftModel: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<ICategoryConfigProps> {
        return (
            <Stack className={styles.configZone} verticalFill={true}>
                <Label style={{ fontSize: '1.5rem' }}>Categories</Label>
                {
                    AppService.AppSettings.categories.map(d => {
                        return (
                            <Stack className={styles.card} key={d.categoryId}>
                                <Label onClick={this.showPane.bind(this, d)} className={`${styles.pointer}`}>{d.categoryText}</Label>
                            </Stack>
                        );
                    })
                }
                { this.state.draftModel &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={!this.hasUpdates}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        onRenderHeader={this.getPaneHeader.bind(this)}
                    >
                        <FormInputText
                            labelValue={'Title'}
                            editing={true}
                            fieldValue={this.state.draftModel.categoryText}
                            fieldRef={'categoryText'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Description'}
                            editing={true}
                            fieldValue={this.state.draftModel.categoryDescription}
                            fieldRef={'categoryDescription'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                    </Panel>
                }
            </Stack>
        );
    }

    public componentDidMount(): void {
        this.menuReceiver = this.cmdBarEvent.bind(this);
        this.menuReceiver = AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);
    }
    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.menuReceiver);
    }
    private cmdBarEvent(item: ICommandBarItemProps): Promise<void> {
        if (item['data-automation-id'] === 'newCategoryModel') {
                const newRecord = RecordService.GetNewCategoryModel();
                this.setState({ draftModel: newRecord, showPane: true });
        }
        return Promise.resolve();
    }

    private updateVal(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new CategoryModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private showPane(classModel: CategoryModel): void {
        this.setState({ draftModel: classModel, showPane: true });
    }
    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.setState({ draftModel: null, showPane: false });
        } else {
            this.saveCategories();
        }
    }

    private saveCategories(): void {
        const categories = AppService.AppSettings.categories
        .filter(f => f.categoryId !== this.state.draftModel.categoryId)
        .concat([this.state.draftModel])
        .sort((a, b) => a.categoryText > b.categoryText ? 1 : (a.categoryText < b.categoryText ? -1 : 0));

        AppService.UpdateAppSetting({ categories: categories })
        .then(newSettings => {
            this.hasUpdates = false;
            this.setState({ draftModel: null, showPane: false });
        })
        .catch(e => Promise.reject(e));
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftModel.categoryText}
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveCategories.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
}
