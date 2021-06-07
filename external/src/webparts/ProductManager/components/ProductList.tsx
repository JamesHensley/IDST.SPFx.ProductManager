import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, Facepile, IColumn, IconButton, IFacepilePersona, Label, mergeStyleSets, SelectionMode, Stack, TextField, TooltipHost } from '@fluentui/react';
import { format } from 'date-fns';
import AppService from '../../../services/AppService';
import { RecordService } from '../../../services/RecordService';
import { TaskModel } from '../../../models/TaskModel';
import { TeamModel } from '../../../models/TeamModel';

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
  private static filterText: string = "";
  public static get FilterText() { return this.filterText; };
  public static set FilterText(val: string) { this.filterText = val; };

  private static sortField: string = "openDate";
  public static get SortField() { return this.sortField }
  public static set SortField(val: string) { this.sortField = val }

  private static sortDir: number = 1;
  public static set SortDir(val: number) { this.sortDir = val }
  public static get SortDir() { return this.sortDir }
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
  //modifiedBy: string;
  //dateModified: string;
  //dateModifiedValue: number;
}

export interface IProductListProps { allProducts: Array<ProductModel>, productClicked: (id: string) => void }
export interface IProductListState { lastUpdate: number }

export interface IListColumn {
  key: string,
  name: string,
  fieldName: string,
  isRowHeader: boolean,
  isSorted: boolean,
  isSortedDescending: boolean,
  data: string,
  colCount: number
}
export default class ProductList extends React.Component<IProductListProps, IProductListState> {


  private get allItems(): Array<IDocument> {
    return (this.props.allProducts || [])
    .filter(i => (i.filterString.toLowerCase().indexOf(SortFilterSetting.FilterText) >= 0))
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

  private get allColumns(): Array<IListColumn> {
    return ([
      {
        key: 'column1',
        name: 'Status',
        fieldName: 'productStatus',
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        data: 'string',
        colCount: 1
      },
      {
        key: 'column2',
        name: 'Title',
        fieldName: 'title',
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        data: 'string',
        colCount: 2
      },
      {
        key: 'column3',
        name: 'Description',
        fieldName: 'description',
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        data: 'string',
        colCount: 4
      },
      {
        key: 'column4',
        name: 'Open Date',
        fieldName: 'openDate',
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        data: 'string',
        colCount: 2
      },
      {
        key: 'column5',
        name: 'Expected Return',
        fieldName: 'expectedReturnDate',
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        data: 'string',
        colCount: 2
      },
      {
        key: 'column6',
        name: 'Tasked Teams',
        fieldName: 'tasks',
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        data: 'object',
        colCount: 1
      }
    ])
    .map(d => {
      // Handle the sorting icons
      d.isSorted = SortFilterSetting.SortField == d.fieldName;
      d.isSortedDescending = d.isSorted && SortFilterSetting.SortDir == -1;
      return d;
    });
  };

  public render(): React.ReactElement<IProductListProps> {
    return (
      <div className={`${styles.productList} ${styles.grid}`}>
        <div className={styles.gridRow}>
          <div className={styles.gridCol12}>
            <TextField label="Filter by title, description, product type or team name:" onChange={this.onChangeFilter} styles={controlStyles} value={SortFilterSetting.FilterText} />
          </div>
        </div>

        <div className={`${styles.gridRow} ${styles.listColumnHeader} ${styles.listDataRow}`}>
          {this.allColumns.map(c => {
            const clsName = `${styles.listDataCell} ${styles['gridCol' + c.colCount]}`;
            return (
              <Label key={c.fieldName}
                className={clsName}
                onClick={this.onColumnClick.bind(this, c)}
              >
                {c.isRowHeader ?  c.name : ''}
                {c.isSorted && !c.isSortedDescending && <IconButton iconProps={{ iconName: 'SortUp' }} className={styles.appIcon} title='' ariaLabel='' />}
                {c.isSorted && c.isSortedDescending && <IconButton iconProps={{ iconName: 'SortDown' }} className={styles.appIcon} title='' ariaLabel='' />}
              </Label>
            );
          })}
        </div>
        
        {this.allItems.map(r => {
          return (
            <div className={`${styles.gridRow} ${styles.listDataRow}`} onClick={this.itemClicked.bind(this, r)} key={r.key}>
              {this.allColumns.map(c => {
                const clsName = `${styles.listDataCell} ${styles['gridCol' + c.colCount]}`;
                if(c.data == 'string') {
                  return (
                    <div key={c.fieldName} className={clsName}>{r[c.fieldName]}</div>
                  );
                }
                else {
                  if(c.fieldName == 'tasks') {
                    const tasks: Array<string> = (r[c.fieldName] as Array<TaskModel> || new Array<TaskModel>()).map(t => t.taskedTeamId);
                    const personas: IFacepilePersona[] = AppService.AppSettings.teams.reduce((t: Array<TeamModel>, n: TeamModel) => tasks.indexOf(n.id) >= 0 ? t.concat(n) : t, [])
                      .map(d => { return { imageInitials: d.shortName, personaName: d.name } as IFacepilePersona });
                    return (
                      <div key={c.fieldName} className={clsName} data-fieldname={c.fieldName}><Facepile personas={personas} /></div>
                    );
                  }
                }
              })}
            </div>
          );
        })}
      </div>
    );
  }

  private onColumnClick = (column: IColumn, ev: Event): void => {
    ev.preventDefault();
    SortFilterSetting.SortField = column.fieldName;
    SortFilterSetting.SortDir = SortFilterSetting.SortDir * -1;
    this.setState({lastUpdate: new Date().getTime()});
  };
  
  private onChangeFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    SortFilterSetting.FilterText = text;
    this.setState({lastUpdate: new Date().getTime()})
  };

  private itemClicked(item: any) {
    this.props.productClicked(item.key);
  }
}
