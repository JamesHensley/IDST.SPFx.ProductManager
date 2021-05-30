import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, IColumn, IconButton, mergeStyleSets, SelectionMode, TextField, TooltipHost } from '@fluentui/react';
import { format } from 'date-fns';
import AppService from '../../../services/AppService';
import { RecordService } from '../../../services/RecordService';

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
    maxWidth: '300px',
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
  //modifiedBy: string;
  //dateModified: string;
  //dateModifiedValue: number;
}

export interface IProductListProps { allProducts: Array<ProductModel>, productClicked: (id: string) => void }
export interface IProductListState { lastUpdate: number }

export default class ProductList extends React.Component<IProductListProps, IProductListState> {
  private get allItems(): Array<IDocument> {
    return (this.props.allProducts || [])
    .filter(i => ((`${i.title} ${i.description} ${i.productType}`).toLowerCase().indexOf(SortFilterSetting.FilterText) >= 0))
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
        closeDate: d.returnDateActual || ''
      } as IDocument;
    })
    .sort((a,b) => {
      return a[SortFilterSetting.SortField] > b[SortFilterSetting.SortField] ? (1 * SortFilterSetting.SortDir) : (a[SortFilterSetting.SortField] < b[SortFilterSetting.SortField] ? -1 * SortFilterSetting.SortDir : 0)
    });
  };

  private get allColumns(): Array<IColumn> {
    return ([{
      key: 'column0',
      name: '',
      fieldName: 'teamIcon',
      minWidth: 20, maxWidth: 20,
      isRowHeader: false,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column1',
      name: 'Status',
      fieldName: 'productStatus',
      minWidth: 100, maxWidth: 150,
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column2',
      name: 'Title',
      fieldName: 'title',
      minWidth: 200, maxWidth: 300,
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column3',
      name: 'Description',
      fieldName: 'description',
      minWidth: 200, maxWidth: 600,
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column4',
      name: 'Open Date',
      fieldName: 'openDate',
      minWidth: 100, maxWidth: 200,
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column5',
      name: 'Expected Return',
      fieldName: 'expectedReturnDate',
      minWidth: 100, maxWidth: 200,
      isRowHeader: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
    }])
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
            <TextField label="Filter by name:" onChange={this.onChangeFilter} styles={controlStyles} value={SortFilterSetting.FilterText} />
          </div>
        </div>
        <div className={styles.gridRow}>
          <div className={styles.gridCol12}>
            <table className={styles.listTable}>
              <thead>
                <tr>
                  {this.allColumns.map(c => {
                    const colStyle = (styleItems => Object.assign({}, ...styleItems))([{minWidth: c.minWidth}, {maxWidth: c.maxWidth}, {textAlign: 'left'}]);
                    return (
                      <th key={c.fieldName}
                        className={styles.listColumnHeader}
                        style={colStyle}
                        onClick={this.onColumnClick.bind(this, c)}
                      >
                        {c.isRowHeader ?  c.name : ''}
                        {c.isSorted && !c.isSortedDescending && <IconButton iconProps={{ iconName: 'SortUp' }} className={styles.appIcon} title='' ariaLabel='' />}
                        {c.isSorted && c.isSortedDescending && <IconButton iconProps={{ iconName: 'SortDown' }} className={styles.appIcon} title='' ariaLabel='' />}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {this.allItems.map(r => {
                  return (
                    <tr key={r.key} onClick={this.itemClicked.bind(this, r)} className={styles.listDataRow}>
                      {this.allColumns.map(c => {
                        return (
                          <td key={c.fieldName} className={styles.listDataCell}>{r[c.fieldName]}</td>
                        )
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  private onColumnClick = (column: IColumn): void => {
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
