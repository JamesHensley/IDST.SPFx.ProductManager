import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import AppService, { ICmdBarListenerProps } from '../../../services/AppService';
import ProductList from './ProductList';
import ProductDetailPane from './ProductDetailPane';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

import ProductManagerCmdBar from './ProductManagerCmdBar';
import { ICommandBarItemProps } from '@fluentui/react';
import RollupView from './RollupView';

export interface IPageComponentProps { }

export interface IPageComponentState {
    panelVisible: boolean;
    panelEditing: boolean;
    currentProduct: ProductModel;
    allProducts: Array<ProductModel>;
    view: string;
}

export default class PageComponent extends React.Component <IPageComponentProps, IPageComponentState> {
    private receivers = {
        productEvents: null,
        cmdbarEvents: null
    };

    constructor(props: IPageComponentProps) {
        super(props);

        this.state = {
            panelVisible: false,
            panelEditing: false,
            currentProduct: null,
            allProducts: [],
            view: 'ProductList'
        };

        RecordService.GetProducts()
        .then(allProducts => {
            this.setState({ allProducts: allProducts });
        })
        .catch(e => Promise.reject(e));
    }

    public render(): React.ReactElement<{}> {
        return(
            <>
                <ProductDetailPane
                    // Adding key here causes the component to be destroyed/rebuilt on each render
                    key={new Date().getTime()}
                    paneCloseCallBack={this.eventPaneClose.bind(this)}
                    // productUpdatedCallBack={this.eventPaneUpdated.bind(this)}
                    currentProduct={this.state.currentProduct}
                    isVisible={this.state.panelVisible}
                    isEditing={this.state.panelEditing}
                    canMakeEdits={this.state.view !== 'RollUp'}
                />
                <div className={styles.productManager}>
                    <div className={styles.grid}>
                        <div className={styles.gridRow}>
                            <ProductManagerCmdBar />
                        </div>
                        <div className={styles.gridRow}>
                            <div className={styles.gridCol12}>
                                {this.state.view === 'ProductList' &&
                                    <ProductList
                                        // Adding key here causes the component to be destroyed/rebuilt on each render
                                        key={new Date().getTime()}
                                        allProducts={this.state.allProducts.slice()}
                                        productClicked={this.productClicked.bind(this)}
                                    />
                                }
                                {this.state.view === 'RollUp' &&
                                    <RollupView products={this.state.allProducts}
                                        productClicked={this.productClicked.bind(this)}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    public componentDidMount(): void {
        this.receivers = {
            productEvents: this.productsUpdated.bind(this),
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
        this.setState({
            panelVisible: true,
            panelEditing: false,
            currentProduct: this.state.allProducts.reduce((t,n) => n.guid === prodId ? n : t, null)
        });
    }

    /*
    private eventPaneUpdated(continueEditing: boolean): void {
        RecordService.GetProducts()
        .then(allProducts => {
            // We're either going to use the GUID of the current product (update) OR find the GUID of the new product (created)
            const currProdId = this.state.currentProduct.guid || this.state.allProducts
                .map(d => d.guid).reduce((t,n) => ((allProducts.map(d => d.guid)).indexOf(n) < 0) ? n : t, null)

            this.setState({
                allProducts: allProducts,
                panelEditing: continueEditing,
                panelVisible: true,
                currentProduct: allProducts.reduce((t,n) => n.guid === this.state.currentProduct.guid ? n : t, null)
            });
        })
        .then(() => Promise.resolve())
        .catch(e => Promise.reject(e));
    }
    */

    private eventPaneClose(): void {
        this.setState({
            panelVisible: false,
            currentProduct: null
        });
    }

    //#region Emitter receivers

    /** Receives the PRODUCT UPDATED message whenever the recordservice saves a product */
    private async productsUpdated(): Promise<void> {
        return RecordService.GetProducts()
        .then(allProducts => {
            // We're either going to use the GUID of the current product (update) OR find the GUID of the new product (created)
            // const currProdId = this.state.currentProduct.guid || allProducts
            //    .map(d => d.guid).reduce((t,n) => ((this.state.allProducts.map(d => d.guid)).indexOf(n) < 0) ? n : t, null);
            this.setState({
                allProducts: allProducts,
                //currentProduct: allProducts.reduce((t,n) => n.guid === currProdId ? n : t, null),
                currentProduct: null,
                panelEditing: false,
                panelVisible: false
            });
        })
        .then(() => Promise.resolve())
        .catch(e => Promise.reject(e));
    }

    private async cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
        console.log('PageComponent.cmdBarItemClicked: ', item);
        switch (item['data-automation-id']) {
            case 'viewRollup':
                this.setState({ view: 'RollUp' });
                break;
            case 'viewList':
                this.setState({ view: 'ProductList' });
                break;
            case 'newProduct':
                const newRecord = RecordService.GetNewProductModel(item.data.id);
                this.setState({
                    currentProduct: newRecord,
                    panelVisible: true,
                    panelEditing: true
                });
                break;
        }
        return Promise.resolve();
    }
    //#endregion
}
