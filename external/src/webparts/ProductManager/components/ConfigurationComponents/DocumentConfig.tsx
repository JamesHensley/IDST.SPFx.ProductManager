import * as React from 'react';
import { TaskTemplate } from '../../../../models/TaskTemplate';
import * as styles from '../ProductManager.module.scss';
import { DefaultButton, ICommandBarItemProps, IconButton, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack, Text } from '@fluentui/react';
import AppService from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { DocumentTemplate } from '../../../../models/DocumentTemplate';

export interface IDocumentConfigProps {
    model: DocumentTemplate;
    saveModel: (task: DocumentTemplate) => void;
}

export interface IDocumentConfigState {
    draftModel: DocumentTemplate;
    showPane: boolean;
    lastUpdated: number;
}

export default class DocumentConfig extends React.Component <IDocumentConfigProps, IDocumentConfigState> {
    private hasUpdates = false;

    constructor(props: IDocumentConfigProps) {
        super(props);
        this.state = { draftModel: this.props.model, showPane: false, lastUpdated: new Date().getTime() };
    }

    public render(): React.ReactElement<IDocumentConfigProps> {
        return (<>
                <Stack onClick={this.showPane.bind(this)} className={`${styles.pointer}`}>
                    <Stack.Item grow><Text>{this.state.draftModel.destDocName}</Text></Stack.Item>
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
                        <FormInputDropDown
                            labelValue='Document Template'
                            editing={true}
                            fieldRef={'docId'}
                            fieldValue={[this.state.draftModel.docId]}
                            onUpdated={this.updateField.bind(this)}
                            allowNull={true}
                            options={
                                AppService.AppSettings.templateDocuments
                                .map(d => {
                                    return {
                                        key: d.templateId,
                                        value: d.title,
                                        selected: d.templateId === this.state.draftModel.templateId
                                    } as KeyValPair;
                                })
                            }
                            disabledKeys={[]}
                        />
                        <FormInputText
                            labelValue={'Document Name'} editing={true}
                            fieldValue={this.state.draftModel.destDocName}
                            fieldRef={'destDocName'}
                            onUpdated={this.updateField.bind(this)}
                        />
                    </Panel>
                }
        </>);
    }

    private showPane(): void { this.setState({ showPane: true, draftModel: this.state.draftModel }); }

    private updateField(fieldVal: any, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new DocumentTemplate(this.state.draftModel), { [fieldRef]: fieldVal });
        this.setState({ draftModel: newModel });
    }

    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftModel: this.props.model });
        } else {
            this.saveDocument();
            this.setState({ showPane: false });
        }
    }

    private saveDocument(): void {
        this.props.saveModel(this.state.draftModel);
        this.setState({ showPane: false });
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {`Document [${this.state.draftModel.destDocName}]`}
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveDocument.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
}
