import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import { TaskModel } from '../../../../models/TaskModel';
import { TeamTasksPaneComponent } from './TeamTasksPaneComponent';
import AppService from '../../../../services/AppService';
import { format } from 'date-fns';
import { TeamModel } from '../../../../models/TeamModel';
import { Stack } from '@fluentui/react';
import { MetricService } from '../../../../services/MetricService';
import { MetricModel } from '../../../../models/MetricModel';

export interface ITeamTaskComponentProps {
    teamModel: TeamModel;
    teamTasks: Array<TaskModel>;
    teamClicked: (taskId: string) => void;
    tasksUpdated: (newTasks: Array<TaskModel>) => void;
    removeTeamTasks: (teamId: string) => void;

    isPaneVisible: boolean;
    editing: boolean;
}

export class TeamTaskRowComponent extends React.Component<ITeamTaskComponentProps, {}> {
    render(): React.ReactElement<ITeamTaskComponentProps> {
        const metrics: MetricModel = MetricService.GetTaskMetrics(this.props.teamTasks);
        const teamStatus = `${metrics.completedTasks} of ${metrics.totalTasks} complete`;
        return(
            <>
                { this.props.isPaneVisible &&
                    <TeamTasksPaneComponent
                        updateTasksCallback={this.teamTasksUpdated.bind(this)}
                        cancelCallBack={this.taskPaneCancel.bind(this)}
                        removeTeamTasksCallback={this.removeTasks.bind(this)}
                        committedTasks={this.props.teamTasks}
                        isEditing={this.props.editing}
                        teamModel={this.props.teamModel}
                    />
                }
                <Stack horizontal onClick={this.teamClicked.bind(this, this.props.teamModel)} styles={{ root: { display: 'flex' } }} className={styles.taskedTeamItem}>
                    <Stack.Item styles={{ root: { width: '20%' } }}>{this.props.teamModel.name}</Stack.Item>
                    <Stack.Item styles={{ root: { width: '60%' } }}>{teamStatus}</Stack.Item>
                    <Stack.Item styles={{ root: { width: '20%' } }}>{format(metrics.latestSuspense, AppService.DateFormatView)}</Stack.Item>
                </Stack>
            </>
        );
    }

    private teamClicked(team: TeamModel): void {
        this.props.teamClicked(team.teamId);
    }

    private teamTasksUpdated(newTasks: Array<TaskModel>): void {
        this.props.tasksUpdated(newTasks);
    }

    private taskPaneCancel(): void {
        this.props.tasksUpdated(null);
    }

    private removeTasks(): void {
        this.props.removeTeamTasks(this.props.teamModel.teamId);
    }

    public componentDidMount(): void {
        // console.log('TeamTaskComponentPane.componentDidMount: ', this.props, this.state);
    }
    public componentWillUnmount(): void {
        // console.log('TeamTaskComponentPane.componentWillUnmount: ', this.props, this.state);
    }
}
