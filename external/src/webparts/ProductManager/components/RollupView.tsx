
import * as React from 'react';
import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
import { v4 as uuidv4 } from 'uuid';

import Timeline from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css'

import * as styles from './ProductManager.module.scss';

import { Label, Stack } from '@fluentui/react';
import { ProductModel } from '../../../models/ProductModel';
import AppService from '../../../services/AppService';
import { MetricService } from '../../../services/MetricService';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface IRollupViewProps {
    products: Array<ProductModel>;
}

export interface ITimelineGroup {
    id: number;
    guid: string;
    title: string;
}

export interface ITimelineItem {
    id: number;
    group: number;
    title: string;
    start_time: Date;
    end_time: Date;
    itemProps: IItemProps;
}

export interface IItemProps {
    productGuid: string;
}

export default class RollupView extends React.Component <IRollupViewProps, {}> {
    private get calendarGroups(): Array<ITimelineGroup> {
        return AppService.AppSettings.teams
            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
            .filter(f => f.active)
            .map((d, i, e) => {
                return {
                    id: i,
                    guid: d.id,
                    title: d.name
                } as ITimelineGroup
            });
    }

    private get calendarItems(): Array<any> {

        return this.props.products.reduce((t1, n1) => {
            const metrics = MetricService.GetTaskMetrics(n1.tasks);

            return n1.tasks.reduce((t2, n2) => {
                const retObj: ITimelineItem = {
                    id: new Date().getTime(),
                    group: this.calendarGroups.reduce((t, n) => n.guid === n2.taskedTeamId ? n.id : t, 0),
                    title: n1.title,
                    start_time: metrics.earliestStart,
                    end_time: metrics.latestFinish,
                    itemProps: { productGuid: n1.guid }
                };
                return t2.concat([retObj]);
            }, []);
        }, []);
    }

    public render(): React.ReactElement<IRollupViewProps> {
        return (
            <>
                <Stack horizontalAlign='center' verticalAlign='center' >
                    <Label style={{ fontSize: '2rem' }}>Rollup view is not yet ready</Label>
                </Stack>
                <Timeline
                    groups={this.calendarGroups}
                    items={this.calendarItems}
                    defaultTimeStart={startOfMonth(new Date())}
                    defaultTimeEnd={endOfMonth(new Date())}
                />
            </>
        );
    }
}
