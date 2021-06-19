import { MetricModel } from '../models/MetricModel';
import { ProductModel } from '../models/ProductModel';
import { TaskModel, TaskState } from '../models/TaskModel';

export class MetricService {
    public static GetSomething(input: Array<ProductModel>): Array<any> {
        return input.map(d => {
            const totalHours = (d.tasks.reduce((t,n) => (n.taskStart && n.taskFinish) ? n.taskFinish.getTime() - (n.taskStart || new Date(d.requestDate)).getTime() : 0, 0)) / (1000 * 60 * 60);
            return { productGuid: d.guid, hours: totalHours };
        }).sort();
    }

    public static GetTaskMetrics(taskModels: Array<TaskModel>): MetricModel {
        // const start = Math.min(...taskModels.map(d => d.taskStart.getTime()));
        // const curr = Math.max(...taskModels.map(d => d.taskFinish.getTime())) - start;
        // const suspense = Math.max(...taskModels.map(d => new Date(d.taskSuspense).getTime())) - start;

        console.log('taskStart: ', taskModels.map(d => { return { state: d.taskState, start: d.taskStart }}));
        console.log('taskFinish: ', taskModels.map(d => { return { state: d.taskState, start: d.taskFinish }}));

        const retObj = {
            totalTasks: taskModels.length,
            pendingTasks: taskModels.filter(f => f.taskState === TaskState.pending).length,
            workingTasks: taskModels.filter(f => f.taskState === TaskState.working).length,
            completedTasks: taskModels.filter(f => f.taskState === TaskState.complete).length,
            latestSuspense: new Date(Math.max(...taskModels.map(d => new Date(d.taskSuspense).getTime()))),
            bustedSuspenses: taskModels
                .filter(f => f.taskState !== TaskState.complete)
                .filter(f => new Date().getTime() > new Date(f.taskSuspense).getTime())
                .length > 0,
            earliestStart: new Date(Math.min(...taskModels.map(d => (d.taskStart ? d.taskStart.getTime() : null)))),
            latestFinish: new Date(Math.max(...taskModels.map(d => (d.taskFinish ? d.taskFinish.getTime() : null))))
        } as MetricModel;

        return retObj;
    }
}
