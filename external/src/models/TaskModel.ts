export enum TaskState {
    pending = 1,
    working = 2,
    complete = 3
}

export class TaskModel {
    taskedTeamId: string;
    taskDescription: string;
    taskFiles: Array<string>;
    taskState: TaskState;
}
