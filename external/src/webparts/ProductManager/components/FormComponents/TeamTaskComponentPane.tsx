import * as React from 'react';
import { Panel, PanelType, Stack, DefaultButton } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { FormInputDate } from './FormInputDate';
import { FormInputText } from './FormInputText';
import { FormInputDropDown } from './FormInputDropDown';
import AppService from '../../../../services/AppService';
import { KeyValPair } from './IFormInputProps';

export interface ITeamTaskComponentPaneProps {
    committedTask: TaskModel;
    updateCallback: (task: TaskModel) => void;
    cancelCallBack: (taskId: string) => void;
    isEditing: boolean;
}

export interface ITeamTaskComponentPaneState {
    draftTask: TaskModel;
}

export class TeamTaskComponentPane extends React.Component<ITeamTaskComponentPaneProps, ITeamTaskComponentPaneState> {
    constructor(props: ITeamTaskComponentPaneProps) {
        super(props);
        this.state = {
            draftTask: JSON.parse(JSON.stringify(this.props.committedTask))
        };
    }

    public render(): React.ReactElement<ITeamTaskComponentPaneProps> {
        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss={!this.props.isEditing}
                isHiddenOnDismiss={false}
                headerText={this.state.draftTask ? `${AppService.AppSettings.teams.reduce((t,n) => n.id === this.state.draftTask.taskedTeamId ? n.name : t, '')}` : ''}
                isOpen={true}
                onDismiss={this.togglePanelVisibility.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                <div className={styles.grid}>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                {this.props.isEditing && <DefaultButton onClick={this.updateRecord.bind(this)} disabled={!this.props.isEditing}>Save</DefaultButton>}
                                {this.props.isEditing && <DefaultButton onClick={this.cancelUpdate.bind(this)} disabled={!this.props.isEditing}>Cancel</DefaultButton>}
                            </Stack>

                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <Stack.Item grow={1}>
                                    <FormInputDropDown
                                        labelValue={'Tasked Team'}
                                        fieldValue={this.state.draftTask.taskedTeamId}
                                        fieldRef={'taskedTeamId'}
                                        onUpdated={this.fieldUpdated.bind(this)}
                                        editing={this.props.isEditing}
                                        options={AppService.AppSettings.teams.map(d => { return { key: d.id, value: d.name } as KeyValPair; })}
                                    />
                                </Stack.Item>
                                <Stack.Item grow={1}>
                                    <FormInputDropDown
                                        labelValue={'Task Status'}
                                        fieldValue={this.state.draftTask.taskState}
                                        fieldRef={'taskState'}
                                        onUpdated={this.statusChanged.bind(this)}
                                        editing={this.props.isEditing}
                                        options={ [
                                            { key: TaskState.pending, value: 'Pending' } as KeyValPair,
                                            { key: TaskState.working, value: 'Working' } as KeyValPair,
                                            { key: TaskState.complete, value: 'Complete' } as KeyValPair
                                        ] }
                                    />
                                </Stack.Item>
                            </Stack>

                            <FormInputText
                                labelValue={'Task Description'}
                                fieldValue={this.state.draftTask.taskDescription}
                                fieldRef={'taskDescription'}
                                onUpdated={this.fieldUpdated.bind(this)}
                                editing={this.props.isEditing}
                                editLines={12}
                            />
                            <FormInputDate
                                labelValue={'Suspense Date'}
                                fieldValue={this.state.draftTask.taskSuspense}
                                fieldRef={'taskSuspense'}
                                onUpdated={this.fieldUpdated.bind(this)}
                                editing={this.props.isEditing}
                            />
                        </div>
                    </div>
                </div>
            </Panel>
        );
    }

    private statusChanged(fieldValue: string, fieldRef: string): void {
        if (fieldValue === 'Pending') { this.state.draftTask.taskStart = new Date(); }
        if (fieldValue === 'Complete') { this.state.draftTask.taskFinish = new Date(); }
        this.fieldUpdated(fieldValue, fieldRef);
    }

    private fieldUpdated(fieldValue: string, fieldRef: string): void {
        let newDraft = new TaskModel();
        Object.assign(newDraft, this.state.draftTask);
        //const newDraft = JSON.parse(JSON.stringify(this.state.draftTask));
        newDraft[fieldRef] = fieldValue;
        this.setState({ draftTask: newDraft });
    }

    private updateRecord(): void {
        // console.log('TeamTaskComponentPane.updateRecord', this.state.draftTask);
        this.props.updateCallback(this.state.draftTask);
    }

    private cancelUpdate(): void {
        // console.log('TeamTaskComponentPane.cancelUpdate', this.state.draftTask);
        this.props.cancelCallBack(this.state.draftTask.taskGuid);
    }

    private togglePanelVisibility(): void {
        // console.log('TeamTaskComponentPane.togglePanelVisibility', this.state.draftTask);
        this.props.cancelCallBack(this.props.committedTask.taskGuid);
    }

    public componentDidMount(): void {
        console.log('TeamTaskComponentPane.componentDidMount: ', this.props, this.state);
    }

    public componentWillUnmount(): void {
        console.log('TeamTaskComponentPane.componentWillUnmount: ', this.props, this.state);
    }
}
