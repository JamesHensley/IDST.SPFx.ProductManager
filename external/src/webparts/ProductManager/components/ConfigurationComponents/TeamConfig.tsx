import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';

import { DefaultButton, ICommandBarItemProps, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import { TeamModel } from '../../../../models/TeamModel';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import TeamMemberConfig from './TeamMemberConfig';
import RecordService from '../../../../services/RecordService';

export interface ITeamConfigProps { }

export interface ITeamConfigState {
    draftTeam: TeamModel;
    showPane: boolean;
    lastUpdated: number;
}

export default class TeamConfig extends React.Component <ITeamConfigProps, ITeamConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;
    
    constructor(props: ITeamConfigProps) {
        super(props);
        this.state = {
            draftTeam: null,
            showPane: false,
            lastUpdated: new Date().getTime()
        };
    }

    public render(): React.ReactElement<ITeamConfigProps> {
        return (
            <Stack className={styles.configZone}>
                <Label style={{ fontSize: '1.5rem' }}>Teams</Label>
                <Stack horizontal key={new Date().getTime()}>
                    {
                        AppService.AppSettings.teams.map(d => {
                            return (
                                <Stack.Item grow key={d.teamId}>
                                    <Stack className={styles.card} style={{ opacity: d.active ? 1 : 0.4 }}>
                                        <Stack.Item onClick={this.showPane.bind(this, d)}>
                                            <Label className={`${styles.pointer} ${styles.padBottom0}`}>{d.name}</Label>
                                            <Label className={`${styles.pointer} ${styles.padTop0}`}>{d.active ? 'Active Team' : 'InActive Team'}</Label>
                                        </Stack.Item>
                                        <TeamMemberConfig key={new Date().getTime()} teamId={d.teamId} canEditMembers={d.active} triggerUpdate={() => this.setState({ lastUpdated: new Date().getTime() })}/>
                                    </Stack>
                                </Stack.Item>
                            );
                        })
                    }
                </Stack>
                {
                    this.state.draftTeam &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={true}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        onRenderHeader={this.getPaneHeader.bind(this)}
                    >
                        <Stack>
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
                }
            </Stack>
        );
    }

    public componentDidMount(): void {
        this.menuReceiver = this.cmdBarEvent.bind(this);
        this.menuReceiver = AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);
    }
    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.menuReceiver);
    }
    private cmdBarEvent(item: ICommandBarItemProps): Promise<void> {
        if (item['data-automation-id'] === 'newTeam') {
                const newRecord = RecordService.GetNewTeamModel();
                this.setState({ draftTeam: newRecord, showPane: true });
        }
        return Promise.resolve();
    }

    private showPane(model: TeamModel): void { this.setState({ showPane: true, draftTeam: model }); }
    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftTeam: null });
        } else {
            this.saveTeam();
        }
    }

    private saveTeam(): void {
        const teams = AppService.AppSettings.teams
        .filter(f => f.teamId !== this.state.draftTeam.teamId)
        .concat([this.state.draftTeam])
        .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));

        AppService.UpdateAppSetting({ teams: teams })
        .then(newSettings => {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftTeam: null });
        })
        .catch(e => Promise.reject(e));
    }

    private updateTeamField(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;

        const newTeam = Object.assign(new TeamModel(), this.state.draftTeam);
        newTeam[fieldRef] = fieldVal;
        this.setState({ draftTeam: newTeam });
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftTeam.name} [{this.state.draftTeam.active ? 'Active' : 'InActive'}]
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveTeam.bind(this)}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                        <FormInputToggle
                            labelValue={'Active Team'}
                            fieldValue={this.state.draftTeam.active}
                            fieldRef={'active'}
                            onUpdated={this.updateTeamField.bind(this)}
                            oneRow={true}
                        />
                    </Stack>
                </Stack>
            </div>
        );
    }
}
