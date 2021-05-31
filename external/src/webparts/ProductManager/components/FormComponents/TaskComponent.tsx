import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';
import { Label } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { ContextMenu, IContextMenuProps } from './ContextMenu';
import AppService from '../../../../services/AppService';

export interface ITaskComponentProps {
    TaskItems: Array<TaskModel>;
    onUpdated: (newVal: string, fieldRef: string) => void;
}

export class TaskComponent extends React.Component<ITaskComponentProps, {}> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;
    private contextMenuItems: Array<IContextualMenuItem> = [
        {
            key: 'editItem', text: 'Edit', onClick: () => this.contextMenuClick.bind(this)
        }
    ];
    
    render(): React.ReactElement<ITaskComponentProps> {
        return (
            <div className={`${this.grid} ${styles.padTop3}`}>
                <Label>Teams and Tasks</Label>
                <div className={styles.gridRow}>
                    <div className={styles.gridCol1}>
                        <IconButton iconProps={{ iconName: 'CalculatorAddition' }} onClick={this.createNewTask.bind(this)}></IconButton>
                    </div>
                    <Label className={styles.gridCol2} style={{fontSize: '.9rem' }}>Status</Label>
                    <Label className={styles.gridCol2} style={{fontSize: '.9rem' }}>Team</Label>
                    <Label className={styles.gridCol7} style={{fontSize: '.9rem' }}>Task Description</Label>
                </div>
                {(this.props.TaskItems || []).map(a => {
                    return (
                        <div key={a.taskGuid} className={this.row} onClick={this.taskClicked.bind(this, a)}>
                            <div className={styles.gridCol1}>
                                <ContextMenu menuItems={this.contextMenuItems} />
                            </div>
                            <div className={styles.gridCol2}>{a.taskState}</div>
                            <div className={styles.gridCol2}>{a.taskTeamName}</div>
                            <div className={styles.gridCol7}>{a.taskDescription}</div>
                        </div>
                    );
                })}
            </div>
        );
    }

    private taskClicked(task: TaskModel): void {
        console.log('Task Clicked: ', task);
    }

    private contextMenuClick(task: any) {

    }

    private createNewTask(): void {
        const newTask = new TaskModel();
        newTask.taskDescription = "New Task";
        newTask.taskGuid = uuidv4();
        const newTasks = [].concat.apply(this.props.TaskItems, [newTask]);
        newTask.taskTeamName = AppService.AppSettings.teams[0].name;
        newTask.taskedTeamId = AppService.AppSettings.teams[0].id;
        newTask.taskState = TaskState.pending;
        this.props.onUpdated(newTasks, 'tasks');
    }
};