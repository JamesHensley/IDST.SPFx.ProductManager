import { TaskState } from './TaskModel';

export interface ITimelineTeamGroup {
    id: number;
    teamGuid: string;
    title: string;
    stackItems: boolean;
}

export class TimelineTeamGroup implements ITimelineTeamGroup {
    public constructor(init?: Partial<ITimelineTeamGroup>) {
        Object.assign(this, init);
        this.stackItems = true;
    }

    id: number;
    teamGuid: string;
    title: string;
    stackItems: boolean;
}

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
    productType: string;
    teamGuid: string;
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
        Object.assign(this, init);
        this.isEvent = false;
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
    productType: string;
    teamGuid: string;
}

export class TimelineEventItem implements ITimelineItem {
    public constructor(init?: Partial<TimelineEventItem>) {
        init.id = init.id || 0;
        init.group = init.group || 0;
        init.itemProps = init.itemProps || {} as IItemProps;
        Object.assign(this, init);
        this.isEvent = true;
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
    productType: string;
    teamGuid: string;
}
