import { ICommandBarItemProps } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import ProductManagerWebPart, { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';
import { NotificationService, NotificationType } from './NotificationService';
import { SPUser } from '@microsoft/sp-page-context';
import { ProductModel } from '../models/ProductModel';
import { MailService } from './MailService';

export interface ICmdBarListenerProps {
    callback: () => Promise<void>;
    btnKeys?: Array<string>;
}

export interface IEmailObj {
    subject: string;
    body: string;
}
export default class AppService {
    private static _webpart: ProductManagerWebPart;
    private static _productListeners: Array<() => Promise<void>> = [];
    private static _cmdBarListeners: Array<ICmdBarListenerProps> = [];

    public static Init(webpart: ProductManagerWebPart): void { this._webpart = webpart; }

    public static get AppSettings(): IAppSettings { return this._webpart.AppProps; }

    public static get AppContext(): WebPartContext { return this._webpart.context; }

    public static async UpdateAppSetting(val: Partial<IAppSettings>): Promise<IAppSettings> {
        const settings = await this._webpart.UpdateAppSettings(val);
        return Promise.resolve(settings);
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
        const activeTeams = AppService.AppSettings.teams.filter(f => f.active).map(d => d.teamId)
        const teamEmails = AppService.AppSettings.teamMembers
            .filter(f => teamIds.indexOf(f.teamId) >= 0 && activeTeams.indexOf(f.teamId))
            .filter(f => f.active)
            .map(m => m.email);
        let emailObj = {
            body: '',
            subject: ''
        } as IEmailObj;

        switch (notificationType) {
            case NotificationType.Create:
                emailObj = {
                    subject: `New Product: ${product.title}`,
                    body: `A new product has been created: ${product.title}`
                } as IEmailObj
                break;
            case NotificationType.Update:
                emailObj = {
                    subject: `Updated Product: ${product.title}`,
                    body: `An update was made to: ${product.title}`
                } as IEmailObj
                break;
            case NotificationType.CommentAdd:
                emailObj = {
                    subject: `Comment Added: ${product.title}`,
                    body: `A comment was added to: ${product.title}`
                } as IEmailObj
                break;
        }
        if (emailObj.subject && emailObj.body && teamEmails.length > 0) {
            MailService.SendEmail(emailObj.subject, teamEmails, emailObj.body)
            .catch(e => Promise.reject(e));
        }
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
