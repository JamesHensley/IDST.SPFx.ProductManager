import { Panel, PanelType, Separator, Stack, Toggle } from '@fluentui/react';
import * as React from 'react';
import { TeamMemberModel, TeamMemberRole, TeamModel } from '../../../../models/TeamModel';
import AppService from '../../../../services/AppService';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import * as styles from '../ProductManager.module.scss';
// import TeamMemberConfigPane from './TeamMemberConfigPane';

export interface ITeamMemberConfigProps {
    teamId: string;
    teamMemberId: string;
    saveMember: (newModel: TeamMemberModel, teamId: string) => void;
    canEditMembers: boolean;
}

export interface ITeamMemberConfigState {
    draftMember: TeamMemberModel;
    showPane: boolean;
    teamId: string;
}

export default class TeamMemberConfig extends React.Component <ITeamMemberConfigProps, ITeamMemberConfigState> {
    private hasUpdates: boolean = false;

    constructor(props: ITeamMemberConfigProps) {
        super(props);
        const team = AppService.AppSettings.teams.reduce((t, n) => n.teamId === props.teamId ? n : t, null);
        this.state = {
            draftMember: team ? team.members.reduce((t, n) => n.memberId == props.teamMemberId ? n : t, null) : null,
            showPane: false,
            teamId: this.props.teamId
        };
    }

    public render(): React.ReactElement<ITeamMemberConfigProps> {
        return (
            <>
                <Stack horizontal key={this.state.draftMember.memberId}>
                    <div className={styles.pointer} onClick={this.showDetailPane.bind(this)} style={{ color: this.state.draftMember.active ? '#000' : '#ccc' }}>
                        {this.state.draftMember.name} - {this.state.draftMember.role} - {this.state.draftMember.active ? 'Active' : 'InActive'}
                    </div>
                </Stack>

                <Panel
                    className={styles.productDetailPane}
                    isHiddenOnDismiss={false}
                    isLightDismiss={true}
                    isOpen={this.state.showPane}
                    onDismiss={this.closeDetailPane.bind(this)}
                    closeButtonAriaLabel='Close'
                    type={PanelType.medium}
                    headerText={`${this.state.draftMember.name} [${this.state.draftMember.active ? 'Active' : 'InActive'}]`}
                >
                    <Stack>
                        <Stack.Item align='end'>
                            <FormInputToggle
                                labelValue={'Active Member'}
                                fieldValue={this.state.draftMember.active}
                                fieldRef={'active'}
                                onUpdated={this.updateMember.bind(this)}
                                oneRow={true}
                            />
                        </Stack.Item>
                        <Separator />
                        <FormInputText
                            labelValue={'Name'} editing={true}
                            fieldValue={this.state.draftMember.name}
                            fieldRef={'name'}
                            onUpdated={this.updateMember.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Email'} editing={true}
                            fieldValue={this.state.draftMember.email}
                            fieldRef={'email'}
                            onUpdated={this.updateMember.bind(this)}
                        />
                        <FormInputDropDown
                            labelValue='Team Member Role'
                            editing={true}
                            fieldRef={'role'}
                            fieldValue={TeamMemberRole[this.state.draftMember.role]}
                            onUpdated={this.updateMember.bind(this)}
                            allowNull={false}
                            options={Object.keys(TeamMemberRole).map(d => ({
                                key: d,
                                value: TeamMemberRole[d],
                                selected: this.state.draftMember.role === TeamMemberRole[d]
                                } as KeyValPair)
                            )}
                        />
                        <FormInputDropDown
                            labelValue='Team Assignment'
                            editing={true}
                            fieldRef={'teamId'}
                            fieldValue={this.state.teamId}
                            onUpdated={this.updateMember.bind(this)}
                            allowNull={false}
                            options={
                                AppService.AppSettings.teams
                                .map(d => {
                                    return {
                                        key: d.teamId,
                                        value: d.name,
                                        selected: d.teamId === this.state.teamId
                                    } as KeyValPair
                                })
                            }
                        />
                    </Stack>
                </Panel>
            </>
        );
    }

    public showDetailPane(): void {
        if (this.props.canEditMembers) {
            this.setState({ showPane: true });
        }
    }

    public closeDetailPane(): void {
        if (this.hasUpdates) {
            this.props.saveMember(this.state.draftMember, this.state.teamId);
        } else {
            this.setState({ showPane: false });
        }
    }

    private updateMember(fieldVal: any, fieldRef: string): void {
        this.hasUpdates = true;
        const newDraft = new TeamMemberModel(this.state.draftMember);
        switch (fieldRef) {
            case 'teamId':
                this.setState({ teamId: fieldVal })
                break;
            case 'role':
                newDraft.role = TeamMemberRole[fieldVal];
                this.setState({ draftMember: newDraft });
                break;
            default:
                newDraft[fieldRef] = fieldVal;
                this.setState({ draftMember: newDraft });
                break;
        }
    }    
}
