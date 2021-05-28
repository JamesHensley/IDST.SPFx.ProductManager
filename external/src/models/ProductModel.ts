import { AttachmentModel } from './AttachmentModel';
import { TaskModel } from './TaskModel';

export enum ProductStatus {
    open='Open',
    closed='Closed',
    canceled='Canceled'
}

export class ProductModel {
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
    public newProduct: boolean;
}
