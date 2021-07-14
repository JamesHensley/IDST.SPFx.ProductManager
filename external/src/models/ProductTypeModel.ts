import { TemplateDocumentModel } from "./TemplateDocumentModel";

export class TaskTemplate {
    public teamId: string;
    public taskDescription: string;

    /** Typical days offset for this tasks suspense from the start of the product */
    public taskSuspenseDaysOffset: number;
    public typicalTaskLength: number;
}

export class ProductTypeModel {
    public constructor(init?: Partial<ProductTypeModel>) {
        Object.assign(this, init);
    }

    public active: boolean;
    public typeId: string;
    public typeName: string;
    public typeDescription: string;
    public defaultSuspenseDays: number;
    public defaultTemplateDocs: Array<string>;
    public defaultTeamTasks: Array<TaskTemplate>;
    public colorValue: string;
    public defaultEventType?: string;
}
