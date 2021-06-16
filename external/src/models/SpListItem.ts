
export class SPAuthor {
    Name: string;
    Email: string;
}

export class SpListAttachment {
    public constructor(init?: Partial<SpListAttachment>) {
        Object.assign(this, init);
    }

    public Id: string;
    public Title: string;
    public Updated: Date;
    public Author: SPAuthor;
    public Url: string;
    public Version: number;
    public LinkedProductGuid: string;
}

export class CustomSpFieldTeamTask {
    public TeamId: string;
}

export class SpProductItem {
    public constructor(init?: Partial<SpProductItem>) {
        Object.assign(this, init);
    }

    public Id: number;
    public Title: string;
    public Guid: string;
    public Description: string;
    public RequestDate: string;
    public ReturnDateExpected: string;
    public ReturnDateActual: string;
    public Requestor: string;
    public AssignedTeamData: string;
    public ProductStatus: string;
    public ProductType: string;
    public EventType: string;
    public EventDate: string;
    public ClassificationId: string;
    public RequestUrl: string;
    public Customer: string;
    public Comments: string;
}
