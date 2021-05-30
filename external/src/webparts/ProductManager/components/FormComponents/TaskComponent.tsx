import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton, DefaultButton, ICommandBarItemProps } from '@fluentui/react';
import { Label } from '@fluentui/react';
import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel } from '../../../../models/TaskModel';
import { ContextMenu } from './ContextMenu';

export interface ITaskComponentProps {
    TaskItems: Array<TaskModel>;
    onUpdated: (newVal: string, fieldRef: string) => void;
}

export class TaskComponent extends React.Component<ITaskComponentProps, {}> {
    private grid = `${styles.grid} ${styles.attachmentManager}`;
    private row = `${styles.gridRow} ${styles.attachmentItem} ${styles.bordered}`;

    render(): React.ReactElement<ITaskComponentProps> {
        return (
            <div className={this.grid}>
                <IconButton iconProps={{ iconName: 'plus' }} onClick={this.createNewTask.bind(this)}></IconButton>
                {(this.props.TaskItems || []).map(a => {
                    return (
                        <div key={a.taskGuid} className={this.row} onClick={this.taskClicked.bind(this, a)}>
                            <ContextMenu menuItems={[{
                                    key: 'newItem',
                                    text: 'New',
                                    onClick: () => this.contextMenuClick.bind(this, a),
                                }]}
                            >
                                <div className={styles.gridCol1}>{a.taskState}</div>
                                <div className={styles.gridCol4}>{a.taskTeamName}</div>
                                <div className={styles.gridCol7}>{a.taskDescription}</div>
                            </ContextMenu>
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
        this.props.onUpdated(newTasks, 'tasks');
    }
};