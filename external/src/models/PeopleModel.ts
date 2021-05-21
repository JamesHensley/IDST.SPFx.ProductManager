export enum Roles {
    Manager = 1,
    Lead = 2,
    Default = 3
}

export interface IPeopleModel {
    name: string;
    email: string;
    role: Roles;
    spId: string;
}

export class TeamMemberModel implements IPeopleModel {
    //
    public memberNum: string;
    //
    public name: string;
    public email: string;
    public role: Roles;
    public spId: string;
}
