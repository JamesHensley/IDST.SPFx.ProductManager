import AppService from '../services/AppService';
import { AttachmentModel } from './AttachmentModel';
import { CommentsModel } from './CommentsModel';
import { TaskModel } from './TaskModel';

export enum ProductStatus {
    open = 'Open',
    closed = 'Closed',
    canceled = 'Canceled'
}

export class ProductModel {
    public constructor(init?: Partial<ProductModel>) {
        Object.assign(this, init);
        this.comments = init && init.comments ? init.comments.map(d => new CommentsModel(d)) : [];
        this.attachedDocuments = init && init.attachedDocuments ? init.attachedDocuments.map(d => new AttachmentModel(d)) : [];
        this.tasks = init && init.tasks ? init.tasks.map(d => new TaskModel(d)) : [];
    }

    public spId?: number;
    public spGuid?: string;
    public guid: string;
    public title: string;
    public description: string;
    public requestor: string;
    public requestDate: Date;
    public publishedDate?: Date;
    public status: ProductStatus;
    public tasks?: Array<TaskModel>;
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
        const teamNames = AppService.AppSettings.teams.reduce((t, n) => this.tasks.map(d => d.taskedTeamId).indexOf(n.teamId) >= 0 ? t + n.name : t, '');
        const category = AppService.AppSettings.categories.reduce((t, n) => n.categoryId === this.categoryId ? n.categoryText : t, '');

        return `${this.title} ${this.description} ${prodTypeTitle} ${eventTypeTitle} ${teamNames} ${category}`;
    }
}
