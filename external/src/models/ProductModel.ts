import { AttachmentModel } from './AttachmentModel';
import { TaskModel } from './TaskModel';

export class ProductModel {
    public id: string;
    public description: string;
    public requestor: string;
    public requestDate: string;
    public returnDateActual?: string;
    public returnDateExpected: string;
    public tasks?: Array<TaskModel>;
    public attachedDocumentUrls?: Array<string>;
    public attachedDocuments: Array<AttachmentModel>;
}
