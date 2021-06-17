import * as React from 'react';
import { Label, IconButton } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { TeamTaskRowComponent } from './TeamTaskRowComponent';
import AppService from '../../../../services/AppService';
import { TeamModel } from '../../../../models/TeamModel';

export interface ITaskPaneState {
    teamId: string;
    isPaneVisible: boolean;
}
export interface ITaskComponentProps {
    TaskItems: Array<TaskModel>;
    isEditing: boolean;
    onUpdated: (newVal: string, fieldRef: string) => void;
    onTaskAdded: (newTask: TaskModel) => void;
}

export interface ITaskComponentState {
    taskPanes: Array<ITaskPaneState>;
}

export class TaskComponent extends React.Component<ITaskComponentProps, ITaskComponentState> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private teamIds: Array<String> = [];
    private teamModels: Array<TeamModel> = [];
    
    constructor(props: ITaskComponentProps) {
        super(props);

        this.teamIds = (this.props.TaskItems || []).map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) == i);
        this.teamModels = AppService.AppSettings.teams.reduce((t, n) => (this.teamIds.indexOf(n.id) >= 0) ? t.concat([n]) : t, [])

        this.state = {
            taskPanes: this.teamIds.map(d => { return { teamId: d, isPaneVisible: false } as ITaskPaneState; })
        };
    }

    render(): React.ReactElement<ITaskComponentProps> {
        // const teams = (this.props.TaskItems || []).map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) == i);
        // const teamModels: Array<TeamModel> = AppService.AppSettings.teams.reduce((t, n) => teams.indexOf(n.id) ? t.concat([n]) : t, [])
        return (
            <div className={`${this.grid} ${styles.padTop3}`}>
                <Label>Teams and Tasks</Label>
                <div className={styles.gridRow}>
                    <Label className={styles.gridCol2} style={{ fontSize: '.9rem' }}>Status</Label>
                    <Label className={styles.gridCol2} style={{ fontSize: '.9rem' }}>Team</Label>
                    <Label className={styles.gridCol5} style={{ fontSize: '.9rem' }}>Task Description</Label>
                    <Label className={styles.gridCol3} style={{ fontSize: '.9rem' }}>Suspense</Label>
                </div>
                {
                    this.teamModels.map(team => {
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
            </div>
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

    private teamTasksUpdated(newTasks: Array<TaskModel>): void {
        if (newTasks) {
            // Save tasks
            // const newTasks: any = this.props.TaskItems.reduce((t,n) => n.taskGuid !== newTask.taskGuid ? t.concat(n) : t.concat(newTask), []);
            // this.props.onUpdated(newTasks, 'tasks');
        }
        else {
            //User canceled
        }
        const newPanes = this.state.taskPanes.map(d => { return { teamId: d.teamId, isPaneVisible: false } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes });
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
