import * as React from 'react';
// import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
// import { v4 as uuidv4 } from 'uuid';

import Timeline, { DateHeader, SidebarHeader, TimelineHeaders } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';

import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import AppService from '../../../services/AppService';
import { MetricService } from '../../../services/MetricService';
import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';
import ColorService from '../../../services/ColorService';
import TaskService from '../../../services/TaskService';

import * as styles from './ProductManager.module.scss';
import { Toggle } from '@fluentui/react';
import { ITimelineItem, TimelineEventItem, TimelineProductItem } from '../../../models/TimelineModels';

export interface IRollupViewProps {
    products: Array<ProductModel>;
    productClicked: (prodId: string) => void;
    defaultMonth: Date;
}

export interface IRollupViewState {
    /** Used to control whether multiple tasks for the same team on a single product should be merged */
    mergeTeamTasks: boolean;
    colorize: boolean;
}

export interface ITimelineGroup {
    id: number;
    guid: string;
    title: string;
    stackItems: boolean;
}

export default class RollupView extends React.Component <IRollupViewProps, IRollupViewState> {
    private tlRef: any;
    private calendarStart: Date;
    private calendarEnd: Date;

    constructor(props: IRollupViewProps) {
        super(props);
        this.calendarStart = startOfMonth(this.props.defaultMonth);
        this.calendarEnd = endOfMonth(this.props.defaultMonth);
        this.state = { mergeTeamTasks: true, colorize: true };
    }

    private get calendarGroups(): Array<ITimelineGroup> {
        const teamGroups = AppService.AppSettings.teams
            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
            .filter(f => f.active)
            .map(d => {
                return {
                    guid: d.teamId,
                    title: d.name,
                    stackItems: true
                } as ITimelineGroup;
            });
        const eventGroup = { guid: 'noGuid', title: 'Events', stackItems: true } as ITimelineGroup
        return [eventGroup].concat(teamGroups).map((d, i) => { d.id = i; return d; });
    }

    private get calendarItems(): Array<TimelineProductItem> {
        return TaskService.BreakProductsToTasks(this.props.products, this.state.mergeTeamTasks);
    }

    public render(): React.ReactElement<IRollupViewProps> {
        return (
            <>
                <Toggle
                    label={'Merge team tasks'}
                    checked={this.state.mergeTeamTasks}
                    onChange={() => this.setState({ mergeTeamTasks: !this.state.mergeTeamTasks })}
                />
                <Toggle
                    label={'Risk'}
                    checked={this.state.colorize}
                    onChange={() => this.setState({ colorize: !this.state.colorize })}
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
                    minZoom={1000 * 60 * 60 * 24 * 1}
                    maxZoom={1000 * 60 * 60 * 24 * 90}
                    itemHeightRatio={0.9}
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
            </>
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

    private calendarBoundsChanged(): void {
        console.log('calendarBoundsChanged', arguments);
        this.calendarStart = addDays(new Date(arguments[0]), 30);
        this.calendarEnd = subDays(new Date(arguments[1]), 30);
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
        const backgroundColor = item.itemProps.style.backgroundColor;
        //const borderColor = item.itemProps.style.color;
        const borderColor = 'rgb(0, 0, 0)';

        return (
            <div
                dataprodid={item.itemProps.productGuid}
                datateamid={item.itemProps.teamGuid}
                {...getItemProps({
                    style: {
                        color: item.itemProps.style.color,
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
