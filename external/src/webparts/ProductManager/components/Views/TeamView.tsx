import { Stack, Toggle } from '@fluentui/react';
import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { TeamModel } from '../../../../models/TeamModel';

export interface ITeamViewProps {
    teamModel: TeamModel;
}

export interface ITeamViewState {
    teamModel: TeamModel;
}

export default class TeamView extends React.Component <ITeamViewProps, ITeamViewState> {
    constructor(props: ITeamViewProps) {
        super(props);
        console.log('TeamView.constructor: ', props);
        this.state = {
            teamModel: this.props.teamModel
        };
    }

    public render(): React.ReactElement<ITeamViewProps> {
        return (
            <Stack>
                <h1>Not all Team View Features Are Available Yet</h1>
                <h2>Team View For {this.state.teamModel.name}</h2>
            </Stack>
        );
    }
}
