import { TaskState } from './TaskModel';

export interface MetricModel {
    teamIds: Array<string>;
    totalTasks: number;
    pendingTasks: number;
    workingTasks: number;
    completedTasks: number;
    latestSuspense: Date;
    earliestStart: Date;
    latestFinish: Date;
    bustedSuspenses: boolean;
    overallStatus: TaskState;
    data?: any;
}
