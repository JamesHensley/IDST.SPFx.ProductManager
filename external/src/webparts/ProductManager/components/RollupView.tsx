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

import * as styles from './ProductManager.module.scss';
import { MetricModel } from '../../../models/MetricModel';

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
        const retObj =  this.props.products
        .filter(f => f.status === ProductStatus.closed)
        .reduce((t: Array<ITimelineItem>, n: ProductModel) => {
            const prodModel = AppService.AppSettings.productTypes.reduce((t1, n1) => n1.typeId == n.productType ? n1 : t1, null);

            const item: Array<ITimelineItem> = (
                    (teamIds => teamIds.map(d => MetricService.GetTaskMetrics(n.tasks.filter(f => f.taskedTeamId === d))))
                    (n.tasks.reduce((t1, n1) => t1.indexOf(n1.taskedTeamId) < 0 ? [].concat.apply(t1, [n1.taskedTeamId]) : t1, []))
                )
                .map((d: MetricModel) => {
                return {
                    id: 0,
                    group: this.calendarGroups.reduce((a, b) => b.guid === d.teamIds[0] ? b.id : a, 0),
                    title: n.title,
                    start_time: d.earliestStart.getTime(),
                    end_time: d.latestFinish.getTime(),
                    canChangeGroup: false, canMove: false, canResize: false,
                    itemProps: {
                        productGuid: n.guid,
                        style: {
                            backgroundColor:  prodModel ? prodModel.colorValue : '',
                            selectedBgColor:  prodModel ? prodModel.colorValue : '',
                            color: prodModel ? ColorService.GetTextColor(prodModel.colorValue) : ''
                        }
                    }
                } as ITimelineItem;
            });

            return [].concat.apply(t, [item]);
        }, [])
        .map((d: ITimelineItem, i: number) => { d.id = i; return d; });
        console.log('Returning: ', retObj);
        return retObj;
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
