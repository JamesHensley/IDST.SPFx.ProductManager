import { TeamMemberModel } from './PeopleModel';

export class TeamModel {
    id: string;
    name: string;
    description: string;
    members: Array<TeamMemberModel>;
}
