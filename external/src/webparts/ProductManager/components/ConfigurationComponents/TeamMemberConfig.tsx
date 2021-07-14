import { Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as React from 'react';
import { TeamMemberModel, TeamMemberRole } from '../../../../models/TeamModel';
import AppService from '../../../../services/AppService';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import * as styles from '../ProductManager.module.scss';

export interface ITeamMemberConfigProps {
    teamId: string;
    canEditMembers: boolean;
    triggerUpdate: () => void;
}

export interface ITeamMemberConfigState {
    draftMember: TeamMemberModel;
    showPane: boolean;
}

export default class TeamMemberConfig extends React.Component <ITeamMemberConfigProps, ITeamMemberConfigState> {
    private hasUpdates = false;

    constructor(props: ITeamMemberConfigProps) {
        super(props);
        this.state = {
            draftMember: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<ITeamMemberConfigProps> {
        const teamMembers = AppService.AppSettings.teamMembers.filter(f => f.teamId === this.props.teamId);
        return (
            <Stack>
                Members [{teamMembers.length}]
                {
                    teamMembers.map(d => {
                        return (
                            <Stack horizontal key={d.memberId}>
                                <div className={styles.pointer} onClick={this.showDetailPane.bind(this, d)} style={{ paddingLeft: 10, color: d.active ? '#000' : '#ccc', fontSize: '0.8rem' }}>
                                    {d.name} - {d.role} - {d.active ? 'Active' : 'InActive'}
                                </div>
                            </Stack>
                        );
                    })
                }
                { this.state.draftMember &&
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
                                disabledKeys={[]}
                            />
                            <FormInputDropDown
                                labelValue='Team Assignment'
                                editing={true}
                                fieldRef={'teamId'}
                                fieldValue={this.state.draftMember.teamId}
                                onUpdated={this.updateMember.bind(this)}
                                allowNull={false}
                                options={
                                    AppService.AppSettings.teams
                                    .map(d => {
                                        return {
                                            key: d.teamId,
                                            value: d.name,
                                            selected: d.teamId === this.state.draftMember.teamId
                                        } as KeyValPair;
                                    })
                                }
                                disabledKeys={AppService.AppSettings.teams.filter(f => !f.active).map(d => d.teamId)}
                            />
                        </Stack>
                    </Panel>                
                }
            </Stack>
        );
    }

    public showDetailPane(member: TeamMemberModel): void {
        if (this.props.canEditMembers) {
            this.setState({ showPane: true, draftMember: member });
        }
    }

    private closeDetailPane(): void {
        if (this.hasUpdates) {
            this.saveMember();
        } else {
            this.setState({ showPane: false, draftMember: null });
        }
    }

    private updateMember(fieldVal: any, fieldRef: string): void {
        this.hasUpdates = true;
        const newDraft = new TeamMemberModel(this.state.draftMember);
        switch (fieldRef) {
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

    private saveMember(): void {
        const members = AppService.AppSettings.teamMembers
        .filter(f => f.memberId !== this.state.draftMember.memberId)
        .concat([this.state.draftMember])
        .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));

        AppService.UpdateAppSetting({ teamMembers: members })
        .then(newSettings => {
            this.setState({ showPane: false, draftMember: null });
            this.props.triggerUpdate();
        });
    }    
}
