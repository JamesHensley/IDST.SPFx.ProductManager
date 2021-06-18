import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { FormInputDate } from './FormInputDate';
import { FormInputText } from './FormInputText';
import { FormInputDropDown } from './FormInputDropDown';
import AppService from '../../../../services/AppService';
import { KeyValPair } from './IFormInputProps';
import { DefaultButton, IStackItemStyles, Stack } from '@fluentui/react';


export interface ITeamTaskFormComponentProps {
    committedTask: TaskModel;
    isEditing: boolean;
    updateCallback: (task: TaskModel) => void;
}

export interface ITeamTaskFormComponentState {
    draftTask: TaskModel;
}

export class TeamTaskFormComponent extends React.Component<ITeamTaskFormComponentProps, ITeamTaskFormComponentState> {
    constructor(props: ITeamTaskFormComponentProps) {
        super(props);
        this.state = { draftTask: this.props.committedTask }
    }

    public render(): React.ReactElement<ITeamTaskFormComponentProps> {
        /*
            <FormInputDropDown
                labelValue={'Tasked Team'}
                fieldValue={this.state.draftTask.taskedTeamId}
                fieldRef={'taskedTeamId'}
                onUpdated={this.fieldUpdated.bind(this)}
                editing={this.props.isEditing}
                options={AppService.AppSettings.teams.map(d => { return { key: d.id, value: d.name } as KeyValPair; })}
            />
        */
        const stackItemStyles: IStackItemStyles = { root: { display: 'flex' } };
        return (
            <Stack>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <Stack.Item grow styles={stackItemStyles}>
                        <FormInputDropDown
                            labelValue={'Task Status'}
                            fieldValue={this.state.draftTask.taskState}
                            fieldRef={'taskState'}
                            onUpdated={this.statusChanged.bind(this)}
                            editing={this.props.isEditing}
                            options={ [
                                { key: TaskState.pending, value: 'Pending' } as KeyValPair,
                                { key: TaskState.working, value: 'Working' } as KeyValPair,
                                { key: TaskState.complete, value: 'Complete' } as KeyValPair
                            ] }
                        />
                    </Stack.Item>
                    <Stack.Item grow styles={stackItemStyles}>
                        <FormInputDate
                            labelValue={'Suspense Date'}
                            fieldValue={this.state.draftTask.taskSuspense}
                            fieldRef={'taskSuspense'}
                            onUpdated={this.fieldUpdated.bind(this)}
                            editing={this.props.isEditing}
                        />
                    </Stack.Item>
                </Stack>
                <Stack horizontal>
                    <Stack.Item grow styles={stackItemStyles}>
                        <FormInputText
                            labelValue={'Task Description'}
                            fieldValue={this.state.draftTask.taskDescription}
                            fieldRef={'taskDescription'}
                            onUpdated={this.fieldUpdated.bind(this)}
                            editing={this.props.isEditing}
                            editLines={3}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
        );
    }

    private statusChanged(fieldValue: string, fieldRef: string): void {
        if (fieldValue === 'Pending') { this.state.draftTask.taskStart = new Date(); }
        if (fieldValue === 'Complete') { this.state.draftTask.taskFinish = new Date(); }
        this.fieldUpdated(fieldValue, fieldRef);
    }

    private fieldUpdated(fieldValue: string, fieldRef: string): void {
        const newDraft = new TaskModel();
        Object.assign(newDraft, this.state.draftTask);

        newDraft[fieldRef] = fieldValue;
        this.setState({ draftTask: newDraft });
        this.props.updateCallback(newDraft);
    }
}