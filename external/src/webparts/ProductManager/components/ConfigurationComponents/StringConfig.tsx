import * as React from 'react';
import { DefaultButton, Label, Panel, PanelType, Stack, Text } from '@fluentui/react';
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
                            <Text>{AppService.AppSettings.miscSettings.documentListUrl}</Text>
                        </Stack.Item>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>URL for product data</Label>
                            <Text>{AppService.AppSettings.miscSettings.productListUrl}</Text>
                        </Stack.Item>
                        <Stack.Item style={{ marginBottom: 10 }}>
                            <Label>URL of library for publishing finished products</Label>
                            <Text>{AppService.AppSettings.miscSettings.publishingLibraryUrl}</Text>
                        </Stack.Item>
                    </Stack>
                </Stack>
                <Panel
                    className={styles.productDetailPane}
                    isHiddenOnDismiss={false}
                    isLightDismiss={true}
                    isOpen={this.state.showPane}
                    onDismiss={this.closePane.bind(this)}
                    closeButtonAriaLabel='Close'
                    type={PanelType.medium}
                    headerText={'Miscellaneous App Settings'}
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
                            labelValue={'URL for template documents'}
                            editing={true}
                            fieldValue={this.state.draftModel.documentListUrl}
                            fieldRef={'documentListUrl'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'URL for product data'}
                            editing={true}
                            fieldValue={this.state.draftModel.productListUrl}
                            fieldRef={'productListUrl'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'URL of library for publishing finished products'}
                            editing={true}
                            fieldValue={this.state.draftModel.publishingLibraryUrl}
                            fieldRef={'publishingLibraryUrl'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                    </Stack>
                </Panel>
            </>
        );
    }

    private showPane(): void { this.setState({ showPane: true }); }

    private closePane(): void {
        if (this.hasUpdates) {
            this.saveSettings();
        } else {
            this.setState({ showPane: false, draftModel: AppService.AppSettings.miscSettings });
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
}
