import * as React from 'react';
// import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
// import { v4 as uuidv4 } from 'uuid';

import Timeline, { defaultItemRenderer } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';

import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import AppService from '../../../services/AppService';
import { MetricService } from '../../../services/MetricService';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import ColorService from '../../../services/ColorService';

import * as styles from './ProductManager.module.scss';
import { Toggle } from '@fluentui/react';

export interface IRollupViewProps {
    products: Array<ProductModel>;
    productClicked: (prodId: string) => void;
    defaultMonth: Date;
}

export interface IRollupViewState {
    /** Used to control whether multiple tasks for the same team on a single product should be merged */
    mergeTeamTasks: boolean;
}

export interface ITimelineGroup {
    id: number;
    guid: string;
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
    canMove: boolean;
    canResize: boolean;
    canChangeGroup: boolean;
}

export interface IItemProps {
    productGuid: string;
    teamGuid: string;
    taskId: string;
    style: any;
}

export default class RollupView extends React.Component <IRollupViewProps, IRollupViewState> {
    private tlRef: Timeline;
    private calendarStart: Date;
    private calendarEnd: Date;

    constructor(props: IRollupViewProps) {
        super(props);
        this.calendarStart = startOfMonth(this.props.defaultMonth);
        this.calendarEnd = endOfMonth(this.props.defaultMonth);
        this.state = { mergeTeamTasks: true };
    }

    private get calendarGroups(): Array<ITimelineGroup> {
        return AppService.AppSettings.teams
            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
            .filter(f => f.active)
            .map((d, i, e) => {
                return {
                    id: i,
                    guid: d.id,
                    title: d.name,
                    stackItems: true
                } as ITimelineGroup;
            });
    }

    private get calendarItems(): Array<ITimelineItem> {
        // Oh man, this is complicated... do something about it!!!!!
        const retObj = this.props.products
        .filter(f => f.status === ProductStatus.closed)
        .map(d => {
            const prodModel = AppService.AppSettings.productTypes.reduce((t1, n1) => n1.typeId === d.productType ? n1 : t1, null);
            return d.tasks.map(d2 => {
                const metric = MetricService.GetTaskMetrics([d2]);
                return {
                    id: 0,
                    group: this.calendarGroups.reduce((a, b) => b.guid === d2.taskedTeamId ? b.id : a, 0),
                    title: d.title,
                    start_time: metric.earliestStart.getTime(),
                    end_time: metric.latestFinish.getTime(),
                    canChangeGroup: false, canMove: false, canResize: false,
                    itemProps: {
                        productGuid: d.guid,
                        teamGuid: d2.taskedTeamId,
                        taskId: d2.taskGuid,
                        style: {
                            backgroundColor:  prodModel ? prodModel.colorValue : '',
                            selectedBgColor:  prodModel ? prodModel.colorValue : '',
                            color: prodModel ? ColorService.GetTextColor(prodModel.colorValue) : ''
                        },
                        'data-product-guid': d.guid
                    }
                } as ITimelineItem;
            });
        })
        .reduce((t, n) => {
            // Now we have an ArrayOfArrays of calendar items grouped by productId
            //  We either merge multiple tasks for each team into a single calendar item OR
            //  we only flatten it here depending on the user's desired view mode
            if (this.state.mergeTeamTasks) {
                const groups = n
                    .map(d => d.group)
                    .filter((f, i, e) => e.indexOf(f) === i)
                    .map(d => {
                        const newItem: any = {};
                        Object.assign(newItem, n[0]);   // This is kind of gross, but each item in "n" only differs by group and times
                        newItem.start_time = Math.min(...(n.filter(f => f.group === d).map(d1 => d1.start_time)));
                        newItem.end_time = Math.max(...(n.filter(f => f.group === d).map(d1 => d1.end_time)));
                        newItem.group = d;
                        return newItem as ITimelineItem;
                    });
                return [].concat.apply(t, groups);
            } else {
                return [].concat.apply(t, n);
            }
        }, [])
        .map((d, i) => { d.id = i; return d; });

        return retObj;
    }

    public render(): React.ReactElement<IRollupViewProps> {
        const items = this.calendarItems;
        const groups = this.calendarGroups;

        return (
            <>
                <Toggle
                    label={'Merge team tasks'}
                    checked={this.state.mergeTeamTasks}
                    onChange={() => this.setState({ mergeTeamTasks: !this.state.mergeTeamTasks })}
                />
                <Timeline
                    key={new Date().getTime()}
                    ref={r => (this.tlRef = r)}
                    groups={this.calendarGroups}
                    items={this.calendarItems}
                    defaultTimeStart={this.calendarStart}
                    defaultTimeEnd={this.calendarEnd}
                    stackItems
                    canMove={false}
                    canChangeGroup={false}
                    canResize={false}
                    onItemSelect={this.itemClicked.bind(this)}
                    onItemClick={this.itemClicked.bind(this)}
                    timeSteps={{ second: 0, minute: 0, hour: 0, day: 1, month: 1, year: 1 }}
                    itemRenderer={this.itemRenderer.bind(this)}
                    onBoundsChange={this.calendarBoundsChanged.bind(this)}
                />
            </>
        );
    }

    private calendarBoundsChanged(): void {
        console.log('calendarBoundsChanged', arguments);
        this.calendarStart = addMonths(new Date(arguments[0]), 1);
        this.calendarEnd = subMonths(new Date(arguments[1]), 1);
    }

    public componentDidMount(): void {
        // The timeline component has problems being rendered within SP (maybe just the workbench), so we force
        //  a recalc/redraw of the component once it's been mounted
        this.tlRef.resize();
    }

    public componentDidUpdate(): void {
        // The timeline component has problems being rendered within SP (maybe just the workbench), so we force
        //  a recalc/redraw of the component whenever the data changes; a RENDER doesn't force the timeline to
        //  recalculate it's bounding box... maybe we should use the "resizeDetector" bundled with timeline
        this.tlRef.resize();
    }

    private itemClicked(itemId: number, e: Event, time: number): void {
        e.cancelBubble = true;
        e.preventDefault();
        const clickedProductGuid: string = this.calendarItems
            .reduce((t: string, n: ITimelineItem) => n.id === itemId ? n.itemProps.productGuid : t, null);

        this.props.productClicked(clickedProductGuid);
    }

    private itemRenderer({ item, timelineContext, itemContext, getItemProps, getResizeProps }): defaultItemRenderer {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
        const backgroundColor = item.itemProps.style.backgroundColor;
        const borderColor = item.itemProps.style.color;
        return (
            <div
                {...getItemProps({
                style: {
                    backgroundColor,
                    color: item.itemProps.style.color,
                    borderColor,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderLeftWidth: itemContext.selected ? 3 : 1,
                    borderRightWidth: itemContext.selected ? 3 : 1
                }
                })}
                onMouseEnter={() => {
                    Array.from(document.querySelectorAll('.rct-item'))
                        .filter(f => f.getAttribute('dataprodid') !== item.itemProps.productGuid)
                        .forEach(i => i.classList.add(styles.muted));
                }}
                onMouseLeave={() => {
                    Array.from(document.querySelectorAll(`.rct-item.${styles.muted}`))
                        .forEach(i => i.classList.remove(styles.muted));
                }}
                dataprodid={item.itemProps.productGuid}
                datateamid={item.itemProps.teamGuid}
            >
                <div
                    style={{
                        height: itemContext.dimensions.height,
                        overflow: 'hidden',
                        paddingLeft: 3,
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {itemContext.title}
                </div>
            </div>
        );
    }
}
