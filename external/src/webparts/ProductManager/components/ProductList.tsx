import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel, ProductStatus } from '../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode, TooltipHost } from '@fluentui/react';
import { format } from 'date-fns';
import AppService from '../../../services/AppService';
import { RecordService } from '../../../services/RecordService';

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
      fieldName: 'status',
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

    const items = (this.props.allProducts || []).map(d => {
      console.log(items);
      const iDoc: IDocument = {
        key: d.guid,
        title: d.title,
        description: d.description,
        value: d.guid,
        teamIcon: '',
        productType: d.productType,
        productStatus: ProductStatus[d.status],
        openDate: format(new Date(d.requestDate), AppService.DateFormatView),
        expectedReturnDate: format(new Date(d.returnDateExpected), AppService.DateFormatView),
        closeDate: d.returnDateActual || ''
      };
      return iDoc;
    });

    this.state = { columns: columns, items: items };
  }

  public render(): React.ReactElement<IProductListProps> {
    return (
      <div className={styles.productList}>
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
        />
      </div>
    );
  }

  private getItemKey(item: any, index?: number): string {
    return item.key;
  }

  private onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const { columns, items } = this.state;
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
        //this.setState({
        //  announcedMessage: `${currColumn.name} is sorted ${
        //    currColumn.isSortedDescending ? 'descending' : 'ascending'
        //  }`,
        //});
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
  


  private productClicked(prodId: string): void {
    this.props.productClicked(prodId);
  }
}
