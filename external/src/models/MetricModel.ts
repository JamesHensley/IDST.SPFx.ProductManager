export interface MetricModel {
    totalTasks: number;
    pendingTasks: number;
    workingTasks: number;
    completedTasks: number;
    latestSuspense: Date;
    earliestStart: Date;
    latestFinish: Date;
    bustedSuspenses: boolean;
}
