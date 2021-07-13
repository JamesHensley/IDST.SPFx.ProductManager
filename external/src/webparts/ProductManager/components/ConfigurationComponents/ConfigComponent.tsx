import { Label, Stack, Toggle } from '@fluentui/react';
import * as React from 'react';
import { TeamMemberModel, TeamModel } from '../../../../models/TeamModel';
import AppService from '../../../../services/AppService';
import * as styles from '../ProductManager.module.scss';
import TeamConfig from './TeamConfig';

export interface IConfigComponentProps {}
export interface IConfigComponentState {}

export default class ConfigComponent extends React.Component <IConfigComponentProps, IConfigComponentState> {
    public render(): React.ReactElement<IConfigComponentProps> {

        return (
            <Stack>
                <Stack.Item className={styles.configZone}>
                    <Label style={{ fontSize: '1.5rem' }}>Teams</Label>
                    <Stack horizontal key={new Date().getTime()}>
                        {
                            AppService.AppSettings.teams
                            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
                            .map(d => {
                                return (
                                    <Stack.Item grow key={d.teamId}>
                                        <TeamConfig teamId={d.teamId} saveTeam={this.updateTeam.bind(this)} />
                                    </Stack.Item>
                                );
                            })
                        }
                    </Stack>
                </Stack.Item>
            </Stack>
        );
    }

    private updateTeam(teamModel: TeamModel, moveMember?: TeamMemberModel, newTeamId?: string): void {
        const teams = AppService.AppSettings.teams
        .filter(f => f.teamId !== teamModel.teamId)
        .reduce((t, n) => {
            // Handle moving a member to a new team if necessary
            if (newTeamId && n.teamId === newTeamId) {
                n.members = n.members.concat([moveMember]);
            };
            return t.concat([n]);
        }, [teamModel])
        .map(d => {
            if (!d.active) { d.members = d.members.map(m => { m.active = false; return m; })}
            return d;
        });

        AppService.UpdateAppSetting({ teams: teams.sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0)) });
    }
}
