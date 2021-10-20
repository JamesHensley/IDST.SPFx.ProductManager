import { v4 as uuidv4 } from 'uuid';

export class TaskTemplate {
    public constructor(init?: Partial<TaskTemplate>) {
        this.taskId = uuidv4();
        Object.assign(this, init);
    }

    public taskId: string;
    public teamId: string;
    public taskDescription: string;
    public taskOrder: number;

    /** Typical days offset for this tasks suspense from the start of the product */
    // public taskSuspenseDaysOffset: number;
    public typicalTaskLength: number;
}
