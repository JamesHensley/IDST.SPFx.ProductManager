export enum TaskState {
    pending = 1,
    working = 2,
    complete = 3
}

export class TaskModel {
    taskGuid: string;
    taskedTeamId: string;
    taskTeamName: string;
    taskDescription: string;
    taskState: TaskState;
}
