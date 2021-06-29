import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import { TeamMemberModel, TeamMemberRole, TeamModel } from '../../../models/TeamModel';
import { Panel, PanelType } from '@fluentui/react';

export interface ITeamMemberDetailPaneProps {
    closePaneCallBack: () => void;
    updateMemberCallBack: (newModel: TeamMemberModel) => void;
    teamMemberModel: TeamMemberModel;
}

export interface ITeamMemberDetailPaneState {
    draftMember: TeamMemberModel;
}

export default class TeamView extends React.Component <ITeamMemberDetailPaneProps, ITeamMemberDetailPaneState> {
    constructor(props: ITeamMemberDetailPaneProps) {
        super(props);
        this.state = { draftMember: new TeamMemberModel(this.props.teamMemberModel) };
    }

    public render(): React.ReactElement<ITeamMemberDetailPaneProps> {
        return (
            <Panel
                className={styles.productDetailPane}
                isHiddenOnDismiss={false}
                isOpen={true}
                onDismiss={this.closePane.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
            </Panel>
        );
    }

    private updateMember(fieldRef: string, fieldVal: any): void {
        const newDraft = new TeamMemberModel(this.state.draftMember);
        newDraft[fieldRef] = fieldVal;
        this.props.updateMemberCallBack(newDraft);
    }

    private closePane(): void {
        this.props.closePaneCallBack();
    }
}
