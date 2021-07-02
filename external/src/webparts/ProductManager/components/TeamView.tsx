import * as React from 'react';

import { TeamMemberModel, TeamMemberRole, TeamModel } from '../../../models/TeamModel';
import AppService from '../../../services/AppService';
import TeamMemberDetailPane from './TeamMemberDetailPane';

export interface ITeamViewProps {
    teamId: string;
}

export interface ITeamViewState {
    teamModel: TeamModel;
    selectedMember: TeamMemberModel;
}

export default class TeamView extends React.Component <ITeamViewProps, ITeamViewState> {
    constructor(props: ITeamViewProps) {
        super(props);
        this.state = { teamModel: AppService.AppSettings.teams.reduce((t, n) => n.teamId === this.props.teamId ? n : t, null), selectedMember: null };
    }

    public render(): React.ReactElement<ITeamViewProps> {
        return (
            <>
                <h1>Not all Team View Features Are Available Yet</h1>
                <div>Team View For {this.state.teamModel.name}</div>
                {
                    this.state.teamModel.members.map(d => {
                        return (
                            <div key={d.spId} onClick={this.showTeamMemberDetail.bind(this, d)}>
                                {d.name} {TeamMemberRole[d.role]}
                            </div>
                        );
                    })
                }
                { this.state.selectedMember &&
                    <TeamMemberDetailPane
                        teamMemberModel={this.state.selectedMember}
                        closePaneCallBack={this.closeDetailPane.bind(this)}
                        updateMemberCallBack={this.updateMember.bind(this)}
                    />
                }
            </>
        );
    }

    private showTeamMemberDetail(e: TeamMemberModel): void {
        this.setState({ selectedMember: e });
    }

    private closeDetailPane(): void {
        this.setState({ selectedMember: null });
    }

    private updateMember(newModel: TeamMemberModel): void {
        console.log('Should save new member: ', newModel);
        // Do something here to update the configuration
    }
}
