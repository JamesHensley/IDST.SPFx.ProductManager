import { ICommandBarItemProps } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPAuthor } from '../models/SpListItem';
import ProductManagerWebPart, { IProductManagerWebPartProps } from '../webparts/ProductManager/ProductManagerWebPart';
import { NotificationService, NotificationType } from './NotificationService';
import { SPUser } from '@microsoft/sp-page-context';
import { ProductModel } from '../models/ProductModel';
import { MailService } from './MailService';
export interface ICmdBarListenerProps {
    callback: () => Promise<void>;
    btnKeys?: Array<string>;
}

export default class AppService {
    private static _webpart: ProductManagerWebPart;
    private static _productListeners: Array<() => Promise<void>> = [];
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
    public static RegisterProductListener(callback: () => Promise<void>): void {
        this._productListeners.push(callback);
    }

    public static UnRegisterProductListener(callback: () => void): void {
        this._productListeners = this._productListeners.filter(f => f !== callback);
    }

    public static ProductChanged(notificationType: NotificationType, product: ProductModel): void {
        this._productListeners.forEach(l => l.call(l));
        NotificationService.Notify(notificationType, product.title);

        const teamIds = (product.tasks || []).map(d => d.taskedTeamId);
        const teamEmails = (AppService.AppSettings.teams || []).reduce((t,n) => teamIds.indexOf(n.id) >= 0 ? t.concat(n.members.map(m => m.email)) : t, []);
        MailService.SendEmail('Update', teamEmails, `A product has been ${notificationType.toString()}`)
        .catch(e => Promise.reject(e));
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
