export enum Roles {
    Manager = 1,
    Lead = 2,
    Default = 3
}

export class TeamMemberModel {
    public constructor(init?: Partial<TeamMemberModel>) {
        Object.assign(this, init);
    }

    public memberNum: string;
    public name: string;
    public email: string;
    public role: Roles;
    public spId: string;
    public active: boolean;
}

export class TeamModel {
    public constructor(init?: Partial<TeamModel>) {
        Object.assign(this, init);
    }

    id: number;
    teamId: string;
    name: string;
    description: string;
    members: Array<TeamMemberModel>;
    active: boolean;
    shortName: string;
}
