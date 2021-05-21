import { WebPartContext } from '@microsoft/sp-webpart-base';
import ProductManagerWebPart, { IProductManagerWebPartProps } from '../webparts/ProductManager/ProductManagerWebPart';

export default class AppService {
    private static _webpart: ProductManagerWebPart;

    public static Init(webpart: ProductManagerWebPart): void {
        this._webpart = webpart;
    }

    public static get AppSettings(): IProductManagerWebPartProps {
        return this._webpart.AppProps;
    }

    public static get AppContext(): WebPartContext {
        return this._webpart.context;
    }
}
