export enum TeamMemberRole {
    Manager = 1,
    Lead = 2,
    Default = 3
}

export class TeamMemberModel {
    public constructor(init?: Partial<TeamMemberModel>) {
        Object.assign(this, init);
    }

    public name: string;
    public email: string;
    public role: TeamMemberRole;
    public spId: string;
    public active: boolean;
}

export class TeamModel {
    public constructor(init?: Partial<TeamModel>) {
        Object.assign(this, init);
        this.members = init ? (init.members ? init.members.map(d => new TeamMemberModel(d)) : []) : [];
    }

    id: number;
    teamId: string;
    name: string;
    description: string;
    members: Array<TeamMemberModel>;
    active: boolean;
    shortName: string;
}
