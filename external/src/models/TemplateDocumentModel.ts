export class TemplateDocumentModel {
    public constructor(init?: Partial<TemplateDocumentModel>) {
        Object.assign(this, init);
    }

    public documentUrl: string;
    public documentName: string;
}
