import { v4 as uuidv4 } from 'uuid';

export class DocumentTemplate {
    public constructor(init?: Partial<DocumentTemplate>) {
        this.docId = uuidv4();
        Object.assign(this, init);
    }

    public docId: string;
    public templateId: string;
    public destDocName: string;
}
