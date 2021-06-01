import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';
import { Label } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { TeamTaskComponentPane } from './TeamTaskComponentPane';

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
        //console.log('Pane should be rendered: ', (this.state.isPaneVisible ? 'True' : 'False'))
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
                <div className={styles.gridCol2}>{this.props.task.taskTeamName}</div>
                <div className={styles.gridCol7}>{this.props.task.taskDescription}</div>
            </div>
        );
    }

    private taskClicked(task: TaskModel): void {
        console.log('TeamTaskComponent.taskClicked: ', task);
        this.props.taskClicked(task.taskGuid);
    }

    private taskPaneUpdate(newTask: TaskModel): void {
        console.log('TeamTaskComponent.taskPaneUpdate: ', newTask);
        this.props.taskUpdated(newTask);
    }

    private taskPaneCancel(newTask: TaskModel): void {
        console.log('TeamTaskComponent.taskPaneCancel: ', newTask);
        this.props.taskUpdateCancel(newTask.taskGuid);
    }

    public componentDidMount() {
        console.log('TeamTaskComponentPane.componentDidMount: ', this.props, this.state);
    }
    public componentWillUnmount() {
        console.log('TeamTaskComponentPane.componentWillUnmount: ', this.props, this.state);
    }
}