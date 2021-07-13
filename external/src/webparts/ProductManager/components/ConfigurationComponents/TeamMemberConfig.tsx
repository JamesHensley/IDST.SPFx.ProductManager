import { Stack, Toggle } from '@fluentui/react';
import * as React from 'react';
import { TeamMemberModel, TeamModel } from '../../../../models/TeamModel';
import AppService from '../../../../services/AppService';
import * as styles from '../ProductManager.module.scss';
import TeamMemberConfigPane from './TeamMemberConfigPane';

export interface ITeamMemberConfigProps {
    teamId: string;
    teamMemberId: string;
    saveMember: (newModel: TeamMemberModel, teamId: string) => void;
    canEditMembers: boolean;
}

export interface ITeamMemberConfigState {
    draftMember: TeamMemberModel;
    showPane: boolean;
}

export default class TeamMemberConfig extends React.Component <ITeamMemberConfigProps, ITeamMemberConfigState> {
    constructor(props: ITeamMemberConfigProps) {
        super(props);
        const team = AppService.AppSettings.teams.reduce((t, n) => n.teamId === props.teamId ? n : t, null);
        this.state = {
            draftMember: team ? team.members.reduce((t, n) => n.memberId == props.teamMemberId ? n : t, null) : null,
            showPane: false
        };
    }

    public render(): React.ReactElement<ITeamMemberConfigProps> {
        const d = this.state.draftMember;
        return (
            <>
                <Stack horizontal key={d.memberId}>
                    <div className={styles.pointer} onClick={this.showDetailPane.bind(this, d)} style={{ color: d.active ? '#000' : '#ccc' }}>
                        {d.name} - {d.role} - {d.active ? 'Active' : 'InActive'}
                    </div>
                </Stack>

                <TeamMemberConfigPane
                    key={new Date().getTime()}
                    teamId={this.props.teamId}
                    teamMemberModel={this.state.draftMember}
                    closePaneCallBack={this.closeDetailPane.bind(this)}
                    saveMember={this.saveMember.bind(this)}
                    showPane={this.state.showPane}
                />
            </>
        );
    }

    public showDetailPane(): void {
        if (this.props.canEditMembers) {
            this.setState({ showPane: true });
        }
    }

    public closeDetailPane(): void {
        this.setState({ showPane: false });
    }

    private saveMember(newModel: TeamMemberModel, teamId: string): void {
        this.props.saveMember(newModel, teamId);
    }    
}
