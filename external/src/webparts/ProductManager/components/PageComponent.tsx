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
    currentProductId: string;
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
            currentProductId: null,
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
            <div className={styles.productManager}>
                <ProductDetailPane
                    key={new Date().getTime()}
                    paneCloseCallBack={this.eventPaneClose.bind(this)}
                    productUpdatedCallBack={this.eventPaneUpdated.bind(this)}
                    currentProductId={this.state.currentProductId}
                    currentProduct={this.state.currentProduct}
                    isVisible={this.state.panelVisible}
                    isEditing={this.state.panelEditing}
                />
                <div className={styles.grid}>
                    <div className={styles.gridRow}>
                        <ProductManagerCmdBar />
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
                            {this.state.view === 'ProductList' &&
                                <ProductList
                                    // Adding a KEY here with the current time lets us force the product list to redraw
                                    key={new Date().getTime()}
                                    allProducts={this.state.allProducts.slice()}
                                    productClicked={this.productClicked.bind(this)}
                                />
                            }
                            {this.state.view === 'RollUp' &&
                                <RollupView></RollupView>
                            }
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
        this.setState({
            panelVisible: true,
            panelEditing: false,
            currentProductId: prodId,
            currentProduct: this.state.allProducts.reduce((t,n) => n.guid === prodId ? n : t, null)
        });
    }

    private eventPaneUpdated(): void {
        RecordService.GetProducts()
        .then(allProducts => {
            this.setState({
                allProducts: allProducts,
                panelEditing: false,
                panelVisible: true,
                currentProduct: allProducts.reduce((t,n) => n.guid === this.state.currentProductId ? n : t, null)
            });
        })
        .then(() => Promise.resolve())
        .catch(e => Promise.reject(e));
    }

    private eventPaneClose(): void {
        this.setState({
            panelVisible: false,
            currentProductId: null
        });
    }

    //#region Emitter receivers
    private async updateProducts(): Promise<void> {
        /*
        return RecordService.GetProducts()
        .then(allProducts => {
            console.log('PageComponent.updateProducts-State:', this.state);
            this.setState({
                allProducts: allProducts,
                currentProduct: allProducts.reduce((t,n) => n.guid === this.state.currentProductId ? n : t, null)
            });
        })
        .then(() => Promise.resolve())
        .catch(e => Promise.reject(e));
        */
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
                    currentProductId: newRecord.guid,
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
