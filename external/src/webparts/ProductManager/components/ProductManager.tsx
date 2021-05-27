import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import TeamPanel from './TeamPanel';
import AppService from '../../../services/AppService';
import ProductList from './ProductList';
import ProductDetailPane from './ProductDetailPane';
import { ProductModel } from '../../../models/ProductModel';

export interface IProductManagerProps {
  allProducts: Array<ProductModel>
}

export interface IProductManagerState {
  panelOpen: boolean;
  currentProductId: string;
}

export default class ProductManager extends React.Component <IProductManagerProps, IProductManagerState> {
  constructor(props: IProductManagerProps) {
    super(props);
    const stateObj: IProductManagerState = {
      panelOpen: false,
      currentProductId: null
    };
    this.state = stateObj;
  }

  public render(): React.ReactElement<{}> {
    console.log('ProductManager.render: ', this.state);
    /*
            <div className={styles.gridCol3}>
              <TeamPanel teams={AppService.AppSettings.teams}>
              </TeamPanel>
            </div>
    */
    return(
      <div className={styles.productManager}>
        {
          this.state.panelOpen &&
          <ProductDetailPane
            paneCloseCallBack={this.eventPaneClose.bind(this)}
            currentProductId={this.state.currentProductId}
            isVisible={this.state.panelOpen}
          />
        }
        <div className={styles.grid}>
          <div className={styles.gridRow}>
            <div className={styles.gridCol9}>
              <ProductList
                allProducts={this.props.allProducts}
                productClicked={this.productClicked.bind(this)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private productClicked(prodId: string): void {
    console.log('ProductManager.productClicked: ', prodId);
    this.setState({
      panelOpen: true,
      currentProductId: prodId
    });
  }

  private eventPaneClose(): void {
    const stateObj: IProductManagerState = {
      panelOpen: false,
      currentProductId: null
    };

    this.setState(stateObj);
  }
}
