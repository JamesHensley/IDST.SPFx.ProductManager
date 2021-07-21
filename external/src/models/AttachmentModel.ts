export class AttachmentModel {
    public constructor(init?: Partial<AttachmentModel>) {
        Object.assign(this, init);
    }

    Id: string;
    Title: string;
    Updated: Date;
    Author: string;
    Url: string;
    LinkedProductGuid: string;
    Version: number;
}
