import { TaskModel } from "./TaskModel";

export class DocTemplate {
    public docUrl: string;
    public docIcon: string;
    public docName: string;
}

export class TaskTemplate {
    public teamId: string;
    public taskDescription: string;
    public taskSuspenseDays: number;
}

export class ProductTypeModel {
    public typeId: string;
    public typeName: string;
    public typeDescription: string;
    public defaultSuspenseDays: number;
    public defaultTemplateDocs: Array<DocTemplate>;
    public defaultTeamTasks: Array<TaskTemplate>;
    /** Indicates if this product is still active or has been discontinuted*/
    public active: boolean;
}
