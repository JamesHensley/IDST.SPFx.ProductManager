import { Stack, Toggle } from '@fluentui/react';
import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import { TeamMemberModel, TeamMemberRole, TeamModel } from '../../../models/TeamModel';
import AppService from '../../../services/AppService';
import { FormInputToggle } from './FormComponents/FormInputToggle';
import TeamMemberDetailPane from './TeamMemberDetailPane';

export interface ITeamViewProps {
    teamModel: TeamModel;
}

export interface ITeamViewState {
    teamModel: TeamModel;
    selectedMember: TeamMemberModel;
    showInActive: boolean;
}

export default class TeamView extends React.Component <ITeamViewProps, ITeamViewState> {
    constructor(props: ITeamViewProps) {
        super(props);
        console.log('TeamView.constructor: ', props);
        this.state = {
            teamModel: this.props.teamModel,
            showInActive: true,
            selectedMember: null
        };
    }

    public render(): React.ReactElement<ITeamViewProps> {
        return (
            <Stack>
                <h1>Not all Team View Features Are Available Yet</h1>
                <h2>Team View For {this.state.teamModel.name}</h2>
                <Toggle
                    label={'Show InActive Members'}
                    checked={this.state.showInActive}
                    onChange={this.toggleActiveMembers.bind(this)}
                />
                {
                    this.state.teamModel.members
                    .filter(f => this.state.showInActive ? true : f.active)
                    .map(d => {
                        return (
                            <Stack horizontal key={d.memberId}>
                                <div className={styles.clickableItem} key={d.memberId} onClick={this.showTeamMemberDetail.bind(this, d)}>
                                    {d.name} - {d.role}
                                </div>
                            </Stack>
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
            </Stack>
        );
    }

    private showTeamMemberDetail(e: TeamMemberModel): void {
        this.setState({ selectedMember: e });
    }

    private closeDetailPane(): void {
        this.setState({ selectedMember: null });
    }

    private updateTeam(newTeam: TeamModel): void {
        console.log('TeamView.updateTeam: ', newTeam);
    }

    private updateMember(newModel: TeamMemberModel): void {
        console.log('TeamView.updateMember 1: ', newModel);

        const newTeam = Object.assign(new TeamModel(), this.state.teamModel);
        newTeam.members = this.state.teamModel.members
            .filter(f => f.memberId !== newModel.memberId)
            .concat([newModel]);
        const teams = AppService.AppSettings.teams.filter(f => f.teamId !== newTeam.teamId)
            .concat([newTeam]);

        AppService.UpdateAppSetting({ teams: teams })
        .then(newSettings => {
            console.log('TeamView.updateMember 2: ', newSettings);
            /*
            this.setState({
                teamModel: newSettings.teams
                .reduce((t, n) => n.teamId === this.state.teamModel.teamId ? n : t, null)
            });
            */
        });
    }

    private toggleActiveMembers(): void {
        this.setState({ showInActive: !this.state.showInActive });
    }

    private toggleMemberActive(member: TeamMemberModel): void {
        member.active = !member.active;
        this.updateMember(member);
    }

    public componentDidMount(): void { console.log('TeamView.componentDidMount: ', this.props, this.state); }
}
