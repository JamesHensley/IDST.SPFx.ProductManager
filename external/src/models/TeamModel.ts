export enum TeamMemberRole {
    manager = 'Manager',
    lead = 'Lead',
    default = 'Member'
}

export class TeamMemberModel {
    public constructor(init?: Partial<TeamMemberModel>) {
        Object.assign(this, init);
    }

    name: string;
    email: string;
    role: TeamMemberRole;
    spId: string;
    active: boolean;
    memberId: string;
    teamId: string;
}

export class TeamModel {
    public constructor(init?: Partial<TeamModel>) {
        Object.assign(this, init);
    }

    id: number;
    teamId: string;
    name: string;
    description: string;
    active: boolean;
    shortName: string;
    teamColor: string;
}
