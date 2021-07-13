import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import { TeamMemberModel, TeamMemberRole, TeamModel } from '../../../models/TeamModel';
import { DefaultButton, Panel, PanelType, Separator, Stack, Toggle } from '@fluentui/react';
import { FormInputText } from './FormComponents/FormInputText';
import { FormInputDropDown, KeyValPair } from './FormComponents/FormInputDropDown';
import { FormInputToggle } from './FormComponents/FormInputToggle';

export interface ITeamMemberDetailPaneProps {
    closePaneCallBack: () => void;
    updateMemberCallBack: (newModel: TeamMemberModel) => void;
    teamMemberModel: TeamMemberModel;
}

export interface ITeamMemberDetailPaneState {
    draftMember: TeamMemberModel;
}

export default class TeamMemberDetailPane extends React.Component <ITeamMemberDetailPaneProps, ITeamMemberDetailPaneState> {
    constructor(props: ITeamMemberDetailPaneProps) {
        super(props);
        this.state = { draftMember: new TeamMemberModel(this.props.teamMemberModel) };
    }

    public render(): React.ReactElement<ITeamMemberDetailPaneProps> {
        console.log('TeamMemberDetailPane.render');
        return (
            <Panel
                className={styles.productDetailPane}
                isHiddenOnDismiss={false}
                isOpen={true}
                onDismiss={this.closePane.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                <DefaultButton onClick={this.saveMemberDetails.bind(this)}>Save Member</DefaultButton>
                <Separator />
                <Stack>
                    <FormInputToggle
                        labelValue={'Active Member'}
                        fieldValue={this.state.draftMember.active}
                        fieldRef={'active'}
                        onUpdated={this.updateMember.bind(this)}
                    />
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
                        onUpdated={this.updateRole.bind(this)}
                        allowNull={false}
                        options={Object.keys(TeamMemberRole).map(d => ({
                            key: d,
                            value: TeamMemberRole[d],
                            selected: this.state.draftMember.role === TeamMemberRole[d]
                            } as KeyValPair)
                        )}
                    />
                </Stack>
            </Panel>
        );
    }

    private updateRole(roleVal: string): void {
        console.log('TeamMemberDetailPane.updateRole: ', roleVal);
        const newDraft = new TeamMemberModel(this.state.draftMember);
        newDraft.role = TeamMemberRole[roleVal];
        this.setState({ draftMember: newDraft });
    }

    private updateMember(fieldVal: any, fieldRef: string): void {
        const newDraft = new TeamMemberModel(this.state.draftMember);
        newDraft[fieldRef] = fieldVal;
        this.setState({ draftMember: newDraft });
    }

    private saveMemberDetails(): void {
        this.props.updateMemberCallBack(this.state.draftMember);
    }

    private closePane(): void {
        this.props.closePaneCallBack();
    }
}
