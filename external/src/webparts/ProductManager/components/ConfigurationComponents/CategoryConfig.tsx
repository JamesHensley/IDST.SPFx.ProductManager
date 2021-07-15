import * as React from 'react';
import { Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { CategoryModel } from '../../../../models/CategoryModel';

export interface ICategoryConfigProps { }

export interface CategoryConfigState {
    draftModel: CategoryModel;
    showPane: boolean;
}

export default class CategoryConfig extends React.Component <ICategoryConfigProps, CategoryConfigState> {
    private hasUpdates = false;

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
                <Label style={{ fontSize: '1.5rem' }}>PIRs</Label>
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
                        isLightDismiss={true}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        headerText={`${this.state.draftModel.categoryText}`}
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

    private updateVal(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new CategoryModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private showPane(classModel: CategoryModel): void {
        this.setState({ draftModel: classModel, showPane: true });
    }

    private closePane(): void {
        if (this.hasUpdates) {
            this.saveCategories();
        } else {
            this.setState({ draftModel: null, showPane: false });
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
}
