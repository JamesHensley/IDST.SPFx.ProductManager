import * as React from 'react';
import { Panel, PanelType, Stack, DefaultButton, Separator } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { TeamTaskFormComponent } from './TeamTaskFormComponent';
import { TeamModel } from '../../../../models/TeamModel';

export interface ITeamTasksPaneComponentProps {
    committedTasks: Array<TaskModel>;
    teamModel: TeamModel;
    isEditing: boolean;
    updateTasksCallback: (tasks: Array<TaskModel>) => void;
    cancelCallBack: () => void;
}

export interface ITeamTasksPaneComponentState {
    draftTasks: Array<TaskModel>;
}

export class TeamTasksPaneComponent extends React.Component<ITeamTasksPaneComponentProps, ITeamTasksPaneComponentState> {
    constructor(props: ITeamTasksPaneComponentProps) {
        super(props);
        this.state = { draftTasks: this.props.committedTasks };
    }

    public render(): React.ReactElement<ITeamTasksPaneComponentProps> {
        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss={!this.props.isEditing}
                isHiddenOnDismiss={false}
                isOpen={true}
                onDismiss={this.cancelUpdateTasks.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
                headerText={this.props.teamModel.name}
            >
                <Stack horizontal>
                    <Stack.Item grow>
                        <Stack horizontal tokens={{ childrenGap: 10 }}>
                            {this.props.isEditing && <DefaultButton onClick={this.updateTasks.bind(this)} disabled={!this.props.isEditing}>Save</DefaultButton>}
                            {this.props.isEditing && <DefaultButton onClick={this.cancelUpdateTasks.bind(this)} disabled={!this.props.isEditing}>Cancel</DefaultButton>}
                        </Stack>
                    </Stack.Item>
                    <Stack.Item>
                        {this.props.isEditing && <DefaultButton onClick={this.addTask.bind(this)} disabled={!this.props.isEditing}>Add Task</DefaultButton>}
                    </Stack.Item>
                </Stack>
                {
                    this.state.draftTasks
                    .sort((a, b) => a.taskSuspense > b.taskSuspense ? 1 : (a.taskSuspense < b.taskSuspense ? -1 : 0))
                    .map(d => {
                        return (
                            <div key={d.taskGuid}>
                                <Separator />
                                <TeamTaskFormComponent
                                    key={d.taskGuid}
                                    committedTask={d}
                                    isEditing={this.props.isEditing}
                                    updateCallback={this.taskUpdated.bind(this)}
                                />
                            </div>
                        );
                    })
                }
            </Panel>
        );
    }

    private addTask(): void {
        const newTask: TaskModel = new TaskModel({
            taskedTeamId: this.props.teamModel.teamId,
            taskGuid: uuidv4(),
            taskDescription: 'New Task',
            taskState: TaskState.pending,
            taskSuspense: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 3)).toJSON()
        });

        const newTasks = this.state.draftTasks.concat([newTask]);
        this.setState({ draftTasks: newTasks });
    }

    private taskUpdated(task: TaskModel): void {
        const newTasks = this.state.draftTasks.filter(f => f.taskGuid !== task.taskGuid).concat([task]);
        this.setState({ draftTasks: newTasks });
    }

    private updateTasks(): void {
        this.props.updateTasksCallback(this.state.draftTasks);
    }

    private cancelUpdateTasks(): void {
        this.props.cancelCallBack();
    }
}
