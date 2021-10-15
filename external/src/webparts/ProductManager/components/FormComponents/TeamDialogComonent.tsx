import * as React from 'react';
import { DefaultButton, Dropdown, IconButton, IDropdownOption, Label, Stack, Dialog, DialogContent, DialogType, DialogFooter, TextField } from '@fluentui/react';

import { v4 as uuidv4 } from 'uuid';
import { TeamModel } from '../../../../models/TeamModel';
import { FormInputText } from './FormInputText';

export interface ITeamDialogProps {
    teamSelectedCallback: (teamId: string, eText: string) => void;
    teams: Array<TeamModel>;
    selectedTeam?: string;
    showInputText?: boolean;
    extraText?: string;
    extraTextLabel?: string;
}

export const TeamDialog: React.FunctionComponent<ITeamDialogProps> = (props) => {
    const [team, setTeam] = React.useState(props.selectedTeam || '');
    const [extraText, setExtraText] = React.useState(props.extraText || '');

    const okClicked = React.useCallback((): void => { props.teamSelectedCallback(team, extraText); }, [team, extraText]);

    const cancelClicked = React.useCallback((): void => { props.teamSelectedCallback(null, null); }, []);

    const dropdownOptions: Array<IDropdownOption> = props.teams
        .map(d => { return { key: d.teamId, text: d.name }; })
        .sort((a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0));

    return (
        <>
            <Dialog
                hidden={false}
                modalProps={{ isBlocking: true, isOpen: true }}
                dialogContentProps={{ type: DialogType.normal, title: 'Team Selector' }}
                styles={{ main: { width: '400px' } }}
            >
                <DialogContent>
                    <Dropdown
                        options={dropdownOptions}
                        defaultSelectedKey={team}
                        onChange={(e, o, i) => setTeam(o.key.toString())}
                        label={'Select a team'}
                    />
                    { props.extraTextLabel && <Label>{props.extraTextLabel}</Label> }
                    { props.showInputText &&
                        <TextField
                            value={extraText}
                            onChange={(e: any, newVal: any) => setExtraText(newVal)}
                            styles={{ root: { width: '100%' } }}                        
                        />
                    }
                </DialogContent>
                <DialogFooter>
                    <Stack horizontal styles={{ root: { width: '100%' } }} tokens={{ childrenGap: 20 }}>
                        <Stack.Item grow><DefaultButton onClick={okClicked} text={'Ok'} /></Stack.Item>
                        <Stack.Item grow><DefaultButton onClick={cancelClicked} text={'Cancel'} /></Stack.Item>
                    </Stack>
                </DialogFooter>
            </Dialog>
        </>
    );
};