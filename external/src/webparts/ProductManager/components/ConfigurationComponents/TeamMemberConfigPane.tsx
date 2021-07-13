import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { TeamMemberModel, TeamMemberRole, TeamModel } from '../../../../models/TeamModel';
import { DefaultButton, Panel, PanelType, Separator, Stack, Toggle } from '@fluentui/react';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import AppService from '../../../../services/AppService';

export interface ITeamMemberConfigPaneProps {
    closePaneCallBack: () => void;
    saveMember: (newModel: TeamMemberModel, teamId) => void;
    teamMemberModel: TeamMemberModel;
    teamId: string;
    showPane: boolean;
}

export interface ITeamMemberConfigPaneState {
    draftMember: TeamMemberModel;
    teamId: string;
}

export default class TeamMemberConfigPane extends React.Component <ITeamMemberConfigPaneProps, ITeamMemberConfigPaneState> {
    constructor(props: ITeamMemberConfigPaneProps) {
        super(props);
        this.state = {
            draftMember: new TeamMemberModel(this.props.teamMemberModel),
            teamId: props.teamId
        };
    }

    public render(): React.ReactElement<ITeamMemberConfigPaneProps> {
        return (
            <Panel
                className={styles.productDetailPane}
                isHiddenOnDismiss={false}
                isOpen={this.props.showPane}
                onDismiss={this.closePane.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                <Stack>
                    <Stack horizontal>
                        <Stack.Item align='start' grow>
                            <DefaultButton onClick={this.saveMemberDetails.bind(this)}>Save Member</DefaultButton>
                        </Stack.Item>
                        <Stack.Item align='end' grow>
                            <FormInputToggle
                                labelValue={'Active Member'}
                                fieldValue={this.state.draftMember.active}
                                fieldRef={'active'}
                                onUpdated={this.updateMember.bind(this)}
                                oneRow={true}
                            />
                        </Stack.Item>
                    </Stack>
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
        );
    }

    private updateMember(fieldVal: any, fieldRef: string): void {
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

    private saveMemberDetails(): void {
        this.props.saveMember(this.state.draftMember, this.state.teamId);
    }

    private closePane(): void {
        this.props.closePaneCallBack();
    }
}
