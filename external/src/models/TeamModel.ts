import { TeamMemberModel } from './PeopleModel';

export class TeamModel {
    id: number;
    teamId: string;
    name: string;
    description: string;
    members: Array<TeamMemberModel>;
    active: boolean;
    shortName: string;
}
