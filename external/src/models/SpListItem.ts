export class SPAuthor {
    Name: string;
}

export class SpListAttachment {
    Id: string;
    Title: string;
    Updated: Date;
    Author: SPAuthor;
}

export class SpListItem {
    public Id: number;
    public Title: string;
    public GUID: string;
    public Description: string;
    public RequestDate: string;
    public ReturnDateExpected: string;
    public ReturnDateActual: string;
    public Requestor: string;
    public AttachmentFiles: Array<SpListAttachment>;
    public AssignedTeamIds: Array<string>;
}
