import { ICommandBarItemProps } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import ProductManagerWebPart, { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';
import { SPUser } from '@microsoft/sp-page-context';

export enum GlobalMsg {
    IconsInitialized,
    AppSettingsUpdated,
    ProductCreated,
    ProductUpdated,
    ProductSaveFailed,
    ProductTemplateDocCopied,
    ProductCommentAdded,
    EmailSending,
    EmailSent,
    EmailFailed,
    DocumentUploading,
    DocumentUploaded,
    DocumentUploadFailed
}

export interface ICmdBarListenerProps {
    callback: () => Promise<void>;
    btnKeys?: Array<string>;
}

export interface IGlobalListenerProps {
    callback: () => Promise<void>;
    msg: GlobalMsg;
}

export interface IEmailObj {
    subject: string;
    body: string;
}

export default class AppService {
    private static _webpart: ProductManagerWebPart;
    private static _productListeners: Array<() => Promise<void>> = [];
    private static _cmdBarListeners: Array<ICmdBarListenerProps> = [];
    private static _globalListeners: Array<IGlobalListenerProps> = [];

    public static Init(webpart: ProductManagerWebPart): void { this._webpart = webpart; }

    public static get AppSettings(): IAppSettings { return this._webpart.AppProps; }

    public static get AppContext(): WebPartContext { return this._webpart.context; }

    public static async UpdateAppSetting(val: Partial<IAppSettings>): Promise<IAppSettings> {
        const settings = await this._webpart.UpdateAppSettings(val)
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));

        return settings;
    }

    //#region Emitters
    public static TriggerGlobalMessage(msgType: GlobalMsg, params?: any): void {
        this._globalListeners.filter(f => f.msg === msgType).forEach(x => x.callback.call(x.callback, params));
    }

    public static RegisterGlobalListener(p: IGlobalListenerProps): void {
        this._globalListeners.push(p);
    }

    public static UnRegisterGlobalListener(callback: () => void): void {
        this._globalListeners = this._globalListeners.filter(f => f.callback !== callback);
    }

    public static RegisterProductListener(callback: () => Promise<void>): void {
        this._productListeners.push(callback);
    }

    public static UnRegisterProductListener(callback: () => void): void {
        this._productListeners = this._productListeners.filter(f => f !== callback);
    }

    public static RegisterCmdBarListener(p: ICmdBarListenerProps): void {
        this._cmdBarListeners.push(p);
    }

    public static UnRegisterCmdBarListener(callback: () => Promise<void>): void {
        this._cmdBarListeners = this._cmdBarListeners.filter(f => f.callback !== callback);
    }

    public static MenuItemClicked(item: ICommandBarItemProps): void {
        this._cmdBarListeners.forEach(l => {
            if (l.btnKeys) {
                if (l.btnKeys.indexOf(item['data-automation-id']) >= 0) {
                    l.callback.call(l.callback, item);
                }
            } else {
                l.callback.call(l.callback, item);
            }
        });
    }
    //#endregion

    //#region strings
    public static get DateFormatView(): string {
        return `dd-LLL-yyyy`;
    }

    public static get DateFormatValue(): string {
        return `yyyy-MM-dd`;
    }

    public static get CurrentUser(): string {
        return 'Jimmy';
    }

    public static get CurrentSpUser(): SPUser {
        return this.AppContext.pageContext.user;
    }
    //#endregion
}
