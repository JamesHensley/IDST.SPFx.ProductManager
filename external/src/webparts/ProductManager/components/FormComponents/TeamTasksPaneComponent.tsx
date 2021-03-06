import * as React from 'react';
import { Panel, PanelType, Stack, DefaultButton, Separator, IconButton } from '@fluentui/react';
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
    removeTeamTasksCallback: (teamId: string) => void;
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
                <Stack>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                {this.props.isEditing && <DefaultButton onClick={this.updateTasks.bind(this)} disabled={!this.props.isEditing}>Save</DefaultButton>}
                                {this.props.isEditing && <DefaultButton onClick={this.cancelUpdateTasks.bind(this)} disabled={!this.props.isEditing}>Cancel</DefaultButton>}
                            </Stack>
                        </Stack.Item>
                        <Stack.Item grow>
                            {this.props.isEditing && <DefaultButton onClick={this.addTask.bind(this)} disabled={!this.props.isEditing}>Add Task</DefaultButton>}
                        </Stack.Item>
                    </Stack>
                    <Stack.Item key={new Date().getTime()}>
                        {
                            this.state.draftTasks
                            .sort((a, b) => a.taskSuspense > b.taskSuspense ? 1 : (a.taskSuspense < b.taskSuspense ? -1 : 0))
                            .map(d => {
                                return (
                                    <div key={d.taskGuid}>
                                        <Separator />
                                        <TeamTaskFormComponent
                                            committedTask={d}
                                            isEditing={this.props.isEditing}
                                            updateCallback={this.taskUpdated.bind(this)}
                                            removeCallBack={this.removeTask.bind(this)}
                                        />
                                    </div>
                                );
                            })
                        }
                    </Stack.Item>
                </Stack>
            </Panel>
        );
    }

    private addTask(): void {
        const newTask: TaskModel = new TaskModel({
            taskedTeamId: this.props.teamModel.teamId,
            taskGuid: uuidv4(),
            taskDescription: 'New Task',
            taskState: TaskState.Pending,
            taskSuspense: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 3)).toJSON()
        });

        const newTasks = this.state.draftTasks.concat([newTask]);
        this.setState({ draftTasks: newTasks });
    }

    private removeTask(task: TaskModel): void {
        const newTasks = this.state.draftTasks.filter(f => f.taskGuid !== task.taskGuid);
        if (newTasks.length === 0) {
            this.props.removeTeamTasksCallback(task.taskedTeamId);
        } else {
            this.setState({ draftTasks: newTasks });
        }
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
