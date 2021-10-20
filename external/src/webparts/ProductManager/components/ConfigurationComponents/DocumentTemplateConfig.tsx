import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import { DefaultButton, ICommandBarItemProps, IPanelHeaderRenderer, Label, Panel, PanelType, Stack } from '@fluentui/react';
import { TemplateDocumentModel } from '../../../../models/TemplateDocumentModel';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import { FormInputText } from '../FormComponents/FormInputText';

export interface IDocumentTemplateConfigProps {
    showInactive: boolean;
}

export interface IDocumentTemplateConfigState {
    draftModel: TemplateDocumentModel;
    showPane: boolean;
}

export default class DocumentTemplateConfig extends React.Component <IDocumentTemplateConfigProps, IDocumentTemplateConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;

    constructor(props: IDocumentTemplateConfigProps) {
        super(props);
        this.state = { draftModel: null, showPane: false };
    }

    public render(): React.ReactElement<IDocumentTemplateConfigProps> {
        return (
            <Stack className={styles.configZone} verticalFill={true}>
                <Label style={{ fontSize: '1.5rem' }}>Document Templates</Label>
                <Stack horizontal key={new Date().getTime()}>
                    {
                        AppService.AppSettings.templateDocuments
                        .filter(f => this.props.showInactive ? true : f.active)
                        .sort((a, b) => a.title > b.title ? 1 : (a.title < b.title ? -1 : 0))
                        .map(d => {
                            return (
                                <Stack.Item grow key={d.templateId} onClick={this.showPane.bind(this, d)}>
                                    <Stack className={styles.card} style={{ opacity: d.active ? 1 : 0.4 }}>
                                        <Label className={`${styles.pointer} ${styles.padBottom0}`}>{d.title}</Label>
                                    </Stack>
                                </Stack.Item>
                            );
                        })
                    }
                </Stack>
                { this.state.showPane &&
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
                        <Stack>
                            <FormInputText
                                labelValue={'Document Name'} editing={true}
                                fieldValue={this.state.draftModel.title}
                                fieldRef={'title'}
                                onUpdated={this.updateField.bind(this)}
                            />
                            <FormInputText
                                labelValue={'Document URL'} editing={true}
                                fieldValue={this.state.draftModel.documentUrl}
                                fieldRef={'documentUrl'}
                                onUpdated={this.updateField.bind(this)}
                            />
                        </Stack>
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
        if (item['data-automation-id'] === 'newTemplateDocument') {
                const newRecord = new TemplateDocumentModel({
                    title: 'New Doc Title',
                    documentUrl: AppService.AppSettings.miscSettings.documentTemplateLibraryName
                });
                this.setState({ draftModel: newRecord, showPane: true });
        }
        return Promise.resolve();
    }

    private showPane(model: TemplateDocumentModel): void {
        this.setState({ draftModel: model, showPane: true });
    }

    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftModel: null });
        } else {
            this.saveDocumentTemplate();
        }
    }

    private saveDocumentTemplate(): void {
        const tempDocs = AppService.AppSettings.templateDocuments
        .filter(f => f.templateId !== this.state.draftModel.templateId)
        .concat(this.state.draftModel)
        .sort((a, b) => a.title > b.title ? 1 : (a.title < b.title ? -1 : 0));

        AppService.UpdateAppSetting({ templateDocuments: tempDocs })
        .then(newSettings => {
            this.setState({ showPane: false, draftModel: null });
        })
        .catch(e => Promise.reject(e));
    }

    private updateField(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new TemplateDocumentModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftModel.title} [{this.state.draftModel.active ? 'Active' : 'InActive'}]
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveDocumentTemplate.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                        <FormInputToggle
                            labelValue={'Active Document Template'}
                            fieldValue={this.state.draftModel.active}
                            fieldRef={'active'}
                            onUpdated={this.updateField.bind(this)}
                            oneRow={true}
                        />
                    </Stack>
                </Stack>
            </div>
        );
    }
}
