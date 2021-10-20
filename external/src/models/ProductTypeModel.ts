import { DocumentTemplate } from './DocumentTemplate';
import { TaskTemplate } from './TaskTemplate';

export class ProductTypeModel {
    public constructor(init?: Partial<ProductTypeModel>) {
        Object.assign(this, init);
        this.defaultTeamTasks = (init ? (init.defaultTeamTasks || []) : []).map(d => new TaskTemplate(d));
    }

    public active: boolean;
    public typeId: string;
    public typeName: string;
    public typeDescription: string;

    /** GUIDs of default document templates */
    public defaultTemplateDocs: Array<DocumentTemplate>;

    /** Guids of default task templates for this product */
    public defaultTeamTasks: Array<TaskTemplate>;

    /** Color of the product to display in visualizations */
    public colorValue: string;

    /** Default event type this product supports */
    public defaultEventType?: string;
}
