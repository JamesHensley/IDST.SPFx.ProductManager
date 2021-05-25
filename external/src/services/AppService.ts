import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ProductModel } from '../models/ProductModel';
import ProductManagerWebPart, { IProductManagerWebPartCallbacks, IProductManagerWebPartProps } from '../webparts/ProductManager/ProductManagerWebPart';

export default class AppService {
    private static _webpart: ProductManagerWebPart;
    private static callbacks: IProductManagerWebPartCallbacks;

    public static Init(webpart: ProductManagerWebPart, globalCallBacks: IProductManagerWebPartCallbacks): void {
        this._webpart = webpart;
        this.callbacks = globalCallBacks;
    }

    public static get AppSettings(): IProductManagerWebPartProps {
        return this._webpart.AppProps;
    }

    public static get AppContext(): WebPartContext {
        return this._webpart.context;
    }

    public static ProductChanged(newProducts: Array<ProductModel>): void {
        this.callbacks.productsUpdated(newProducts);
    }
}
