import AppService from '../services/AppService';
import { AttachmentModel } from './AttachmentModel';
import { TaskModel } from './TaskModel';

export enum ProductStatus {
    open = 'Open',
    closed = 'Closed',
    canceled = 'Canceled'
}

export class ProductModel {
    public constructor(init?:Partial<ProductModel>) {
        Object.assign(this, init);
    }    

    public id: number;
    public guid: string;
    public title: string;
    public description: string;
    public requestor: string;
    public requestDate: string;
    public returnDateActual?: string;
    public returnDateExpected: string;
    public status: ProductStatus;
    public tasks?: Array<TaskModel>;
    public attachedDocumentUrls?: Array<string>;
    public attachedDocuments: Array<AttachmentModel>;
    public productType: string;
    public eventType: string;
    public eventDate: string;
    public classificationId: string;
    public requestUrl: string;
    public customer: string;

    /** Used internally to determine if the loaded product is being created or if it exists in SharePoint already */
    public newProduct: boolean;

    public get filterString(): string {
        const prodTypeTitle = AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === this.productType ? n.typeName : t, '');
        const eventTypeTitle = AppService.AppSettings.eventTypes.reduce((t,n) => n.eventTypeId === this.eventType ? n.eventTitle : t, '');

        const taskedTeams = this.tasks.map(d => d.taskedTeamId);
        const teamNames = AppService.AppSettings.teams.reduce((t, n) => taskedTeams.indexOf(n.id) >= 0 ? t + n.name : t, '');

        return `${this.title} ${this.description} ${prodTypeTitle} ${eventTypeTitle} ${teamNames}`
    }
}
