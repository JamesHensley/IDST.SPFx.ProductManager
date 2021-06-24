import { parseISO } from 'date-fns';
import addDays from 'date-fns/addDays';

export enum TaskState {
    pending = 'Pending',
    working = 'Working',
    complete = 'Complete'
}

export class TaskModel {
    public constructor(init?: Partial<TaskModel>) {
        Object.assign(this, init);
        this.taskStart = (init && init.taskStart && typeof(init.taskStart) === 'string') ? parseISO(init.taskStart) : this.taskStart;
        this.taskFinish = (init && init.taskFinish && typeof(init.taskFinish) === 'string') ? parseISO(init.taskFinish) : this.taskFinish;
    }

    taskGuid: string;
    taskedTeamId: string;
    taskDescription: string;
    taskState: TaskState;

    /** Date-String of the tasks suspense */
    taskSuspense: string;

    /** Date of when/if the task went into WORKING status */
    taskStart?: Date;

    /** Date of when/if the task went into COMPLETED status */
    taskFinish?: Date;

    public get bustedSuspense(): boolean {
        switch (this.taskState) {
            case TaskState.complete:
                return this.taskFinish > new Date(this.taskSuspense);
            case TaskState.working:
                return new Date() >= new Date(this.taskSuspense);
            case TaskState.pending:
                return addDays(new Date(), 1) >= new Date(this.taskSuspense);
        }
    }
}
