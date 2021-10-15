import { addDays, subDays } from 'date-fns';
import { EventModel } from '../models/EventModel';
import { ProductModel } from '../models/ProductModel';
import { TaskState } from '../models/TaskModel';
import { ITimelineItem, TimelineEventItem, TimelineProductItem } from '../models/TimelineModels';
import AppService from './AppService';

/** Provides methods to make working with tasks and teams earlier */
export default class TaskService {
    /** Creates an ITimelineItem for each task in all of the products */
    public static BreakProductsToTasks(products: Array<ProductModel>, mergeTeamTasks: boolean): Array<ITimelineItem> {
        return products
            .map((d: ProductModel) => this.tasksToProducts(d, mergeTeamTasks))
            .reduce((t: Array<ITimelineItem>, n: Array<ITimelineItem>) => [].concat.apply(t, n), new Array<ITimelineItem>());
    }

    /**
     * Creates an ITimelineItem for each task in the given product
     * Collapses team tasks into a single ITimlineItem based on state variable
     */
    private static tasksToProducts(product: ProductModel, mergeTeamTasks: boolean): Array<ITimelineItem> {
        const workingProduct = new ProductModel(product);
        const retObj = workingProduct.tasks.map(d => {
            switch (d.taskState) {
                case TaskState.Pending:
                    d.taskStart = subDays(new Date(d.taskSuspense), 2);
                    d.taskFinish = new Date(d.taskSuspense);
                    break;
                case TaskState.Working:
                    d.taskFinish = addDays(new Date(), 1);
                    break;
            }

            return new TimelineProductItem({
                title: product.title,
                startTime: d.taskStart.getTime(),
                endTime: d.taskFinish.getTime(),
                bustedSuspense: d.bustedSuspense,
                productType: product.productType,
                teamGuid: d.taskedTeamId,
                itemProps: {
                    productGuid: product.guid,
                    categoryId: product.categoryId,
                    teamGuid: d.taskedTeamId,
                    taskId: d.taskGuid,
                    style: {
                        backgroundColor: d.bustedSuspense ? 'rgba(180, 40, 40, 1)' : 'rgba(40, 180, 40, 1)',
                        color: 'rgba(0, 0, 0, 1)'
                    }
                }
            });
        });
        if (!mergeTeamTasks) { return retObj; }

        return Object.values(this.GroupBy(retObj, 'teamGuid'))
        .map((d: Array<ITimelineItem>) => {
            const newItem = new TimelineProductItem(d[0]);
            const teamTimes = d.reduce((t, n) => {
                return {
                    start_time: (t.start_time ? (n.startTime < t.start_time ? n.startTime : t.start_time) : n.startTime),
                    end_time: (t.end_time ? (n.endTime > t.end_time ? n.endTime : t.end_time) : n.endTime)
                };
            }, { start_time: undefined, end_time: undefined });

            newItem.startTime = teamTimes.start_time;
            newItem.endTime = teamTimes.end_time;
            newItem.bustedSuspense = d.reduce((t, n) => t || n.bustedSuspense, false);
            newItem.itemProps.style = {
                backgroundColor: newItem.bustedSuspense ? 'rgba(180, 40, 40, 1)' : 'rgba(40, 180, 40, 1)',
                color: 'rgba(0, 0, 0, 1)'
            };
            return newItem;
        });
    }

    private static GroupBy<T>(items: T[], groupField: string): any {
        return items.reduce((t, n) => {
            t[n[groupField]] = (t[n[groupField]] || []).concat([n]);
            return t;
        }, {});
    }

    public static BreakProductsToEvents(products: Array<ProductModel>, teamId: string): Array<ITimelineItem> {
        return products.filter(f => f.eventType).map((d: ProductModel) => {
            const eModel: EventModel = AppService.AppSettings.eventTypes.reduce((t, n) => n.eventTypeId === d.eventType ? n : t, null);
            return new TimelineEventItem({
                title: eModel.eventTitle,
                startTime: d.eventDateStart.getTime(),
                endTime: d.eventDateEnd.getTime(),
                productType: d.productType,
                bustedSuspense: false,
                teamGuid: teamId,
                itemProps: {
                    productGuid: d.guid,
                    categoryId: d.categoryId,
                    style: {
                        backgroundColor: eModel.eventBackgroundColor,
                        selectedBgColor: eModel.eventBackgroundColor
                    }
                }
            });
        });
    }
}
