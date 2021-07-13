import { Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as React from 'react';
import { TeamMemberModel, TeamModel } from '../../../../models/TeamModel';
import AppService from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import * as styles from '../ProductManager.module.scss';
import TeamMemberConfig from './TeamMemberConfig';

export interface ITeamConfigProps {
    teamId: string;
    saveTeam: (newModel: TeamModel, moveMember?: TeamMemberModel, newTeamId?: string) => void;
}

export interface ITeamConfigState {
    draftTeam: TeamModel;
    showPane: boolean;
}

export default class TeamConfig extends React.Component <ITeamConfigProps, ITeamConfigState> {
    private hasUpdates: boolean = false;

    constructor(props: ITeamConfigProps) {
        super(props);
        this.state = {
            draftTeam: AppService.AppSettings.teams.reduce((t, n) => n.teamId === props.teamId ? n : t, null),
            showPane: false
        }
    }

    public render(): React.ReactElement<ITeamConfigProps> {
        return (
            <>
                <Stack className={styles.card} style={{ opacity: this.state.draftTeam.active ? 1 : 0.4 }}>
                    <Label onClick={this.showPane.bind(this)} className={styles.pointer}>{this.state.draftTeam.name}</Label>
                    <Label onClick={this.showPane.bind(this)} className={styles.pointer}>{this.state.draftTeam.active ? 'Active Team' : 'InActive Team'}</Label>
                    <Stack.Item>
                        {
                            (this.state.draftTeam.members || [])
                            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0))
                            .map(d => {
                                return (
                                    <TeamMemberConfig key={d.memberId}
                                        teamId={this.state.draftTeam.teamId}
                                        teamMemberId={d.memberId}
                                        saveMember={this.updateTeamMember.bind(this)}
                                        canEditMembers={this.state.draftTeam.active}
                                    />
                                );
                            })
                        }
                    </Stack.Item>
                </Stack>
                <Panel
                    className={styles.productDetailPane}
                    isHiddenOnDismiss={false}
                    isLightDismiss={true}
                    isOpen={this.state.showPane}
                    onDismiss={this.closePane.bind(this)}
                    closeButtonAriaLabel='Close'
                    type={PanelType.medium}
                    headerText={`${this.state.draftTeam.name} [${this.state.draftTeam.active ? 'Active' : 'InActive'}]`}
                >
                    <Stack>
                        <Stack.Item align='end'>
                            <FormInputToggle
                                labelValue={'Active Team'}
                                fieldValue={this.state.draftTeam.active}
                                fieldRef={'active'}
                                onUpdated={this.updateTeamField.bind(this)}
                                oneRow={true}
                            />
                        </Stack.Item>
                        <Separator />
                        <Stack horizontal tokens={{ childrenGap: 10 }}>
                            <Stack.Item grow={4}>
                                <FormInputText
                                    labelValue={'Team Name'} editing={true}
                                    fieldValue={this.state.draftTeam.name}
                                    fieldRef={'name'}
                                    onUpdated={this.updateTeamField.bind(this)}
                                />
                            </Stack.Item>
                            <Stack.Item grow={1}>
                                <FormInputText
                                    labelValue={'Team Initials'} editing={true}
                                    fieldValue={this.state.draftTeam.shortName}
                                    fieldRef={'shortName'}
                                    onUpdated={this.updateTeamField.bind(this)}
                                    onGetErrorMessage={((val: string) => (val.length < 1 || val.length > 2) ? 'Should only be 1 or 2 characters' : '').bind(this)}
                                />
                            </Stack.Item>
                        </Stack>
                        <FormInputText
                            labelValue={'Description'} editing={true}
                            fieldValue={this.state.draftTeam.description}
                            fieldRef={'description'}
                            editLines={5}
                            onUpdated={this.updateTeamField.bind(this)}
                        />
                    </Stack>
                </Panel>
            </>
        );
    }

    private showPane(): void { this.setState({ showPane: true }) }
    private closePane(): void {
        if (this.hasUpdates) {
            // Saving appsettings will cause an unmount/reload on all components
            this.props.saveTeam(this.state.draftTeam);
        } else {
            this.setState({ showPane: false });
        }
    }

    private updateTeamMember(member: TeamMemberModel, teamId: string): void {
        const newTeam = Object.assign(new TeamModel(), this.state.draftTeam);
        if (teamId === this.state.draftTeam.teamId) {
            newTeam.members = this.state.draftTeam.members
            .filter(f => f.memberId != member.memberId)
            .concat([member])
            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));
    
            this.props.saveTeam(newTeam);
        } else {
            newTeam.members = this.state.draftTeam.members
            .filter(f => f.memberId != member.memberId)
            .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));
    
            this.props.saveTeam(newTeam, member, teamId);
        }
    }

    private updateTeamField(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;

        const newTeam = Object.assign(new TeamModel(), this.state.draftTeam);
        newTeam[fieldRef] = fieldVal;
        this.setState({ draftTeam: newTeam });
    }
}
