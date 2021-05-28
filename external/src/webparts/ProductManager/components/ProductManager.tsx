import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import AppService, { ICmdBarListenerProps } from '../../../services/AppService';
import ProductList from './ProductList';
import ProductDetailPane from './ProductDetailPane';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

import ProductManagerCmdBar from './ProductManagerCmdBar';
import { ICommandBarItemProps } from '@fluentui/react';

export interface IProductManagerProps { }

export interface IProductManagerState {
  panelOpen: boolean;
  currentProductId: string;
  allProducts: Array<ProductModel>;
}

export default class ProductManager extends React.Component <IProductManagerProps, IProductManagerState> {
  private receivers = {
    productEvents: null,
    cmdbarEvents: null
  };

  constructor(props: IProductManagerProps) {
    super(props);

    this.state = {
      panelOpen: false,
      currentProductId: null,
      allProducts: []
    };

    RecordService.GetProducts()
    .then(allProducts => {
      this.setState({ allProducts: allProducts });
    });
  }

  public render(): React.ReactElement<{}> {
    return(
      <div className={styles.productManager}>
        {
          this.state.panelOpen && <div></div>
        }
        <ProductDetailPane
          key={new Date().getTime()}
          paneCloseCallBack={this.eventPaneClose.bind(this)}
          currentProductId={this.state.currentProductId}
          isVisible={this.state.panelOpen}
        />
        <div className={styles.grid}>
          <div className={styles.gridRow}>
            <ProductManagerCmdBar />
          </div>
          <div className={styles.gridRow}>
            <div className={styles.gridCol12}>
              <div className={styles.grid}>
                <div className={styles.gridRow}>
                  <div className={styles.gridCol9}>
                    <ProductList
                      //Adding a KEY here with the current time lets us force the product list to redraw
                      key={new Date().getTime()}
                      allProducts={this.state.allProducts.slice()}
                      productClicked={this.productClicked.bind(this)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  public componentDidMount(): void {
    this.receivers = {
      productEvents: this.updateProducts.bind(this),
      cmdbarEvents: this.cmdBarItemClicked.bind(this)
    };
    AppService.RegisterProductListener(this.receivers.productEvents);
    AppService.RegisterCmdBarListener({ callback: this.receivers.cmdbarEvents } as ICmdBarListenerProps);
  }

  public componentWillUnmount(): void {
    AppService.UnRegisterProductListener(this.receivers.productEvents);
    AppService.UnRegisterCmdBarListener(this.receivers.cmdbarEvents);
  }


  private productClicked(prodId: string): void {
    console.log('ProductManager.productClicked: ', prodId);
    this.setState({
      panelOpen: true,
      currentProductId: prodId
    });
  }

  private eventPaneClose(): void {
    this.setState({
      panelOpen: false,
      currentProductId: null
    });
  }


  //#region Emitter receivers
  private async updateProducts(): Promise<void> {
    RecordService.GetProducts()
    .then(allProducts => {
      this.setState({ allProducts: allProducts });
    });
    return Promise.resolve();
  }

  private async cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
    console.log('ProductManager.cmdBarItemClicked: ', item);
    return Promise.resolve();
  }
  //#endregion
}
