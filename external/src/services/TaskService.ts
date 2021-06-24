import { addDays, subDays } from "date-fns";
import { ProductModel } from "../models/ProductModel";
import { TaskState } from "../models/TaskModel";
import { ITimelineItem, TimelineProductItem } from "../models/TimelineModels";
import AppService from "./AppService";

/** Provides methods to make working with tasks and teams earlier */
export default class TaskService {
    /** Creates an ITimelineItem for each task in all of the products */
    public static BreakProductsToTasks(products: Array<ProductModel>, mergeTeamTasks: boolean): Array<ITimelineItem> {
        return products
            .map((d: ProductModel) => this.tasksToProducts(d, mergeTeamTasks))
            .reduce((t: Array<ITimelineItem>, n: Array<ITimelineItem>) => [].concat.apply(t, n), new Array<ITimelineItem>())
            .map((d: ITimelineItem, i: number) => { d.id = i; return d; });
    }

    /**
     * Creates an ITimelineItem for each task in the given product
     * Collapses team tasks into a single ITimlineItem based on state variable
     */
    private static tasksToProducts(product: ProductModel, mergeTeamTasks: boolean): Array<ITimelineItem> {
        const workingProduct = new ProductModel(product);
        const retObj = workingProduct.tasks.map(d => {
            switch (d.taskState) {
                case TaskState.pending:
                    d.taskStart = subDays(new Date(d.taskSuspense), 2);
                    d.taskFinish = new Date(d.taskSuspense);
                    break;
                case TaskState.working:
                    d.taskFinish = addDays(new Date(), 1);
                    break;
            }

            return new TimelineProductItem({
                group: AppService.AppSettings.teams.reduce((t, n) => n.teamId === d.taskedTeamId ? n.id : t, 0),
                title: product.title,
                start_time: d.taskStart.getTime(),
                end_time: d.taskFinish.getTime(),
                bustedSuspense: d.bustedSuspense,
                itemProps: {
                    productGuid: product.guid,
                    teamGuid: d.taskedTeamId,
                    taskId: d.taskGuid,
                    style: {
                        backgroundColor: d.bustedSuspense ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)',
                        selectedBgColor: d.bustedSuspense ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)',
                        color: 'rgba(0, 0, 0, 1)'
                    }
                }
            })
        })
        if (!mergeTeamTasks) { return retObj; }

        const grouped = Object.values(this.GroupBy(retObj, 'group'))
        .map((d: Array<ITimelineItem>) => {
            const newItem = new TimelineProductItem(d[0]);
            const teamTimes = d.reduce((t, n) => {
                return {
                    start_time: (t.start_time ? (n.start_time < t.start_time ? n.start_time : t.start_time) : n.start_time),
                    end_time: (t.end_time ? (n.end_time > t.end_time ? n.end_time : t.end_time) : n.end_time)
                }
            }, { start_time: undefined, end_time: undefined });

            newItem.start_time = teamTimes.start_time;
            newItem.end_time = teamTimes.end_time;
            newItem.bustedSuspense = d.reduce((t, n) => t || n.bustedSuspense, false)
            return newItem;
        })
        return grouped;
    }

    private static GroupBy<T>(items: T[], groupField: string): any {
        return items.reduce((t, n) => {
            t[n[groupField]] = (t[n[groupField]] || []).concat([n]);
            return t;
        }, {});
    }
}