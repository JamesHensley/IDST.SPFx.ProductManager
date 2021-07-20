import * as React from 'react';
// import { ChartControl, ChartType } from '@pnp/spfx-controls-react';
// import { v4 as uuidv4 } from 'uuid';

import Timeline, { DateHeader, SidebarHeader, TimelineHeaders } from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';

import { ProductModel, ProductStatus } from '../../../../models/ProductModel';
import AppService from '../../../../services/AppService';
import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';
import ColorService from '../../../../services/ColorService';
import TaskService from '../../../../services/TaskService';

import * as styles from '../ProductManager.module.scss';
import { Stack, Toggle } from '@fluentui/react';
import { ITimelineTeamGroup, ITimelineItem, TimelineTeamGroup, TimelineProductItem } from '../../../../models/TimelineModels';
import RecordService from '../../../../services/RecordService';
import ProductDetailPane from '../SharedComponents/ProductDetailPane';

export interface IRollupViewProps {
    // products: Array<ProductModel>;
    // productClicked: (prodId: string) => void;
    // defaultMonth: Date;
}

export interface IRollupViewState {
    products: Array<ProductModel>;
    mergeTeamTasks: boolean;
    colorBySuspense: boolean;
    hideOpenProducts: boolean;
    showEventsRow: boolean;
    currentProduct: ProductModel;
}

export default class RollupView extends React.Component <IRollupViewProps, IRollupViewState> {
    private tlRef: any;
    private calendarStart: Date;
    private calendarEnd: Date;

    constructor(props: IRollupViewProps) {
        super(props);
        this.calendarStart = startOfMonth(new Date());
        this.calendarEnd = endOfMonth(new Date());
        this.state = { mergeTeamTasks: true, colorBySuspense: true, hideOpenProducts: true, showEventsRow: false, products: [], currentProduct: null };
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

        return [].concat.apply((this.state.showEventsRow ? [{ guid: 'noGuid', title: 'Events', stackItems: true }] : []), teamGroups)
        .map((d, i) => { d.id = i; return d; });
    }

    private get calendarItems(): Array<any> {
        const productList = this.state.products.filter(f => this.state.hideOpenProducts ? f.status === ProductStatus.closed : true);

        return [].concat.apply((this.state.showEventsRow ? TaskService.BreakProductsToEvents(productList, 'noGuid') : []), (TaskService.BreakProductsToTasks(productList, this.state.mergeTeamTasks)))
        .map((d: ITimelineItem) => { d.group = this.calendarGroups.reduce((t, n) => n.teamGuid === d.teamGuid ? n.id : t, 0); return d; })
        .map((d, i) => { d.id = i; return d; });
    }

    public render(): React.ReactElement<IRollupViewProps> {
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
                        checked={this.state.hideOpenProducts}
                        onChange={() => this.setState({ hideOpenProducts: !this.state.hideOpenProducts })}
                    />
                    <Toggle
                        label={'Merge tasks from same team'}
                        checked={this.state.mergeTeamTasks}
                        onChange={() => this.setState({ mergeTeamTasks: !this.state.mergeTeamTasks })}
                    />
                    <Toggle
                        label={'Color by broken suspenses'}
                        checked={this.state.colorBySuspense}
                        onChange={() => this.setState({ colorBySuspense: !this.state.colorBySuspense })}
                    />
                </Stack>
                <Timeline
                    key={new Date().getTime()}
                    keys={{
                        groupIdKey: 'id',
                        groupTitleKey: 'title',
                        groupRightTitleKey: 'rightTitle',
                        itemIdKey: 'id',
                        itemTitleKey: 'title',    // key for item div content
                        itemDivTitleKey: 'title', // key for item div title (<div title="text"/>)
                        itemGroupKey: 'group',
                        itemTimeStartKey: 'startTime',
                        itemTimeEndKey: 'endTime'
                    }}
                    ref={r => (this.tlRef = r)}
                    groups={this.calendarGroups}
                    items={this.calendarItems}
                    defaultTimeStart={this.calendarStart}
                    defaultTimeEnd={this.calendarEnd}
                    stackItems
                    canMove={false}
                    canChangeGroup={false}
                    canResize={false}
                    // Moved the ItemClick logic into the itemRenderer method to overcome
                    //   inconsistencies in the library
                    onItemSelect={this.itemSelected.bind(this)}
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
                {
                    this.state.currentProduct &&
                    <ProductDetailPane
                        currentProduct={this.state.currentProduct}
                        isVisible={true}
                        isEditing={false}
                        readOnly={true}
                        closePane={() => this.setState({ currentProduct: null })}
                        saveProduct={null}
                    />
                }
            </Stack>
        );
    }

    public componentDidMount(): void {
        // The timeline component has problems being rendered within SP (maybe just the workbench), so we force
        //  a recalc/redraw of the component once it's been mounted
        this.tlRef.resize();
        RecordService.GetProducts()
        .then(prods => {
            this.setState({ products: prods });
        })
        .catch(e => Promise.reject(e));
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

    private itemClicked(i: TimelineProductItem): void {
        event.preventDefault();
        event.cancelBubble = true;
        this.setState({ currentProduct: this.state.products.reduce((t,n) => n.guid === i.itemProps.productGuid ? n : t, null) });
    }

    private itemSelected(itemId: number, e: Event, time: number): void {
        event.preventDefault();
        event.cancelBubble = true;
        const clickedProductGuid: string = this.calendarItems
            .reduce((t: string, n: ITimelineItem) => n.id === itemId ? n.itemProps.productGuid : t, null);
        this.setState({ currentProduct: this.state.products.reduce((t,n) => n.guid === clickedProductGuid ? n : t, null) });
    }

    private itemRenderer({ item, timelineContext, itemContext, getItemProps, getResizeProps }): JSX.Element {
        const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
        const backgroundColor = (this.state.colorBySuspense || item.isEvent) ? item.itemProps.style.backgroundColor : AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === item.productType ? n.colorValue : t, '');
        const textColor = item.isEvent ? 'rgb(0, 0, 0)' : ColorService.GetTextColor(backgroundColor);
        const borderColor = 'rgb(0, 0, 0)';

        return (
            <div
                dataprodid={item.itemProps.productGuid}
                datateamid={item.itemProps.teamGuid}
                {...getItemProps({
                    style: {
                        color: textColor,
                        backgroundColor,
                        selectedBgColor: backgroundColor,
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
                onClick={() => {
                    event.cancelBubble = true;
                    event.preventDefault();
                    // this.props.productClicked(item.itemProps.productGuid);
                    this.itemClicked(item);
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
