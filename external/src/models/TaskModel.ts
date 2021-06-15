export enum TaskState {
    pending = 'Pending',
    working = 'Working',
    complete = 'Complete'
}

export class TaskModel {
    taskGuid: string;
    taskedTeamId: string;
    taskDescription: string;
    taskState: TaskState;
    taskSuspense: string;
    taskStart?: Date;
    taskFinish?: Date;
}
