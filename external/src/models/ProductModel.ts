import { TeamModel } from './TeamModel';

export class ProductModel {
    public id: string;
    public description: string;
    public requestor: string;
    public requestDate: Date;
    public returnDateActual?: Date;
    public returnDateExpected: Date;
    public assignedTeams?: Array<TeamModel>;
    public attachedDocumentUrls?: Array<string>;
}
