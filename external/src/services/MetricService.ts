import { ProductModel } from '../models/ProductModel';
import { TaskModel } from '../models/TaskModel';

export class MetricService {
    public static GetSomething(input: Array<ProductModel>): Array<any> {
        return input.map(d => {
            const totalHours = (d.tasks.reduce((t,n) => (n.taskStart && n.taskFinish) ? n.taskFinish.getTime() - (n.taskStart || new Date(d.requestDate)).getTime() : 0, 0)) / (1000 * 60 * 60);
            return { productGuid: d.guid, hours: totalHours };
        }).sort();
    }

    public static GetTasksStatus(taskModels: Array<TaskModel>): number {
        const start = Math.min(...taskModels.map(d => d.taskStart.getTime()));
        const curr = Math.max(...taskModels.map(d => d.taskFinish.getTime())) - start;
        const suspense = Math.max(...taskModels.map(d => new Date(d.taskSuspense).getTime())) - start;

        return curr / suspense;
    }
}
