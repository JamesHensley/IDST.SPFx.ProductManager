import * as React from 'react';
import { DefaultButton, IPanelHeaderRenderer, Label, Panel, PanelType, Stack, Text } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { MiscSettingsModel } from '../../../../models/MiscSettingsModel';

export interface IStringConfigProps { }

export interface IStringConfigState {
    showPane: boolean;
    draftModel: MiscSettingsModel;
}

export default class StringConfig extends React.Component <IStringConfigProps, IStringConfigState> {
    private hasUpdates = false;

    constructor(props: IStringConfigProps) {
        super(props);
        this.state = { showPane: false, draftModel: AppService.AppSettings.miscSettings };
    }

    public render(): React.ReactElement<IStringConfigProps> {
        return (
            <>
                <Stack className={styles.configZone} verticalFill>
                    <Label style={{ fontSize: '1.5rem' }}>Misc Settings</Label>
                    <Stack className={`${styles.card} ${styles.pointer}`} onClick={this.showPane.bind(this)}>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>Sender Name For Email Notifications</Label>
                            <Text>{AppService.AppSettings.miscSettings.emailSenderName}</Text>
                        </Stack.Item>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>URL for template documents</Label>
                            <Text>{AppService.AppSettings.miscSettings.documentLibraryName}</Text>
                        </Stack.Item>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>List name for product data</Label>
                            <Text>{AppService.AppSettings.miscSettings.productListTitle}</Text>
                        </Stack.Item>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>URL of library for publishing finished products</Label>
                            <Text>{AppService.AppSettings.miscSettings.publishingLibraryUrl}</Text>
                        </Stack.Item>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>URL of library where FluentUI assets are held</Label>
                            <Text>{AppService.AppSettings.miscSettings.fluentUiCDN}</Text>
                        </Stack.Item>
                    </Stack>
                </Stack>
                <Panel
                    className={styles.productDetailPane}
                    isHiddenOnDismiss={false}
                    isLightDismiss={!this.hasUpdates}
                    isOpen={this.state.showPane}
                    onDismiss={this.closePane.bind(this)}
                    closeButtonAriaLabel='Close'
                    type={PanelType.medium}
                    headerText={'Miscellaneous App Settings'}
                    onRenderHeader={this.getPaneHeader.bind(this)}
                >
                    <Stack>
                        <FormInputText
                            labelValue={'Sender Name For Email Notifications'}
                            editing={true}
                            fieldValue={this.state.draftModel.emailSenderName}
                            fieldRef={'emailSenderName'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Library name for product documents'}
                            editing={true}
                            fieldValue={this.state.draftModel.documentLibraryName}
                            fieldRef={'documentLibraryName'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Library name for template documents'}
                            editing={true}
                            fieldValue={this.state.draftModel.documentTemplateLibraryName}
                            fieldRef={'documentTemplateLibraryName'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'List name where product data will be stored'}
                            editing={true}
                            fieldValue={this.state.draftModel.productListTitle}
                            fieldRef={'productListTitle'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'URL of library for publishing finished products'}
                            editing={true}
                            fieldValue={this.state.draftModel.publishingLibraryUrl}
                            fieldRef={'publishingLibraryUrl'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'URL of library where FluentUI assets are held'}
                            editing={true}
                            fieldValue={this.state.draftModel.fluentUiCDN}
                            fieldRef={'fluentUiCDN'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                    </Stack>
                </Panel>
            </>
        );
    }

    private showPane(): void { this.setState({ showPane: true }); }

    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftModel: AppService.AppSettings.miscSettings });
        } else {
            this.saveSettings();
        }
    }

    private updateVal(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;

        const newModel = Object.assign({}, this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private saveSettings(): void {
        AppService.UpdateAppSetting({ miscSettings: this.state.draftModel })
        .then(newSettings => {
            this.hasUpdates = false;
            this.setState({ draftModel: AppService.AppSettings.miscSettings, showPane: false });
        })
        .catch(e => Promise.reject(e));
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>Miscellaneous App Settings</Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveSettings.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
}
