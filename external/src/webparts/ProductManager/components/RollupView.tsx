import * as React from 'react';
// import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
// import { v4 as uuidv4 } from 'uuid';

import Timeline, { defaultItemRenderer } from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css'

import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import AppService from '../../../services/AppService';
import { MetricService } from '../../../services/MetricService';
import { startOfMonth, endOfMonth } from 'date-fns';
import ColorService from '../../../services/ColorService';

import * as styles from './ProductManager.module.scss';
import { MetricModel } from '../../../models/MetricModel';

export interface IRollupViewProps {
    products: Array<ProductModel>;
    productClicked: (prodId: string) => void;
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

    constructor(props: IRollupViewProps) {
        super(props);
        this.state = { mergeTeamTasks: false };
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
                } as ITimelineGroup
            });
    }

    private get calendarItems(): Array<ITimelineItem> {
        const retObj =  this.props.products
        .filter(f => f.status === ProductStatus.closed)
        .map(d => {
            const prodModel = AppService.AppSettings.productTypes.reduce((t1, n1) => n1.typeId == d.productType ? n1 : t1, null);
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
            })
        })
        .reduce((t, n) => [].concat.apply(t, n))
        .reduce((t, n, i, e) => {
            if (this.state.mergeTeamTasks) {
                // TODO: Merge the tasks here
                return [].concat.apply(t, [n]);
            } else {
                return [].concat.apply(t, [n]);
            }
        }, [])
        .map((d, i) => { d.id = i; return d; });

        return retObj;
    }

    public render(): React.ReactElement<IRollupViewProps> {
        const items = this.calendarItems;
        const groups = this.calendarGroups;

        return (
            <Timeline
                key={new Date().getTime()}
                ref={r => (this.tlRef = r)}
                groups={this.calendarGroups}
                items={this.calendarItems}
                defaultTimeStart={startOfMonth(new Date())}
                defaultTimeEnd={endOfMonth(new Date())}
                stackItems
                canMove={false}
                canChangeGroup={false}
                canResize={false}
                onItemSelect={this.itemClicked.bind(this)}
                onItemClick={this.itemClicked.bind(this)}
                timeSteps={{ second: 0, minute: 0, hour: 0, day: 1, month: 1, year: 1 }}
                itemRenderer={this.itemRenderer.bind(this)}
            />
        );
    }

    public componentDidMount(): void {
        //The timeline component has problems being rendered within SP (maybe just the workbench), so we force
        // a recalc/redraw of the component once it's been mounted
        this.tlRef.resize();
    }

    public componentDidUpdate(): void {
        //The timeline component has problems being rendered within SP (maybe just the workbench), so we force
        // a recalc/redraw of the component whenever the data changes; a RENDER doesn't force the timeline to
        // recalculate it's bounding box... maybe we should use the "resizeDetector" bundled with timeline
        this.tlRef.resize();
    }

    private itemClicked(itemId: number, e: Event, time: number): void {
        e.cancelBubble = true;
        e.preventDefault();
        const clickedProductGuid: string = this.calendarItems
            .reduce((t: string, n: ITimelineItem) => n.id === itemId ? n.itemProps.productGuid : t, null);

        this.props.productClicked(clickedProductGuid);
    }

    private itemRenderer({item, timelineContext, itemContext, getItemProps, getResizeProps}): defaultItemRenderer {
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
                borderStyle: "solid",
                borderWidth: 1,
                borderRadius: 4,
                borderLeftWidth: itemContext.selected ? 3 : 1,
                borderRightWidth: itemContext.selected ? 3 : 1
              },
              // onMouseDown: () => { console.log("on item click", item); }
            })}
            onMouseEnter={() => {
                console.log('HoverOn: ', item.itemProps);
                Array.from(document.querySelectorAll('.rct-item'))
                    .filter(f => f.getAttribute('dataprodid') != item.itemProps.productGuid )
                    .forEach(i => i.classList.add(styles.muted));
            }}
            onMouseLeave={() => {
                console.log('HoverOff: ', item.itemProps);
                Array.from(document.querySelectorAll(`.rct-item.${styles.muted}`))
                    .forEach(i => i.classList.remove(styles.muted));
            }}
            dataprodid={item.itemProps.productGuid}
            datateamid={item.itemProps.teamGuid}
          >
            <div
              style={{
                height: itemContext.dimensions.height,
                overflow: "hidden",
                paddingLeft: 3,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {itemContext.title}
            </div>
          </div>
        );
      };
}
