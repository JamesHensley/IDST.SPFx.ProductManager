import { SpListAttachment } from './SpListItem';
import { TaskModel } from './TaskModel';

export class ProductModel {
    public id: string;
    public description: string;
    public requestor: string;
    public requestDate: Date;
    public returnDateActual?: Date;
    public returnDateExpected: Date;
    public tasks?: Array<TaskModel>;
    public attachedDocumentUrls?: Array<string>;
    public attachedDocuments: Array<SpListAttachment>;
}
