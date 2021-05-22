import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

import { Accordion } from '@pnp/spfx-controls-react/lib/Accordion';
import { TeamModel } from '../../../models/TeamModel';
import AppService from '../../../services/AppService';

export interface ITeamPanelProps {
    teams: Array<TeamModel>;
}

export interface ITeamPanelState {
    teams: Array<TeamModel>;
}

export default class TeamPanel extends React.Component <ITeamPanelProps, ITeamPanelState> {
    constructor(props: ITeamPanelProps) {
        super(props);
        const stateObj: ITeamPanelState = {
            teams: this.props.teams
        };
        this.state = stateObj;
    }

    public render(): React.ReactElement<ITeamPanelProps> {
        return(
            <div className={styles.teamPanel}>
                {
                    this.state.teams.map(t => {
                        return(
                            <Accordion title={t.name} defaultCollapsed={true} key={t.id}>
                                {t.members.map(m => {
                                    return <div key={m.memberNum}>{m.name} - {m.role}</div>;
                                })}
                            </Accordion>
                        );
                    })
                }
            </div>
        );
    }
}
