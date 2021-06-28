import { TeamMemberModel } from './PeopleModel';

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
