import * as React from 'react';
import { TaskTemplate } from '../../../../models/TaskTemplate';
import * as styles from '../ProductManager.module.scss';
import { DefaultButton, ICommandBarItemProps, IconButton, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack, Text } from '@fluentui/react';
import AppService from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';

export interface ITaskConfigProps {
    task: TaskTemplate;
    saveTask: (task: TaskTemplate) => void;
}

export interface ITaskConfigState {
    draftModel: TaskTemplate;
    showPane: boolean;
    lastUpdated: number;
}

export default class TaskTemplateConfig extends React.Component <ITaskConfigProps, ITaskConfigState> {
    private hasUpdates = false;

    constructor(props: ITaskConfigProps) {
        super(props);
        this.state = { draftModel: this.props.task, showPane: false, lastUpdated: new Date().getTime() };
    }

    public render(): React.ReactElement<ITaskConfigProps> {
        const teamName = AppService.AppSettings.teams.reduce((t,n) => n.teamId === this.state.draftModel.teamId ? n.name : t, '');
        return (
            <>
                <Stack onClick={this.showPane.bind(this)} className={`${styles.pointer}`}>
                    <Stack.Item grow><Text>{teamName}</Text></Stack.Item>
                    <Stack.Item grow>
                        <Text className={`${styles.padLeft2} ${styles.padBottom1}`}>{this.state.draftModel.taskDescription}</Text>
                    </Stack.Item>
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
                            labelValue='Tasked Team'
                            editing={true}
                            fieldRef={'teamId'}
                            fieldValue={[this.state.draftModel.teamId]}
                            onUpdated={this.updateField.bind(this)}
                            allowNull={true}
                            options={
                                AppService.AppSettings.teams
                                .map(d => {
                                    return {
                                        key: d.teamId,
                                        value: d.shortName,
                                        selected: d.teamId === this.state.draftModel.teamId
                                    } as KeyValPair;
                                })
                            }
                            disabledKeys={AppService.AppSettings.teams.filter(f => !f.active).map(d => d.teamId)}
                        />
                        <FormInputText
                            labelValue={'Task Description'} editing={true}
                            fieldValue={this.state.draftModel.taskDescription}
                            fieldRef={'taskDescription'}
                            onUpdated={this.updateField.bind(this)}
                            editLines={4}
                        />
                        <FormInputText
                            labelValue={'Task Order'} editing={true}
                            fieldValue={this.state.draftModel.taskOrder}
                            fieldRef={'taskOrder'}
                            onUpdated={this.updateField.bind(this)}
                        />
                    </Panel>
                }
            </>
        );
    }

    private showPane(): void { this.setState({ showPane: true, draftModel: this.state.draftModel }); }

    private updateField(fieldVal: any, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new TaskTemplate(), this.state.draftModel);
        newModel[fieldRef] = fieldRef !== 'taskOrder' ? fieldVal : parseInt(fieldVal, 10);
        this.setState({ draftModel: newModel });
    }

    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftModel: this.props.task });
        } else {
            this.saveTask();
            this.setState({ showPane: false });
        }
    }

    private saveTask(): void {
        this.props.saveTask(this.state.draftModel);
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {`Task [${this.state.draftModel.taskOrder}]`}
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveTask.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
}
