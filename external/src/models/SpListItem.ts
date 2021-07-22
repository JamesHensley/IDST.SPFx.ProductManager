export class SPAuthor {
    public constructor(init?: Partial<SPAuthor>) {
        Object.assign(this, init);
    }

    Name: string;
    Email: string;
}

export class SpListAttachment {
    public constructor(init?: Partial<SpListAttachment>) {
        Object.assign(this, init);
    }

    public Id: string;
    public Title: string;
    public DocName: string;
    public Updated: Date;
    public Author: SPAuthor;
    public EditUrl: string;
    public Url: string;
    public Version: number;
    public LinkedProductGuid: string;
}

export class SpProductItem {
    public constructor(init?: Partial<SpProductItem>) {
        Object.assign(this, init);
    }

    public Id?: number;
    public GUID?: string;
    public Title: string;
    public ProdData: string;
    public Active: boolean;
    public Created: Date;
    public Modified: Date;
}
