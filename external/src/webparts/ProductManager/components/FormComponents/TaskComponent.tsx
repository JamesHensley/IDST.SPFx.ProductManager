import * as React from 'react';
import { Label, Stack } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel } from '../../../../models/TaskModel';
import { TeamTaskRowComponent } from './TeamTaskRowComponent';
import AppService from '../../../../services/AppService';
import { TeamModel } from '../../../../models/TeamModel';

export interface ITaskComponentProps {
    TaskItems: Array<TaskModel>;
    isEditing: boolean;
    onUpdated: (newVal: Array<TaskModel>) => void;
}

export interface ITaskPaneState {
    teamId: string;
    isPaneVisible: boolean;
}

export interface ITaskComponentState {
    taskPanes: Array<ITaskPaneState>;
    draftTasks: Array<TaskModel>;
}

export class TaskComponent extends React.Component<ITaskComponentProps, ITaskComponentState> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    // private teamIds: Array<String> = [];
    // private teamModels: Array<TeamModel> = [];

    constructor(props: ITaskComponentProps) {
        super(props);
        
        const panes = this.props.TaskItems.map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) == i).map(d => { return { teamId: d, isPaneVisible: false } as ITaskPaneState; });
        this.state = {
            taskPanes: panes,
            draftTasks: this.props.TaskItems
        };
    }

    private get teamModels(): Array<TeamModel> {
        const teamIds = (this.state.draftTasks || this.props.TaskItems || []).map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) == i);
        return AppService.AppSettings.teams.reduce((t, n) => (teamIds.indexOf(n.id) >= 0) ? t.concat([n]) : t, [])
    }

    render(): React.ReactElement<ITaskComponentProps> {
        const stackItemStyles = { root: { display: 'flex', minWidth: '50%', cursor: 'pointer' } };
        return (
            <Stack styles={{ root: { display: 'flex' }}}>
                <Label>Teams and Tasks</Label>
                <Stack horizontal>
                    <Stack.Item styles={{ root: { width: '20%'}}}><Label style={{ fontSize: '.9rem' }}>Team</Label></Stack.Item>
                    <Stack.Item styles={{ root: { width: '60%'}}}><Label style={{ fontSize: '.9rem' }}>Status</Label></Stack.Item>
                    <Stack.Item styles={{ root: { width: '20%'}}}><Label style={{ fontSize: '.9rem' }}>Suspense</Label></Stack.Item>
                </Stack>
                {
                    this.teamModels.map((team: TeamModel) => {
                        const paneState: ITaskPaneState = this.state.taskPanes.reduce((t, n) => n.teamId === team.id ? n : t, null);
                        return (
                            <TeamTaskRowComponent
                                key={team.id}
                                teamModel={team}
                                teamTasks={(this.props.TaskItems || []).filter(f => f.taskedTeamId === team.id)}
                                isPaneVisible={paneState.isPaneVisible}
                                editing={this.props.isEditing}
                                tasksUpdated={this.teamTasksUpdated.bind(this)}
                                teamClicked={this.teamClicked.bind(this)}
                            />
                        );
                    })
                }
            </Stack>
        );
    }

    private createNewTask(): void {
        /*
        const newTask = new TaskModel();
        newTask.taskDescription = 'New Task';
        newTask.taskGuid = uuidv4();
        newTask.taskedTeamId = AppService.AppSettings.teams[0].id;
        newTask.taskState = TaskState.pending;
        newTask.taskSuspense = new Date(new Date().getTime() + (1000 * 60 * 60 * 7)).toJSON();

        const newTaskPanes = this.state.taskPanes
            .map(d => { return { isPaneVisible: false, taskId: d.taskId } as ITaskPaneState; })
            .concat([{ isPaneVisible: true, taskId: newTask.taskGuid } as ITaskPaneState]);
        this.setState({ taskPanes: newTaskPanes });
        this.props.onTaskAdded(newTask);
        */
    }

    /** Called when a user clicks the SAVE or CANCEL button on a Teams task pane */
    private teamTasksUpdated(newTasks: Array<TaskModel>): void {
        let newDrafts: Array<TaskModel> = [];
        if (newTasks) {
            // Save tasks
            const teams = newTasks.map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) == i);
            newDrafts = this.state.draftTasks.filter(f => teams.indexOf(f.taskedTeamId) < 0).concat(newTasks);
        }
        else {
            //User canceled
            newDrafts = this.props.TaskItems;
        }
        const newPanes = this.state.taskPanes.map(d => { return { teamId: d.teamId, isPaneVisible: false } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes, draftTasks: newDrafts });
        this.props.onUpdated(newDrafts);
    }

    private taskEditCancel(taskId: string): void {
        // const newPanes = this.state.taskPanes.map(d => { return { taskId: d.taskId, isPaneVisible: false } as ITaskPaneState; });
        // this.setState({ taskPanes: newPanes });
    }

    private teamClicked(teamId: string): void {
        const newPanes = this.state.taskPanes.map(d => { return { teamId: d.teamId, isPaneVisible: (d.teamId === teamId) } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes });
    }
}
