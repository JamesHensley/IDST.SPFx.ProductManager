import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { TeamTasksPaneComponent } from './TeamTasksPaneComponent';
import AppService from '../../../../services/AppService';
import { format } from 'date-fns';
import { TeamModel } from '../../../../models/TeamModel';
import { Stack } from '@fluentui/react';
import { MetricService } from '../../../../services/MetricService';

export interface ITeamTaskComponentProps {
    teamModel: TeamModel;
    teamTasks: Array<TaskModel>;
    teamClicked: (taskId: string) => void;
    tasksUpdated: (newTasks: Array<TaskModel>) => void;

    isPaneVisible: boolean;
    editing: boolean;
}

export class TeamTaskRowComponent extends React.Component<ITeamTaskComponentProps, {}> {
    render(): React.ReactElement<ITeamTaskComponentProps> {
        const completed = this.props.teamTasks.filter(f => f.taskState == TaskState.complete).length;
        const teamStatus: string = `${completed} of ${this.props.teamTasks.length} complete`
    
        const lastSuspense = new Date(Math.max(...this.props.teamTasks.map(d => new Date(d.taskSuspense).getTime())));
        return(
            <>
                { this.props.isPaneVisible &&
                    <TeamTasksPaneComponent
                        updateTasksCallback={this.teamTasksUpdated.bind(this)}
                        cancelCallBack={this.taskPaneCancel.bind(this)}
                        committedTasks={this.props.teamTasks}
                        isEditing={this.props.editing}
                        teamModel={this.props.teamModel}
                    />
                }
                <Stack horizontal onClick={this.teamClicked.bind(this, this.props.teamModel)} styles={{ root: { display: 'flex' } }} className={styles.taskedTeamItem}>
                    <Stack.Item styles={{ root: { width: '20%'}}}>{this.props.teamModel.name}</Stack.Item>
                    <Stack.Item styles={{ root: { width: '60%'}}}>{teamStatus}</Stack.Item>
                    <Stack.Item styles={{ root: { width: '20%'}}}>{format(lastSuspense, AppService.DateFormatView)}</Stack.Item>
                </Stack>
            </>
        );
    }

    private teamClicked(team: TeamModel): void {
        this.props.teamClicked(team.id);
    }

    private teamTasksUpdated(newTasks: Array<TaskModel>): void {
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
