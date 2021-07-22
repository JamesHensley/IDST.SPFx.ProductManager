import * as React from 'react';
import { DefaultButton, Dropdown, IconButton, IDropdownOption, Label, Stack, Dialog, DialogContent, DialogType, DialogFooter } from '@fluentui/react';

import { v4 as uuidv4 } from 'uuid';

import * as styles from '../ProductManager.module.scss';

import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { TeamTaskRowComponent } from './TeamTaskRowComponent';
import AppService from '../../../../services/AppService';
import { TeamModel } from '../../../../models/TeamModel';
import RecordService from '../../../../services/RecordService';

export interface ITaskComponentProps {
    TaskItems: Array<TaskModel>;
    isEditing: boolean;
    onUpdated: (newVal: Array<TaskModel>) => void;
}

export interface ITaskPaneState {
    teamId: string;
    isPaneVisible: boolean;
}

export interface ITaskComponentState {
    taskPanes: Array<ITaskPaneState>;
    draftTasks: Array<TaskModel>;
    isTeamDialogVisible: boolean;
}

export class TaskComponent extends React.Component<ITaskComponentProps, ITaskComponentState> {
    constructor(props: ITaskComponentProps) {
        super(props);

        const panes = this.props.TaskItems.map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) === i).map(d => { return { teamId: d, isPaneVisible: false } as ITaskPaneState; });
        this.state = {
            taskPanes: panes,
            draftTasks: this.props.TaskItems,
            isTeamDialogVisible: false
        };
    }

    private get teamModels(): Array<TeamModel> {
        const teamIds = (this.state.draftTasks || this.props.TaskItems || []).map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) === i);
        return AppService.AppSettings.teams.reduce((t, n) => (teamIds.indexOf(n.teamId) >= 0) ? t.concat([n]) : t, []);
    }

    render(): React.ReactElement<ITaskComponentProps> {
        return (
            <>
                <Stack styles={{ root: { display: 'flex' } }}>
                    <Stack horizontal>
                        <Stack.Item>
                            <Label>Teams and Tasks</Label>
                        </Stack.Item>
                        { this.props.isEditing &&
                            <Stack.Item grow>
                                <IconButton iconProps={{ iconName: 'add' }} className={styles.appIcon} title='' ariaLabel='' onClick={this.addTeamTask.bind(this)} />
                            </Stack.Item>
                        }
                    </Stack>
                    <Stack.Item grow styles={{ root: { paddingLeft: '10px' } }}>
                        <Stack horizontal>
                            <Stack.Item styles={{ root: { width: '20%' } }}><Label style={{ fontSize: '.9rem' }}>Team</Label></Stack.Item>
                            <Stack.Item styles={{ root: { width: '60%' } }}><Label style={{ fontSize: '.9rem' }}>Status</Label></Stack.Item>
                            <Stack.Item styles={{ root: { width: '20%' } }}><Label style={{ fontSize: '.9rem' }}>Suspense</Label></Stack.Item>
                        </Stack>
                    </Stack.Item>
                    <Stack.Item grow styles={{ root: { paddingLeft: '20px' } }}>
                        {
                            this.teamModels.map((team: TeamModel) => {
                                const paneState: ITaskPaneState = this.state.taskPanes.reduce((t, n) => n.teamId === team.teamId ? n : t, null);
                                return (
                                    <TeamTaskRowComponent
                                        key={team.teamId}
                                        teamModel={team}
                                        teamTasks={(this.props.TaskItems || []).filter(f => f.taskedTeamId === team.teamId)}
                                        isPaneVisible={paneState.isPaneVisible}
                                        editing={this.props.isEditing}
                                        tasksUpdated={this.teamTasksUpdated.bind(this)}
                                        teamClicked={this.teamClicked.bind(this)}
                                    />
                                );
                            })
                        }
                    </Stack.Item>
                </Stack>
                {this.state.isTeamDialogVisible &&
                    <TeamDialog
                        key={new Date().getTime()}
                        teamSelectedCallback={this.teamSelected.bind(this)}
                        teams={AppService.AppSettings.teams}
                    />
                }
            </>
        );
    }

    private addTeamTask(): void {
        this.setState({ isTeamDialogVisible: true });
    }

    private teamSelected(teamId: string): void {
        const newTask = RecordService.GetNewTask(teamId, 'New Task', new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 3)));
        const newDrafts = [].concat.apply(this.state.draftTasks, [newTask]);
        this.props.onUpdated(newDrafts);
    }

    /** Called when a user clicks the SAVE or CANCEL button on a Teams task pane */
    private teamTasksUpdated(newTasks: Array<TaskModel>): void {
        let newDrafts: Array<TaskModel> = [];
        if (newTasks) {
            // Save tasks
            const teams = newTasks.map(d => d.taskedTeamId).filter((f, i, e) => e.indexOf(f) === i);
            newDrafts = this.state.draftTasks.filter(f => teams.indexOf(f.taskedTeamId) < 0).concat(newTasks);
        } else {
            // User canceled
            newDrafts = this.props.TaskItems;
        }
        const newPanes = this.state.taskPanes.map(d => { return { teamId: d.teamId, isPaneVisible: false } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes, draftTasks: newDrafts });
        this.props.onUpdated(newDrafts);
    }

    private teamClicked(teamId: string): void {
        const newPanes = this.state.taskPanes.map(d => { return { teamId: d.teamId, isPaneVisible: (d.teamId === teamId) } as ITaskPaneState; });
        this.setState({ taskPanes: newPanes });
    }
}

export interface ITeamDialogProps { teamSelectedCallback: (teamId: string) => void; teams: Array<TeamModel>; }

export const TeamDialog: React.FunctionComponent<ITeamDialogProps> = (props) => {
    const [team, setTeam] = React.useState('');

    const okClicked = React.useCallback((): void => { props.teamSelectedCallback(team); }, [team]);

    const cancelClicked = React.useCallback((): void => { props.teamSelectedCallback(null); }, []);

    const dropdownOptions: Array<IDropdownOption> = props.teams
        .map(d => { return { key: d.teamId, text: d.name }; })
        .sort((a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0));

    return (
        <>
            <Dialog
                hidden={false}
                modalProps={{ isBlocking: true, isOpen: true }}
                dialogContentProps={{ type: DialogType.normal, title: 'Team Selector' }}
                styles={{ main: { width: '400px' } }}
            >
                <DialogContent>
                    <Dropdown options={dropdownOptions} onChange={(e, o, i) => setTeam(o.key.toString())} label={'Select a team'} />
                </DialogContent>
                <DialogFooter>
                    <Stack horizontal styles={{ root: { width: '100%' } }} tokens={{ childrenGap: 20 }}>
                        <Stack.Item grow><DefaultButton onClick={okClicked} text={'Ok'} /></Stack.Item>
                        <Stack.Item grow><DefaultButton onClick={cancelClicked} text={'Cancel'} /></Stack.Item>
                    </Stack>
                </DialogFooter>
            </Dialog>
        </>
    );
};
