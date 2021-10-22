import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import AppService from '../../../../services/AppService';
import RecordService from '../../../../services/RecordService';

import { TeamMemberModel, TeamMemberRole } from '../../../../models/TeamModel';
import { DefaultButton, IconButton, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputToggle } from '../FormComponents/FormInputToggle';

export interface ITeamMemberConfigProps {
    teamId: string;
    canEditMembers: boolean;
    triggerUpdate: () => void;
    showInactive: boolean;
}

export interface ITeamMemberConfigState {
    draftMember: TeamMemberModel;
    showPane: boolean;
}

export default class TeamMemberConfig extends React.Component <ITeamMemberConfigProps, ITeamMemberConfigState> {
    private hasUpdates = false;
    constructor(props: ITeamMemberConfigProps) {
        super(props);
        this.state = { draftMember: null, showPane: false };
    }

    public render(): React.ReactElement<ITeamMemberConfigProps> {
        // - {d.active ? 'Active' : 'InActive'}
        const teamMembers = AppService.AppSettings.teamMembers
        .filter(f => f.teamId === this.props.teamId)
        .filter(f => this.props.showInactive ? f : f.active);
        return (
            <Stack>
                <Stack horizontal verticalAlign={'center'}>
                    <Stack.Item>
                        Members [{teamMembers.length}]
                    </Stack.Item>
                    <Stack.Item>
                        <IconButton iconProps={{ iconName: 'Add', styles: { root: { fontSize: '0.7rem' } } }} title='Add Member' ariaLabel='Add Member' onClick={this.addNewMember.bind(this)} />
                    </Stack.Item>
                </Stack>
                {
                    // TODO: Maybe consider sorting the members by ROLE and then alaphabetically
                    teamMembers.map(d => {
                        return (
                            <Stack horizontal key={d.memberId}>
                                <div className={styles.pointer} onClick={this.showDetailPane.bind(this, d)} style={{ paddingLeft: 10, color: d.active ? '#000' : '#ccc', fontSize: '0.8rem' }}>
                                    {d.name} - {d.role}
                                </div>
                            </Stack>
                        );
                    })
                }
                { this.state.draftMember &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={!this.hasUpdates}
                        isOpen={this.state.showPane}
                        onDismiss={this.closeDetailPane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        headerText={`${this.state.draftMember.name} [${this.state.draftMember.active ? 'Active' : 'InActive'}]`}
                        onRenderHeader={this.getPaneHeader.bind(this)}
                    >
                        <Stack>
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
                                fieldValue={[this.state.draftMember.teamId]}
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

    private showDetailPane(member: TeamMemberModel): void {
        if (this.props.canEditMembers) {
            this.setState({ showPane: true, draftMember: member });
        }
    }

    private closeDetailPane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftMember: null });
        } else {
            this.saveMember();
        }
    }

    private addNewMember(): void {
        const newMem = RecordService.GetNewTeamMemberModel(this.props.teamId);
        this.setState({ showPane: true, draftMember: newMem });
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
            // We unfortunately have to have the parent redraw all children in case someone
            //  is moved to a different team.  This will destroy and rebuild each child
            this.props.triggerUpdate();
        })
        .catch(e => Promise.reject(e));
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftMember.name} [{this.state.draftMember.active ? 'Active' : 'InActive'}]
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveMember.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closeDetailPane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                        <FormInputToggle
                            labelValue={'Active Member'}
                            fieldValue={this.state.draftMember.active}
                            fieldRef={'active'}
                            onUpdated={this.updateMember.bind(this)}
                            oneRow={true}
                        />
                    </Stack>
                </Stack>
            </div>
        );
    }
}
