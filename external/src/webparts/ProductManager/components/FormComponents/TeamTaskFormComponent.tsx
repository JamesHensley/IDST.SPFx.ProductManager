import * as React from 'react';
import { TaskModel, TaskState } from '../../../../models/TaskModel';
import { FormInputDate } from './FormInputDate';
import { FormInputText } from './FormInputText';
import { FormInputDropDown, KeyValPair } from './FormInputDropDown';
import { IStackItemStyles, Stack } from '@fluentui/react';
import { startOfDay } from 'date-fns';
import { differenceInHours, subHours } from 'date-fns/esm';

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
        this.state = { draftTask: this.props.committedTask };
    }

    public render(): React.ReactElement<ITeamTaskFormComponentProps> {
        const stackItemStyles: IStackItemStyles = { root: { display: 'flex' } };
        return (
            <Stack>
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <Stack.Item grow styles={stackItemStyles}>
                        <FormInputDropDown
                            labelValue={'Task Status'}
                            fieldValue={this.state.draftTask.taskState}
                            fieldRef={'taskState'}
                            onUpdated={this.fieldUpdated.bind(this)}
                            editing={this.props.isEditing}
                            options={Object.keys(TaskState).map(d => {
                                return { key: d, value: TaskState[d], selected: this.state.draftTask.taskState === TaskState[d] } as KeyValPair;
                            })}
                            toolTip={`${this.state.draftTask.taskStart} - ${this.state.draftTask.taskFinish}`}
                            allowNull={false}
                            disabledKeys={[]}
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

    private fieldUpdated(fieldValue: string, fieldRef: string): void {
        const newDraft = new TaskModel();
        Object.assign(newDraft, this.state.draftTask);

        newDraft[fieldRef] = fieldValue;
        if (fieldRef === 'taskState' && fieldValue === TaskState.Pending) { newDraft.taskStart = null; newDraft.taskFinish = null; }
        if (fieldRef === 'taskState' && fieldValue === TaskState.Working) { newDraft.taskStart = startOfDay(new Date()); newDraft.taskFinish = null; }
        if (fieldRef === 'taskState' && fieldValue === TaskState.Complete) {
            newDraft.taskFinish = startOfDay(new Date());
            newDraft.taskStart = newDraft.taskStart ? newDraft.taskStart : subHours(newDraft.taskFinish, 6);
            if (differenceInHours(newDraft.taskFinish, newDraft.taskStart) < 6) { newDraft.taskStart = subHours(newDraft.taskFinish, 6); }
        }

        this.setState({ draftTask: newDraft });
        this.props.updateCallback(newDraft);
    }
}
