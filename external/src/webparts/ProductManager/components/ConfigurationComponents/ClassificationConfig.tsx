import * as React from 'react';
import { DefaultButton, ICommandBarItemProps, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { ClassificationModel } from '../../../../models/ClassificationModel';
import RecordService from '../../../../services/RecordService';
import { FormInputToggle } from '../FormComponents/FormInputToggle';

export interface IClassificationConfigProps { }

export interface IClassificationConfigState {
    draftModel: ClassificationModel;
    showPane: boolean;
}

export default class ClassificationConfig extends React.Component <IClassificationConfigProps, IClassificationConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;

    constructor(props: IClassificationConfigProps) {
        super(props);
        this.state = {
            draftModel: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<IClassificationConfigProps> {
        return (
            <>
                <Stack className={styles.configZone} verticalFill={true}>
                    <Label style={{ fontSize: '1.5rem' }}>Classifications</Label>
                    {
                        AppService.AppSettings.classificationModels.map(d => {
                            return (
                                <Stack className={styles.card} key={d.classificationId}>
                                    <Label onClick={this.showPane.bind(this, d)} className={`${styles.pointer}`}>{d.classificationTitle}</Label>
                                </Stack>
                            );
                        })
                    }
                </Stack>
                { this.state.draftModel &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={true}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        onRenderHeader={this.getPaneHeader.bind(this)}
                    >
                        <FormInputText
                            labelValue={'Title'}
                            editing={true}
                            fieldValue={this.state.draftModel.classificationTitle}
                            fieldRef={'classificationTitle'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Caveats'}
                            editing={true}
                            fieldValue={this.state.draftModel.classificationCaveats}
                            fieldRef={'classificationCaveats'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                    </Panel>
                }
            </>
        );
    }

    private updateVal(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new ClassificationModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private showPane(classModel: ClassificationModel): void {
        this.setState({ draftModel: classModel, showPane: true });
    }

    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ draftModel: null, showPane: false });
        } else {
            this.saveClassifications();
        }
    }

    private saveClassifications(): void {
        const classifications = AppService.AppSettings.classificationModels
        .filter(f => f.classificationId !== this.state.draftModel.classificationId)
        .concat([this.state.draftModel])
        .sort((a, b) => a.classificationTitle > b.classificationTitle ? 1 : (a.classificationTitle < b.classificationTitle ? -1 : 0));

        AppService.UpdateAppSetting({ classificationModels: classifications })
        .then(newSettings => {
            this.hasUpdates = false;
            this.setState({ draftModel: null, showPane: false });
        })
        .catch(e => Promise.reject(e));
    }
    
    public componentDidMount(): void {
        this.menuReceiver = this.cmdBarEvent.bind(this);
        this.menuReceiver = AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps)
    }
    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.menuReceiver);
    }
    private cmdBarEvent(item: ICommandBarItemProps): Promise<void> {
        if (item['data-automation-id'] === 'newClassificationModel') {
                const newRecord = RecordService.GetNewClassificationModel();
                this.setState({ draftModel: newRecord, showPane: true });
        }
        return Promise.resolve();
    }
    
    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftModel.classificationTitle}
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveClassifications.bind(this)}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
}
