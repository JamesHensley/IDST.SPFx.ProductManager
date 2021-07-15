import { TemplateDocumentModel } from "./TemplateDocumentModel";

export class TaskTemplate {
    public teamId: string;
    public taskDescription: string;

    /** Typical days offset for this tasks suspense from the start of the product */
    // public taskSuspenseDaysOffset: number;
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

    /** GUIDs of default document templates */
    public defaultTemplateDocs: Array<string>;

    /** Guids of default task templates for this product */
    public defaultTeamTasks: Array<TaskTemplate>;

    /** Color of the product to display in visualizations */
    public colorValue: string;

    /** Default event type this product supports */
    public defaultEventType?: string;
}
