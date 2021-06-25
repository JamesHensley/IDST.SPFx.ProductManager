import * as React from 'react';
// import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
// import { v4 as uuidv4 } from 'uuid';

import Timeline, { DateHeader, SidebarHeader, TimelineHeaders } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';

import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import AppService from '../../../services/AppService';
import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';
import ColorService from '../../../services/ColorService';
import TaskService from '../../../services/TaskService';

import * as styles from './ProductManager.module.scss';
import { Stack, Toggle } from '@fluentui/react';
import { ITimelineTeamGroup, ITimelineItem, TimelineTeamGroup, TimelineProductItem } from '../../../models/TimelineModels';

export interface IRollupViewProps {
    products: Array<ProductModel>;
    productClicked: (prodId: string) => void;
    defaultMonth: Date;
}

export interface IRollupViewState {
    /** Used to control whether multiple tasks for the same team on a single product should be merged */
    mergeTeamTasks: boolean;
    colorize: boolean;
    hideOpen: boolean;
    showEventsRow: boolean;
}

export default class RollupView extends React.Component <IRollupViewProps, IRollupViewState> {
    private tlRef: any;
    private calendarStart: Date;
    private calendarEnd: Date;

    constructor(props: IRollupViewProps) {
        super(props);
        this.calendarStart = startOfMonth(this.props.defaultMonth);
        this.calendarEnd = endOfMonth(this.props.defaultMonth);
        this.state = { mergeTeamTasks: true, colorize: true, hideOpen: true, showEventsRow: false };
    }

    private get calendarGroups(): Array<ITimelineTeamGroup> {
        const teamGroups = AppService.AppSettings.teams
        .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
        .filter(f => f.active)
        .map(d => {
            return new TimelineTeamGroup({
                teamGuid: d.teamId,
                title: d.name,
                stackItems: true
            });
        });

        // return [].concat.apply(teamGroups)
        return [].concat.apply((this.state.showEventsRow ? [{ guid: 'noGuid', title: 'Events', stackItems: true }] : []), teamGroups)
        .map((d, i) => { d.id = i; return d; });
    }

    private get calendarItems(): Array<ITimelineItem> {
        const productList = this.props.products.filter(f => this.state.hideOpen ? f.status === ProductStatus.closed : true);

        // return [].concat.apply(TaskService.BreakProductsToTasks(productList, this.state.mergeTeamTasks))
        return [].concat.apply((this.state.showEventsRow ? TaskService.BreakProductsToEvents(productList, 'noGuid') : []), (TaskService.BreakProductsToTasks(productList, this.state.mergeTeamTasks)))
        .map((d: ITimelineItem) => { d.group = this.calendarGroups.reduce((t, n) => n.teamGuid == d.teamGuid ? n.id : t, 0); return d; })
        .map((d, i) => { d.id = i; return d; });
    }

    public render(): React.ReactElement<IRollupViewProps> {
        const x1 = this.calendarItems;
        const x2 = this.calendarGroups;
        console.log('Render 1: ', x1);
        console.log('Render 2: ', x2);
        return (
            <Stack>
                <Stack horizontal tokens={{ childrenGap: 30 }}>
                    <Toggle
                        label={'Show events row'}
                        checked={this.state.showEventsRow}
                        onChange={() => this.setState({ showEventsRow: !this.state.showEventsRow })}
                    />
                    <Toggle
                        label={'Only show completed Products'}
                        checked={this.state.hideOpen}
                        onChange={() => this.setState({ hideOpen: !this.state.hideOpen })}
                    />
                    <Toggle
                        label={'Merge tasks from same team'}
                        checked={this.state.mergeTeamTasks}
                        onChange={() => this.setState({ mergeTeamTasks: !this.state.mergeTeamTasks })}
                    />
                    <Toggle
                        label={'Color by risk'}
                        checked={this.state.colorize}
                        onChange={() => this.setState({ colorize: !this.state.colorize })}
                    />
                </Stack>
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
                    onTimeChange={this.calendarTimeChange.bind(this)}
                    minZoom={1000 * 60 * 60 * 24 * 1}
                    maxZoom={1000 * 60 * 60 * 24 * 90}
                    itemHeightRatio={1.0}
                >
                    <TimelineHeaders className='sticky'>
                        <SidebarHeader>
                            {({ getRootProps }) => {
                                return (
                                    <div {...getRootProps()}></div>
                                );
                            }}
                        </SidebarHeader>
                        <DateHeader unit='primaryHeader' />
                        <DateHeader />
                    </TimelineHeaders>
                </Timeline>
            </Stack>
        );
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

    private calendarTimeChange(visibleTimeStart, visibleTimeEnd, updateScrollCanvas): void {
        // We are doing this so the calendar keeps it's viewport when the parent component re-renders
        this.calendarStart = new Date(visibleTimeStart);
        this.calendarEnd = new Date(visibleTimeEnd);
        updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
    }

    private itemClicked(itemId: number, e: Event, time: number): void {
        e.cancelBubble = true;
        e.preventDefault();
        const clickedProductGuid: string = this.calendarItems
            .reduce((t: string, n: ITimelineItem) => n.id === itemId ? n.itemProps.productGuid : t, null);

        this.props.productClicked(clickedProductGuid);
    }

    private itemRenderer({ item, timelineContext, itemContext, getItemProps, getResizeProps }): JSX.Element {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
        // const backgroundColor = item.itemProps.style.backgroundColor;
        const backgroundColor = (this.state.colorize || item.isEvent) ? item.itemProps.style.backgroundColor : AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === item.productType ? n.colorValue : t, '');
        const borderColor = 'rgb(0, 0, 0)';
        const textColor = (this.state.colorize && !item.isEvent) ? 'rgb(0, 0, 0)' : ColorService.GetTextColor(backgroundColor);
console.log(item);
        return (
            <div
                dataprodid={item.itemProps.productGuid}
                datateamid={item.itemProps.teamGuid}
                {...getItemProps({
                    style: {
                        color: textColor,
                        backgroundColor,
                        borderColor,
                        borderStyle: 'solid',
                        borderWidth: 1,
                        borderRadius: (item.isEvent ? 0 : 4)
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
