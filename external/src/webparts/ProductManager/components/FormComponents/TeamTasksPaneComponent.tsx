import * as React from 'react';
import { Panel, PanelType, Stack, DefaultButton, Separator } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel } from '../../../../models/TaskModel';
import AppService from '../../../../services/AppService';
import { TeamTaskFormComponent } from './TeamTaskFormComponent';

export interface ITeamTasksPaneComponentProps {
    committedTasks: Array<TaskModel>;
    updateTasksCallback: (tasks: Array<TaskModel>) => void;
    cancelCallBack: () => void;
    isEditing: boolean;
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
        // headerText={this.state.draftTask ? `${AppService.AppSettings.teams.reduce((t,n) => n.id === this.state.draftTask.taskedTeamId ? n.name : t, '')}` : ''}
        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss={!this.props.isEditing}
                isHiddenOnDismiss={false}
                isOpen={true}
                onDismiss={this.togglePanelVisibility.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                {
                    this.state.draftTasks.map(d => {
                        return (
                            <div key={d.taskGuid}>
                                <TeamTaskFormComponent
                                    key={d.taskGuid}
                                    committedTask={d}
                                    isEditing={this.props.isEditing}
                                    updateCallback={this.taskUpdated.bind(this)}
                                    cancelUpdateCallBack={this.cancelTaskUpdate.bind(this)}
                                />
                                <Separator />
                            </div>
                        );
                    })
                }
            </Panel>
        );
    }

    private togglePanelVisibility(): void {
        // console.log('TeamTaskComponentPane.togglePanelVisibility', this.state.draftTask);
        this.props.cancelCallBack();
    }

    private taskUpdated(task: TaskModel): void {
        const newTasks = this.state.draftTasks.filter(f => f.taskGuid !== task.taskGuid)
            .concat([task])
            .sort((a, b) => a.taskSuspense > b.taskSuspense ? 1 : (a.taskSuspense < b.taskSuspense ? -1 : 0));
        this.props.updateTasksCallback(newTasks);
    }

    private cancelTaskUpdate(): void {
        // this.setState({ draftTasks: this.state. });
    }
}
