import { isToastIdValid } from "react-toastify/dist/utils";
import { TaskState } from "./TaskModel";

export interface ITimelineItem {
    id: number;
    group: number;
    title: string;
    start_time: number;
    end_time: number;
    itemProps: IItemProps;
    isEvent: boolean;
    bustedSuspense: boolean;
    status: TaskState;
}

export interface IItemProps {
    productGuid?: string;
    teamGuid?: string;
    taskId?: string;
    style: any;
}

export class TimelineProductItem implements ITimelineItem {
    public constructor(init?: Partial<TimelineProductItem>) {
        init.id = init.id || 0;
        init.group = init.group || 0;
        init.itemProps = init.itemProps || {} as IItemProps;
        init.isEvent = false;
        Object.assign(this, init);
    }

    id: number;
    group: number;
    title: string;
    start_time: number;
    end_time: number;
    itemProps: IItemProps;
    isEvent: boolean;
    bustedSuspense: boolean;
    status: TaskState;
}

export class TimelineEventItem implements ITimelineItem {
    public constructor(init?: Partial<TimelineEventItem>) {
        init.id = init.id || 0;
        init.group = init.group || 0;
        init.itemProps = init.itemProps || {} as IItemProps;
        init.isEvent = true;
        Object.assign(this, init);
    }

    id: number;
    group: number;
    title: string;
    start_time: number;
    end_time: number;
    itemProps: IItemProps;
    isEvent: boolean;
    bustedSuspense: boolean;
    status: TaskState;
}