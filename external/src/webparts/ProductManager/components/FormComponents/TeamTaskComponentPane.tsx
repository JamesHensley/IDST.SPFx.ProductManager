import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';
import { Label } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { FormInputDate } from './FormInputDate';
import { FormInputText } from './FormInputText';
import { FormInputDropDown } from './FormInputDropDown';
import AppService from '../../../../services/AppService';
import { kvp } from './IFormInputProps';

export interface ITeamTaskComponentPaneProps {
    committedTask: TaskModel;
    updateCallback: (task: TaskModel) => void;
    cancelCallBack: (taskId: string) => void;
    isEditing: boolean
}

export interface ITeamTaskComponentPaneState {
    draftTask: TaskModel;
}

export class TeamTaskComponentPane extends React.Component<ITeamTaskComponentPaneProps, ITeamTaskComponentPaneState> {
    constructor(props: ITeamTaskComponentPaneProps) {
        super(props);
        console.log('TeamTaskComponentPane.constructor: ', this.props);
        
        this.state = {
            draftTask: JSON.parse(JSON.stringify(this.props.committedTask))
        }
    }

    public render(): React.ReactElement<ITeamTaskComponentPaneProps> {
        // console.log('TeamTaskComponentPane.render: ', this.props, this.state);
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
                            <Stack horizontal tokens={{childrenGap: 10}}>
                                {this.props.isEditing && <DefaultButton onClick={this.updateRecord.bind(this)} disabled={!this.props.isEditing}>Save</DefaultButton>}
                                {this.props.isEditing && <DefaultButton onClick={this.cancelUpdate.bind(this)} disabled={!this.props.isEditing}>Cancel</DefaultButton>}
                            </Stack>

                            <Stack horizontal tokens={{childrenGap: 10}}>
                                <Stack.Item grow={1}>
                                    <FormInputDropDown
                                        labelValue={'Tasked Team'}
                                        fieldValue={this.state.draftTask.taskedTeamId}
                                        fieldRef={'taskedTeamId'}
                                        onUpdated={this.fieldUpdated.bind(this)}
                                        editing={this.props.isEditing}
                                        options={AppService.AppSettings.teams.map(d => { return { key: d.id, value: d.name } as kvp })}
                                    />
                                </Stack.Item>
                                <Stack.Item grow={1}>
                                    <FormInputDropDown
                                        labelValue={'Task Status'}
                                        fieldValue={this.state.draftTask.taskState}
                                        fieldRef={'taskState'}
                                        onUpdated={this.fieldUpdated.bind(this)}
                                        editing={this.props.isEditing}
                                        options={ [
                                            { key: TaskState.pending, value: 'Pending'} as kvp,
                                            { key: TaskState.working, value: 'Working'} as kvp,
                                            { key: TaskState.complete, value: 'Complete'} as kvp
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

    private fieldUpdated(fieldValue: string, fieldRef: string): void {
        const newDraft = JSON.parse(JSON.stringify(this.state.draftTask))
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

    public componentDidMount() {
        console.log('TeamTaskComponentPane.componentDidMount: ', this.props, this.state);
    }

    public componentWillUnmount() {
        console.log('TeamTaskComponentPane.componentWillUnmount: ', this.props, this.state);
    }
}