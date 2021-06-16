import { ProductModel } from '../models/ProductModel';

export class MetricService {
    public static GetSomething(input: Array<ProductModel>): Array<any> {
        return input.map(d => {
            const totalHours = (d.tasks.reduce((t,n) => (n.taskStart && n.taskFinish) ? n.taskFinish.getTime() - (n.taskStart || new Date(d.requestDate)).getTime() : 0, 0)) / (1000 * 60 * 60);
            return { productGuid: d.guid, hours: totalHours };
        }).sort();
    }
}
