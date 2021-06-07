import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, DetailsRow, Dropdown, Facepile, IColumn, Icon, IconButton,
  IDetailsRowProps,
  IDropdownOption, IDropdownProps, IFacepilePersona, IRenderFunction, ISelectableDroppableTextProps,
  Label, mergeStyleSets, SelectionMode, Stack, TextField, TooltipHost } from '@fluentui/react';

import { format } from 'date-fns';
import AppService from '../../../services/AppService';
import { RecordService } from '../../../services/RecordService';
import { TaskModel } from '../../../models/TaskModel';
import { TeamModel } from '../../../models/TeamModel';
import { ColumnSelector } from './FormComponents/ColumnSelector';

const classNames = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden',
      },
    },
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px',
  },
  controlWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  exampleToggle: {
    display: 'inline-block',
    marginBottom: '10px',
    marginRight: '30px',
  },
  selectionDetails: {
    marginBottom: '20px',
  },
});

const controlStyles = {
  root: {
    margin: '0 30px 20px 0',
    maxWidth: '500px',
  },
};

/**
 * Used to preserve the filter and sorting settings when the component is destroyed & rebuilt
 */
class SortFilterSetting {
  private static filterText: string = '';
  public static get FilterText() { return this.filterText; }
  public static set FilterText(val: string) { this.filterText = val; }

  private static sortField: string = 'openDate';
  public static get SortField() { return this.sortField; }
  public static set SortField(val: string) { this.sortField = val; }

  private static sortDir: number = 1;
  public static set SortDir(val: number) { this.sortDir = val; }
  public static get SortDir() { return this.sortDir; }

  private static displayedFields: Array<IColumn> = ([
    {
      key: 'column0',
      name: 'Type',
      minWidth: 100, maxWidth: 150,
      fieldName: 'productType',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'object', colCount: 2, displayed: true }
    },
    {
      key: 'column1',
      name: 'Status',
      minWidth: 50, maxWidth: 80,
      fieldName: 'productStatus',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'string', colCount: 1, displayed: true }
    },
    {
      key: 'column2',
      name: 'Title',
      minWidth: 100, maxWidth: 200,
      fieldName: 'title',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'string', colCount: 2, displayed: true }
    },
    {
      key: 'column3',
      name: 'Description',
      minWidth: 100,
      fieldName: 'description',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'string', colCount: 4, displayed: true }
    },
    {
      key: 'column4',
      name: 'Open Date',
      minWidth: 100,
      fieldName: 'openDate',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'string', colCount: 1, displayed: true }
    },
    {
      key: 'column5',
      name: 'Expected Return',
      minWidth: 130,
      fieldName: 'expectedReturnDate',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'string', colCount: 1, displayed: true }
    },
    {
      key: 'column6',
      name: 'Tasked Teams',
      minWidth: 120,
      fieldName: 'tasks',
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: { type: 'object', colCount: 1, displayed: true }
    }
  ])
  .map(d => {
    // Handle the sorting icons
    d.isSorted = SortFilterSetting.SortField === d.fieldName;
    d.isSortedDescending = d.isSorted && SortFilterSetting.SortDir === -1;
    return d;
  });

  public static set DisplayedFields(val: Array<IColumn>) {
    this.displayedFields = this.displayedFields
      .map(d => { d.data.displayed = (val.map(d => d.fieldName)).indexOf(d.fieldName) >= 0; return d; });
  }

  public static get DisplayedFields() { return this.displayedFields.filter(f => f.data.displayed); }
}

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
}

export interface IProductListProps { allProducts: Array<ProductModel>, productClicked: (id: string) => void }
export interface IProductListState { lastUpdate: number, showingColumnMenu: boolean }

export default class ProductList extends React.Component<IProductListProps, IProductListState> {
  private get allItems(): Array<IDocument> {
    console.log('ProductList.allItems: ', this.props.allProducts);
    return (this.props.allProducts || [])
    .filter(i => (i.filterString.toLowerCase().indexOf(SortFilterSetting.FilterText.toLowerCase()) >= 0))
    .map(d => {
      return {
        key: d.guid,
        title: d.title,
        description: d.description,
        value: d.guid,
        teamIcon: '',
        productType: d.productType,
        productStatus: d.status,
        openDate: format(new Date(d.requestDate), AppService.DateFormatValue),
        expectedReturnDate: format(new Date(d.returnDateExpected), AppService.DateFormatValue),
        closeDate: d.returnDateActual || '',
        tasks: d.tasks || []
      } as IDocument;
    })
    .sort((a,b) => {
      return a[SortFilterSetting.SortField] > b[SortFilterSetting.SortField] ? (1 * SortFilterSetting.SortDir) : (a[SortFilterSetting.SortField] < b[SortFilterSetting.SortField] ? -1 * SortFilterSetting.SortDir : 0)
    });
  };

  private get allColumns(): Array<IColumn> {
    return SortFilterSetting.DisplayedFields.map(d => {
      d.onColumnClick=this.onColumnClick.bind(this, d);
      d.onRender=((i: IDocument, idx, col) => {
        switch (col.fieldName) {
          case 'productType':
            return <div>{AppService.AppSettings.productTypes.reduce((t,n) => n.typeId == i[col.fieldName] ? n.typeName : t, '')}</div>;
          case 'tasks':
            const tasks: Array<string> = (i.tasks as Array<TaskModel> || new Array<TaskModel>()).map(t => t.taskedTeamId);
            const personas: IFacepilePersona[] = AppService.AppSettings.teams.reduce((t: Array<TeamModel>, n: TeamModel) => tasks.indexOf(n.id) >= 0 ? t.concat(n) : t, [])
              .map(d => { return { imageInitials: d.shortName, personaName: d.name } as IFacepilePersona });
            return <Facepile personas={personas} />
          default:
            return <div>{i[col.fieldName]}</div>
        }
      });
      return d;
    });
  };

  constructor(props: IProductListProps) {
    super(props);
    this.state = { lastUpdate: new Date().getTime(), showingColumnMenu: false }
  }

  public render(): React.ReactElement<IProductListProps> {
    const dropdownStyles = { dropdown: { width: '10px' } };
    /*
      <Dropdown
        options={this.allColumns.map(d => { return { key: d.fieldName, text: d.name  } as IDropdownOption })}
        styles={dropdownStyles}
      />
    */
    return (
      <div className={`${styles.productList} ${styles.grid}`}>
        <div className={styles.gridRow}>
          <div className={styles.gridCol12}>
            <TextField label='Filter by title, description, product type or team name:' onChange={this.onChangeFilter} styles={controlStyles} value={SortFilterSetting.FilterText} />

          </div>
        </div>

        <DetailsList
          key={this.state.lastUpdate}
          items={this.allItems}
          columns={this.allColumns}
          selectionMode={SelectionMode.none}
          compact={true}
          onRenderRow={(props: IDetailsRowProps) => {
            return (<div onClick={this.onRowClick.bind(this, props)}>
              <DetailsRow {...props} styles={{root: { cursor: 'pointer' }}} />
            </div>);
          }}
        />
      </div>
    );
  }

  private onRowClick(i?: IDetailsRowProps, ev?: React.FocusEvent<HTMLElement>): void {
    this.props.productClicked(i.item.key);
  }

  private onColumnClick = (column: IColumn, ev: Event): void => {
    ev.preventDefault();
    SortFilterSetting.SortField = column.fieldName;
    SortFilterSetting.SortDir = SortFilterSetting.SortDir * -1;
    this.setState({ lastUpdate: new Date().getTime() });
  }

  private onShowColumnsMenu(): void {
    console.log('ProductList.onShowColumnsMenu');
    this.setState({ showingColumnMenu: !((this.state && this.state.showingColumnMenu) || false) });
  }
  
  private onChangeFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    SortFilterSetting.FilterText = text;
    this.setState({ lastUpdate: new Date().getTime() });
  }

  private onHideShowCols(items: Array<IColumn>): void {

  }
}
