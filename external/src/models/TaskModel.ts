export enum TaskState {
    pending = "Pending",
    working = "Working",
    complete = "Complete"
}

export class TaskModel {
    taskGuid: string;
    taskedTeamId: string;
    taskTeamName: string;
    taskDescription: string;
    taskState: TaskState;
}
