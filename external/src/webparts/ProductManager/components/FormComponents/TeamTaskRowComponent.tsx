import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import { TaskModel } from '../../../../models/TaskModel';
import { TeamTasksPaneComponent } from './TeamTasksPaneComponent';
import AppService from '../../../../services/AppService';
import { format } from 'date-fns';
import { TeamModel } from '../../../../models/TeamModel';

export interface ITeamTaskComponentProps {
    teamModel: TeamModel;
    teamTasks: Array<TaskModel>;
    teamClicked: (taskId: string) => void;
    tasksUpdated: (newTasks: Array<TaskModel>) => void;

    isPaneVisible: boolean;
    editing: boolean;
}

export class TeamTaskRowComponent extends React.Component<ITeamTaskComponentProps, {}> {
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    render(): React.ReactElement<ITeamTaskComponentProps> {
        const lastSuspense = new Date(Math.max(...this.props.teamTasks.map(d => new Date(d.taskSuspense).getTime())));
        return(
            <>
                { this.props.isPaneVisible &&
                    <TeamTasksPaneComponent
                        updateTasksCallback={this.teamTasksUpdated.bind(this)}
                        cancelCallBack={this.taskPaneCancel.bind(this)}
                        committedTasks={this.props.teamTasks}
                        isEditing={this.props.editing}
                    />
                }
                <div className={this.row} onClick={this.teamClicked.bind(this, this.props.teamModel)}>
                    <div className={styles.gridCol2}></div>
                    <div className={styles.gridCol2}>{this.props.teamModel.name}</div>
                    <div className={styles.gridCol5}></div>
                    <div className={styles.gridCol3}>{format(lastSuspense, AppService.DateFormatView)}</div>
                </div>
            </>
        );
    }

    private teamClicked(team: TeamModel): void {
        this.props.teamClicked(team.id);
    }

    private teamTasksUpdated(newTasks: Array<TaskModel>): void {
        // console.log('TeamTaskComponent.taskPaneUpdate: ', newTask);
        this.props.tasksUpdated(newTasks);
    }

    private taskPaneCancel(): void {
        this.props.tasksUpdated(null);
    }

    public componentDidMount(): void {
        // console.log('TeamTaskComponentPane.componentDidMount: ', this.props, this.state);
    }
    public componentWillUnmount(): void {
        // console.log('TeamTaskComponentPane.componentWillUnmount: ', this.props, this.state);
    }
}
