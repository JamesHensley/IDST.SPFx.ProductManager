import { ICommandBarItemProps } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ProductModel } from '../models/ProductModel';
import ProductManagerWebPart, { IProductManagerWebPartProps } from '../webparts/ProductManager/ProductManagerWebPart';

export interface ICmdBarListenerProps {
    callback: ()=>Promise<void>,
    btnKeys?: Array<string>
}

export default class AppService {
    private static _webpart: ProductManagerWebPart;
    private static _productListeners: Array<()=>Promise<void>> = [];
    private static _cmdBarListeners: Array<ICmdBarListenerProps> = [];


    public static Init(webpart: ProductManagerWebPart): void {
        this._webpart = webpart;
    }

    public static get AppSettings(): IProductManagerWebPartProps {
        return this._webpart.AppProps;
    }

    public static get AppContext(): WebPartContext {
        return this._webpart.context;
    }

    
    //#region Emitters
    public static RegisterProductListener(callback: ()=> Promise<void>): void {
        this._productListeners.push(callback);
        console.log('RegisterProductListener: ', this._productListeners);
    }

    public static UnRegisterProductListener(callback: ()=> void): void {
        this._productListeners = this._productListeners.filter(f => f != callback);
        console.log('UnRegisterProductListener: ', this._productListeners);
    }

    public static ProductChanged(): void {
        this._productListeners.forEach(l => l.call(l));
    }

    public static RegisterCmdBarListener(p: ICmdBarListenerProps): void {
        this._cmdBarListeners.push(p);
        console.log('RegisterCmdBarListener: ', this._cmdBarListeners);
    }

    public static UnRegisterCmdBarListener(callback: ()=> Promise<void>): void {
        this._cmdBarListeners = this._cmdBarListeners.filter(f => f.callback!= callback);
        console.log('UnRegisterCmdBarListener: ', this._cmdBarListeners);
    }

    public static MenuItemClicked(item: ICommandBarItemProps): void {
        this._cmdBarListeners.forEach(l => {
            if (l.btnKeys) {
                if (l.btnKeys.indexOf(item['data-automation-id']) >= 0) {
                    l.callback.call(l.callback, item);
                }
            }
            else {
                l.callback.call(l.callback, item);
            }
        });
    }
    //#endregion


    //#region strings
    public static get DateFormatView(): string  {
        return `dd-LLL-yyyy`;
    }

    public static get DateFormatValue(): string  {
        return `yyyy-MM-dd`;
    }
    //#endregion
}
