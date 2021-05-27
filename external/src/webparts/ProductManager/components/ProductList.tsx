import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, IColumn, mergeStyleSets, SelectionMode, TextField, TooltipHost } from '@fluentui/react';
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

export interface IProductListProps {
    productClicked: (prodId: string) => void;
    allProducts: Array<ProductModel>;
}

export interface IProductListState {
  columns: Array<IColumn>,
  items: Array<IDocument>
}

export default class ProductList extends React.Component<IProductListProps, IProductListState> {
  private allItems: Array<IDocument>;

  constructor(props: IProductListProps) {
    super(props);
    const columns = [{
      key: 'column1',
      name: 'Team',
      //className: classNames.fileIconCell,
      //iconClassName: classNames.fileIconHeaderIcon,
      ariaLabel: 'Column operations for File type, Press to sort on File type',
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'title',
      minWidth: 16,
      maxWidth: 16,
      //onColumnClick: this._onColumnClick,
      /*
      onRender: (item: IDocument) => (
        <TooltipHost content={`${item.fileType} file`}>
          <img src={item.teamIcon} className={classNames.fileIconImg} alt={`${item.fileType} file icon`} />
        </TooltipHost>
      ),
      */
    },
    {
      key: 'column3',
      name: 'Status',
      fieldName: 'productStatus',
      minWidth: 100, maxWidth: 150,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      //onColumnClick: this._onColumnClick,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column4',
      name: 'Title',
      fieldName: 'title',
      minWidth: 200,
      maxWidth: 300,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      //onColumnClick: this._onColumnClick,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column5',
      name: 'Description',
      fieldName: 'description',
      minWidth: 200,
      //maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      //onColumnClick: this._onColumnClick,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column6',
      name: 'Open Date',
      fieldName: 'openDate',
      minWidth: 100, maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      //onColumnClick: this.onColumnClick,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column7',
      name: 'Expected Return',
      fieldName: 'expectedReturnDate',
      minWidth: 100, maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      //onColumnClick: this._onColumnClick,
      data: 'string',
      isPadded: true,
    },
    {
      key: 'column8',
      name: 'Closed Date',
      fieldName: 'closeDate',
      minWidth: 100, maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: 'Sorted A to Z',
      sortDescendingAriaLabel: 'Sorted Z to A',
      //onColumnClick: this._onColumnClick,
      data: 'string',
      isPadded: true,
    }];

    this.allItems = (this.props.allProducts || []).map(d => {
      const iDoc: IDocument = {
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
      };
      console.log('d:  ', d, d.status);
      return iDoc;
    });

    this.state = {
      columns: columns,
      items: this.allItems
    };
  }

  public render(): React.ReactElement<IProductListProps> {
    console.log('ProductList.render: ', this.props, this.state);
    //<div className={classNames.selectionDetails}>{this.state.selectionDetails}</div>
    return (
      <div className={styles.productList}>
        <TextField label="Filter by name:" onChange={this.onChangeFilter} styles={controlStyles} />
        <DetailsList
            items={this.state.items}
            columns={this.state.columns}
            compact={false}
            getKey={this.getItemKey.bind(this)}
            setKey="none"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            selectionMode={SelectionMode.none}
            onColumnHeaderClick={this.onColumnClick.bind(this)}
            // selection={this.selection}
            onItemInvoked={this.itemInvoked.bind(this)}
          />
      </div>
    );
  }

  private getItemKey(item: any, index?: number): string { return item.key; }

  private onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns, items } = this.state;
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    const newItems = RecordService.CopyAndSortArray(items, currColumn.fieldName!, currColumn.isSortedDescending);

    this.setState({
      columns: newColumns,
      items: newItems,
    });
  };
  
  private onChangeFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    this.setState({
      items: text ? this.allItems.filter(i => {
        return ((`${i.title} ${i.description} ${i.productType}`).toLowerCase().indexOf(text) > -1)
      }) : this.allItems,
    });
  };

  private itemInvoked(item?: any, index?: number, elem?: React.FocusEvent<HTMLElement>): void {
    this.props.productClicked(item.key);
  };
}
