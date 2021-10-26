import * as React from 'react';
import { DefaultButton, ICommandBarItemProps, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { PirModel } from '../../../../models/PirModel';
import RecordService from '../../../../services/RecordService';
import { FormInputToggle } from '../FormComponents/FormInputToggle';

export interface IPirConfigProps { showInactive: boolean; }

export interface IPirConfigState {
    draftModel: PirModel;
    showPane: boolean;
}

export default class PirConfig extends React.Component <IPirConfigProps, IPirConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;

    constructor(props: IPirConfigProps) {
        super(props);
        this.state = {
            draftModel: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<IPirConfigProps> {
        return (
            <Stack className={styles.configZone} verticalFill={true}>
                <Label style={{ fontSize: '1.5rem' }}>PIRs</Label>
                {
                    AppService.AppSettings.pirs
                    .filter(f => this.props.showInactive ? true : f.active)
                    .sort((a,b) => a.pirText > b.pirText ? 1 : (a.pirText < b.pirText ? -1 : 0))
                    .map(d => {
                        return (
                            <Stack className={styles.card} style={{ opacity: d.active ? 1 : 0.4 }} key={d.pirId}>
                                <Label onClick={this.showPane.bind(this, d)} className={`${styles.pointer}`}>{d.pirText}</Label>
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
                            fieldValue={this.state.draftModel.pirText}
                            fieldRef={'pirText'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Description'}
                            editing={true}
                            fieldValue={this.state.draftModel.pirDescription}
                            fieldRef={'pirDescription'}
                            onUpdated={this.updateVal.bind(this)}
                            editLines={3}
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
                const newRecord = RecordService.GetNewPirModel();
                this.setState({ draftModel: newRecord, showPane: true });
        }
        return Promise.resolve();
    }

    private updateVal(fieldVal: any, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new PirModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private showPane(classModel: PirModel): void {
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
        const categories = AppService.AppSettings.pirs
        .filter(f => f.pirId !== this.state.draftModel.pirId)
        .concat(this.state.draftModel)
        .sort((a, b) => a.pirText > b.pirText ? 1 : (a.pirText < b.pirText ? -1 : 0));

        AppService.UpdateAppSetting({ pirs: categories })
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
                            {this.state.draftModel.pirText}
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
                    <FormInputToggle
                        labelValue={'Active'}
                        fieldValue={this.state.draftModel.active}
                        fieldRef={'active'}
                        onUpdated={this.updateVal.bind(this)}
                        oneRow={true}
                    />
                </Stack>
            </div>
        );
    }
}
