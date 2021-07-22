export class AttachmentModel {
    public constructor(init?: Partial<AttachmentModel>) {
        Object.assign(this, init);
    }

    Id: string;
    Title: string;
    DocName: string;
    Updated: Date;
    Author: string;
    Url: string;
    EditUrl: string;
    LinkedProductGuid: string;
    Version: number;
}
