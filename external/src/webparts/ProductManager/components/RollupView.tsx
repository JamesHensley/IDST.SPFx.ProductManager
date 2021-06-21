import * as React from 'react';
// import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
// import { v4 as uuidv4 } from 'uuid';

import Timeline from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css'

import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import AppService from '../../../services/AppService';
import { MetricService } from '../../../services/MetricService';
import { startOfMonth, endOfMonth } from 'date-fns';
import ColorService from '../../../services/ColorService';

export interface IRollupViewProps {
    products: Array<ProductModel>;
    productClicked: (prodId: string) => void;
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
    style: any;
}

export default class RollupView extends React.Component <IRollupViewProps, {}> {
    private tlRef: Timeline;

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
        const retArray: Array<ITimelineItem> = this.props.products
        .filter(f => f.status === ProductStatus.closed)
        .reduce((t1, n1) => {
            const metrics = MetricService.GetTaskMetrics(n1.tasks);
            const xx = n1.tasks.reduce((t2, n2) => {
                const prodModel = AppService.AppSettings.productTypes.reduce((t, n) => n.typeId == n1.productType ? n : t, null);
                const retObj: ITimelineItem = {
                    id: 0,
                    group: this.calendarGroups.reduce((t, n) => n.guid === n2.taskedTeamId ? n.id : t, 0),
                    title: n1.title,
                    start_time: metrics.earliestStart.getTime(),
                    end_time: metrics.latestFinish.getTime(),
                    canChangeGroup: false, canMove: false, canResize: false,
                    itemProps: {
                        productGuid: n1.guid,
                        style: {
                            backgroundColor:  prodModel ? prodModel.colorValue : '',
                            selectedBgColor:  prodModel ? prodModel.colorValue : '',
                            color: prodModel ? ColorService.GetTextColor(prodModel.colorValue) : ''
                        }
                    }
                };
                return t2.concat([retObj]);
            }, []);
            return t1.concat(xx);
        }, [])
        .filter((f, i, e) => e.map(m => m.itemProps.productGuid).indexOf(f.itemProps.productGuid) === i)
        .map((d, i) => { d.id = i; return d; });
        return retArray;
    }

    public render(): React.ReactElement<IRollupViewProps> {
        const items = this.calendarItems;
        const groups = this.calendarGroups;

        return (
            <Timeline
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
}
