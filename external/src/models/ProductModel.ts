import AppService from '../services/AppService';
import { AttachmentModel } from './AttachmentModel';
import { CategoryModel } from './CategoryModel';
import { CommentsModel } from './CommentsModel';
import { TaskModel } from './TaskModel';

export enum ProductStatus {
    open = 'Open',
    closed = 'Closed',
    canceled = 'Canceled'
}

export class ProductModel {
    public constructor(init?: Partial<ProductModel>) {
        this.comments = [];
        this.attachedDocumentUrls = [];
        this.attachedDocuments = [];
        this.tasks = [];
        Object.assign(this, init);
    }

    public id: number;
    public guid: string;
    public title: string;
    public description: string;
    public requestor: string;
    public requestDate: Date;
    public returnDateActual?: Date;
    public returnDateExpected: Date;
    public status: ProductStatus;
    public tasks?: Array<TaskModel>;
    public attachedDocumentUrls?: Array<string>;
    public attachedDocuments: Array<AttachmentModel>;
    public productType: string;
    public categoryId: string;
    public eventType: string;
    public eventDateStart?: Date;
    public eventDateEnd?: Date;
    public classificationId: string;
    public requestUrl: string;
    public customer: string;
    public comments: Array<CommentsModel>;

    /** Generated string used by filters */
    public get filterString(): string {
        const prodTypeTitle = AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === this.productType ? n.typeName : t, '');
        const eventTypeTitle = AppService.AppSettings.eventTypes.reduce((t,n) => n.eventTypeId === this.eventType ? n.eventTitle : t, '');
        const teamNames = AppService.AppSettings.teams.reduce((t, n) => this.tasks.map(d => d.taskedTeamId).indexOf(n.id) >= 0 ? t + n.name : t, '');
        const category = AppService.AppSettings.categories.reduce((t, n) => n.categoryId === this.categoryId ? n.categoryText : t, '');

        return `${this.title} ${this.description} ${prodTypeTitle} ${eventTypeTitle} ${teamNames} ${category}`;
    }
}
