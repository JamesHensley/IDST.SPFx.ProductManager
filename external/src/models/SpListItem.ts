
export class SPAuthor {
    Name: string;
}

export class SpListAttachment {
    Id: string;
    Title: string;
    Updated: Date;
    Author: SPAuthor;
    Url: string;
    Version: string;
    LinkedProductGuid: string;
}

export class CustomSpFieldTeamTask {
    public TeamId: string;
}

export class SpProductItem {
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
}
