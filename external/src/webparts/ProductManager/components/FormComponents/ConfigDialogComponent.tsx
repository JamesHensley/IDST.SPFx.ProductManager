import * as React from 'react';
import { DefaultButton, Dropdown, IconButton, IDropdownOption, Label, Stack, Dialog, DialogContent, DialogType, DialogFooter, TextField } from '@fluentui/react';

export interface IConfigDialogProps {
    optSelectedCallback: (optId: string, eText: string) => void;
    title: string;
    dropdownLabel?: string;
    opts: Array<IDropdownOption>;
    selectedOpt?: string;
    showInputText?: boolean;
    extraText?: string;
    extraTextLabel?: string;
}

export const ConfigDialogComponent: React.FunctionComponent<IConfigDialogProps> = (props) => {
    const [opt, setOpt] = React.useState(props.selectedOpt || '');
    const [extraText, setExtraText] = React.useState(props.extraText || '');

    const okClicked = React.useCallback((): void => { props.optSelectedCallback(opt, extraText); }, [opt, extraText]);
    const cancelClicked = React.useCallback((): void => { props.optSelectedCallback(null, null); }, []);

    return (
        <>
            <Dialog
                hidden={false}
                modalProps={{ isBlocking: true, isOpen: true }}
                dialogContentProps={{ type: DialogType.normal, title: props.title }}
                styles={{ main: { width: '400px' } }}
            >
                <DialogContent>
                    <Dropdown
                        options={props.opts}
                        defaultSelectedKey={opt}
                        onChange={(e, o, i) => setOpt(o.key.toString())}
                        label={props.dropdownLabel ? props.dropdownLabel : ''}
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
