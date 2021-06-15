import * as React from 'react';
import { Label, IconButton } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { TeamTaskComponent } from './TeamTaskComponent';
import AppService from '../../../../services/AppService';

export interface ITaskPaneState {
    taskId: string;
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
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    constructor(props: ITaskComponentProps) {
        super(props);
        this.state = {
            taskPanes: this.props.TaskItems.map(d => { return { taskId: d.taskGuid, isPaneVisible: false } as ITaskPaneState; })
        };
    }

    render(): React.ReactElement<ITaskComponentProps> {
        return (
            <div className={`${this.grid} ${styles.padTop3}`}>
                <Label>Teams and Tasks</Label>
                <div className={styles.gridRow}>
                    <Label className={styles.gridCol2} style={{ fontSize: '.9rem' }}>Status</Label>
                    <Label className={styles.gridCol2} style={{ fontSize: '.9rem' }}>Team</Label>
                    <Label className={styles.gridCol5} style={{ fontSize: '.9rem' }}>Task Description</Label>
                    <Label className={styles.gridCol3} style={{ fontSize: '.9rem' }}>Suspense</Label>
                </div>
                {(this.props.TaskItems || []).map(a => {
                    const paneState: ITaskPaneState = this.state.taskPanes.reduce((t,n) => n.taskId === a.taskGuid ? n : t, null);
                    return (
                        <TeamTaskComponent
                            task={a}
                            isPaneVisible={paneState.isPaneVisible}
                            key={a.taskGuid}
                            editing={this.props.isEditing}
                            taskUpdated={this.taskUpdated.bind(this)}
                            taskClicked={this.taskClicked.bind(this)}
                            taskUpdateCancel={this.taskEditCancel.bind(this)}
                        />
                    );
                })}
            </div>
        );
    }

    private createNewTask(): void {
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
    }

    private taskUpdated(newTask: TaskModel): void {
        const newTasks: any = this.props.TaskItems.reduce((t,n) => n.taskGuid !== newTask.taskGuid ? t.concat(n) : t.concat(newTask), []);
        const newPanes = this.state.taskPanes.map(d => { return { taskId: d.taskId, isPaneVisible: false } as ITaskPaneState; });

        this.props.onUpdated(newTasks, 'tasks');
        this.setState({ taskPanes: newPanes });
    }

    private taskEditCancel(taskId: string): void {
        const newPanes = this.state.taskPanes.map(d => { return { taskId: d.taskId, isPaneVisible: false } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes });
    }

    private taskClicked(taskId: string): void {
        const newPanes = this.state.taskPanes.map(d => { return { taskId: d.taskId, isPaneVisible: (d.taskId === taskId) } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes });
    }
}
