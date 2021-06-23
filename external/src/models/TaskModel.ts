import { parseISO } from 'date-fns';

export enum TaskState {
    pending = 'Pending',
    working = 'Working',
    complete = 'Complete'
}

export class TaskModel {
    public constructor(init?: Partial<TaskModel>) {
        Object.assign(this, init);
        this.taskStart = (init && init.taskStart && typeof(init.taskStart) === 'string') ? parseISO(init.taskStart) : null;
        this.taskFinish = (init && init.taskFinish && typeof(init.taskFinish) === 'string') ? parseISO(init.taskFinish) : null;
    }

    taskGuid: string;
    taskedTeamId: string;
    taskDescription: string;
    taskState: TaskState;
    taskSuspense: string;
    taskStart?: Date;
    taskFinish?: Date;
}
