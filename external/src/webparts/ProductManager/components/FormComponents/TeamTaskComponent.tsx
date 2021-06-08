import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import { TaskModel } from '../../../../models/TaskModel';
import { TeamTaskComponentPane } from './TeamTaskComponentPane';
import AppService from '../../../../services/AppService';

export interface ITeamTaskComponentProps {
    taskUpdated: (newTask: TaskModel) => void;
    taskClicked: (taskId: string) => void;
    taskUpdateCancel: (taskId: string) => void;
    task: TaskModel;
    isPaneVisible: boolean;
    editing: boolean;
}

export class TeamTaskComponent extends React.Component<ITeamTaskComponentProps, {}> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    render(): React.ReactElement<ITeamTaskComponentProps> {
        console.log('TeamTaskComponent.render: ', this.props, this.state);
        return(
            <div key={this.props.task.taskGuid} className={this.row} onClick={this.taskClicked.bind(this, this.props.task)}>
                {
                    this.props.isPaneVisible &&
                    <TeamTaskComponentPane
                        updateCallback={this.taskPaneUpdate.bind(this)}
                        cancelCallBack={this.taskPaneCancel.bind(this)}
                        committedTask={this.props.task}
                        isEditing={this.props.editing}
                    />
                }
                <div className={styles.gridCol1}></div>
                <div className={styles.gridCol2}>{this.props.task.taskState}</div>
                <div className={styles.gridCol2}>{AppService.AppSettings.teams.reduce((t,n) => n.id === this.props.task.taskedTeamId ? n.name : t, '')}</div>
                <div className={styles.gridCol7}>{this.props.task.taskDescription}</div>
            </div>
        );
    }

    private taskClicked(task: TaskModel): void {
        // console.log('TeamTaskComponent.taskClicked: ', task);
        this.props.taskClicked(task.taskGuid);
    }

    private taskPaneUpdate(newTask: TaskModel): void {
        // console.log('TeamTaskComponent.taskPaneUpdate: ', newTask);
        this.props.taskUpdated(newTask);
    }

    private taskPaneCancel(newTask: TaskModel): void {
        // console.log('TeamTaskComponent.taskPaneCancel: ', newTask);
        this.props.taskUpdateCancel(newTask.taskGuid);
    }

    public componentDidMount(): void {
        // console.log('TeamTaskComponentPane.componentDidMount: ', this.props, this.state);
    }
    public componentWillUnmount(): void {
        // console.log('TeamTaskComponentPane.componentWillUnmount: ', this.props, this.state);
    }
}
