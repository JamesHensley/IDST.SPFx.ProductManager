import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

export interface IProductListProps {
    productClicked: (prodId: string) => void;
}

export interface IProductListState {
  ProductList: Array<ProductModel>;
}

export default class ProductList extends React.Component< IProductListProps, IProductListState> {
  constructor(props: IProductListProps) {
    super(props);
    const stateObj: IProductListState = {
      ProductList: []
    };
    this.state = stateObj;
  }

  public render(): React.ReactElement<IProductListProps> {
    return (
      <div className={styles.productList}>
        {this.state.ProductList.map((d) => {
          return (
            <div key={d.id} className={styles.product} onClick={this.productClicked.bind(this, d.id)}>
              {d.id} - {d.description}
            </div>
          );
        })}
      </div>
    );
  }

  public componentDidMount(): void {
    RecordService.GetProducts()
      .then((data) => {
        const stateObj: IProductListState = {
          ProductList: data
        };
        this.setState(stateObj);
      })
      .catch((e) => console.log(e));
  }

  private productClicked(prodId: string): void {
    this.props.productClicked(prodId);
  }
}
