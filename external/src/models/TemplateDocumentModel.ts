import { v4 as uuidv4 } from 'uuid';
export class TemplateDocumentModel {
    public constructor(init?: Partial<TemplateDocumentModel>) {
        this.active = true;
        this.templateId = uuidv4();
        Object.assign(this, init);
    }

    public active: boolean;
    public templateId: string;
    public title: string;
    public documentUrl: string;
}
