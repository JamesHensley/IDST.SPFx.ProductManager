export enum TaskState {
    pending = 'Pending',
    working = 'Working',
    complete = 'Complete'
}

export class TaskModel {
    public constructor(init?: Partial<TaskModel>) {
        Object.assign(this, init);
    }

    taskGuid: string;
    taskedTeamId: string;
    taskDescription: string;
    taskState: TaskState;
    taskSuspense: string;
    taskStart?: Date;
    taskFinish?: Date;
}
