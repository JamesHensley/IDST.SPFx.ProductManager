import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel } from '../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, DetailsRow, Facepile, IColumn, IDetailsRowProps, IFacepilePersona, Label, SelectionMode, Stack, TextField } from '@fluentui/react';
import { format } from 'date-fns';
import AppService from '../../../services/AppService';
import { TaskModel } from '../../../models/TaskModel';
import { TeamModel } from '../../../models/TeamModel';
import { FilterService } from '../../../services/FilterService';

export interface IDocument {
  key: string;
  title: string;
  description: string;
  value: string;
  teamIcon: string;
  productType: string;
  productStatus: string;
  openDate: string;
  expectedReturnDate: string;
  closeDate: string;
  tasks: Array<TaskModel>;
  eventType: string;
  eventDate: string;
  classification: string;
}

export interface IProductListProps { allProducts: Array<ProductModel>; productClicked: (id: string) => void; }
export interface IProductListState { lastUpdate: number; showingColumnMenu: boolean; }

export default class ProductList extends React.Component<IProductListProps, IProductListState> {

  /** Data displayed in the list */
  private get allItems(): Array<IDocument> {
    return (this.props.allProducts || [])
    .filter(i => (i.filterString.toLowerCase().indexOf(FilterService.FilterText.toLowerCase()) >= 0))
    .map(d => {
      return {
        key: d.guid,
        title: d.title,
        description: d.description,
        value: d.guid,
        teamIcon: '',
        productType: AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === d.productType ? n.typeName : t, ''),
        productStatus: d.status,
        openDate: d.requestDate ? format(d.requestDate, AppService.DateFormatValue) : '',
        expectedReturnDate: d.returnDateExpected ? format(d.returnDateExpected, AppService.DateFormatValue) : '',
        closeDate: d.returnDateActual ? format(d.returnDateActual, AppService.DateFormatValue) : '',
        eventType: AppService.AppSettings.eventTypes.reduce((t,n) => n.eventTypeId === d.eventType ? n.eventTitle : t, ''),
        eventDate: d.eventDateStart ? format(d.eventDateStart, AppService.DateFormatValue) : '',
        classification: AppService.AppSettings.classificationModels.reduce((t,n) => n.classificationId === d.classificationId ? n.classificationTitle : t, ''),
        tasks: d.tasks || []
      } as IDocument;
    })
    .sort((a,b) => {
      return a[FilterService.SortField] > b[FilterService.SortField] ? (1 * FilterService.SortDir) : (a[FilterService.SortField] < b[FilterService.SortField] ? -1 * FilterService.SortDir : 0);
    });
  }

  /** Column definitions for the list */
  private get allColumns(): Array<IColumn> {
    return FilterService.DisplayedFields.map(d => {
      d.onColumnClick = this.onColumnClick.bind(this, d);
      d.onRender = ((i: IDocument, idx, col) => {
        switch (col.fieldName) {
            case 'tasks':
            const tasks: Array<string> = (i.tasks as Array<TaskModel> || new Array<TaskModel>()).map(t => t.taskedTeamId);
            const personas: IFacepilePersona[] = AppService.AppSettings.teams.reduce((t: Array<TeamModel>, n: TeamModel) => tasks.indexOf(n.id) >= 0 ? t.concat(n) : t, [])
              .map(d => { return { imageInitials: d.shortName, personaName: d.name } as IFacepilePersona; });
            return <Facepile personas={personas} />;
          default:
            return <div>{i[col.fieldName]}</div>;
        }
      });
      return d;
    });
  }

  constructor(props: IProductListProps) {
    super(props);
    FilterService.RegisterListFields([
      { key: 'productType', name: 'Type', minWidth: 100, maxWidth: 150, fieldName: 'productType', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 2, displayed: true } },
      { key: 'productStatus', name: 'Status', minWidth: 50, maxWidth: 80, fieldName: 'productStatus', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'string', colCount: 1, displayed: true } },
      { key: 'title', name: 'Title', minWidth: 100, maxWidth: 300, fieldName: 'title', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'string', colCount: 2, displayed: true } },
      { key: 'eventType', name: 'Event Type', minWidth: 100, maxWidth: 200, fieldName: 'eventType', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
      { key: 'openDate', name: 'Open Date', minWidth: 100, maxWidth: 150, fieldName: 'openDate', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
      { key: 'expectedReturnDate', name: 'Expected Return', minWidth: 100, maxWidth: 150, fieldName: 'expectedReturnDate', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
      { key: 'eventDate', name: 'Event Date', minWidth: 100, maxWidth: 150, fieldName: 'eventDate', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
      { key: 'tasks', name: 'Tasked Teams', minWidth: 100, maxWidth: 300, fieldName: 'tasks', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } }
    ]);

    this.state = { lastUpdate: new Date().getTime(), showingColumnMenu: false };
  }

  public render(): React.ReactElement<IProductListProps> {
    const items = this.allItems;
    return (
      <Stack>
        <TextField
          styles={{ root: { width: '100%' } }}
          label={`Filter text - [${items.length} items displayed]`}
          onChange={this.onChangeFilter}
          value={FilterService.FilterText}
        />
        <DetailsList
          key={this.state.lastUpdate}
          items={items}
          columns={this.allColumns}
          selectionMode={SelectionMode.none}
          compact={true}
          layoutMode={DetailsListLayoutMode.justified}
          skipViewportMeasures={false}
          onRenderRow={(props: IDetailsRowProps) => {
            return (
              <div onClick={this.onRowClick.bind(this, props)}>
                <DetailsRow {...props} styles={{ root: { cursor: 'pointer' } }} />
              </div>);
          }}
        />
      </Stack>
    );
  }

  /** Handler for when a user clicks a row to view the records details */
  private onRowClick(i?: IDetailsRowProps, ev?: React.FocusEvent<HTMLElement>): void {
    this.props.productClicked(i.item.key);
  }

  /** Handler for when a user clicks a column heading to sort the list */
  private onColumnClick = (column: IColumn, ev: Event): void => {
    ev.preventDefault();
    FilterService.SortField = column.fieldName;
    FilterService.SortDir = FilterService.SortDir * -1;
    this.setState({ lastUpdate: new Date().getTime() });
  }

  /** Handler for when text is changed in the filter control */
  private onChangeFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    FilterService.FilterText = text;
    this.setState({ lastUpdate: new Date().getTime() });
  }

  /** Will be used to show/hide columns */
  private onShowColumnsMenu(): void {
    // this.setState({ showingColumnMenu: !((this.state && this.state.showingColumnMenu) || false) });
  }
}
