import * as React from 'react';

import { Dialog, DialogType, DialogFooter, DialogContent } from '@fluentui/react/lib/Dialog';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Label, TextField } from '@fluentui/react';

export interface IFormInputDialogProps {
    titleStr: string;
    defaultValue?: string;
    messageStr?:string;
    editMode: boolean;
    saveCallBack: (saveStr: string) => void;
    cancelCallBack: () => void;
}

export const FormInputDialog: React.FunctionComponent<IFormInputDialogProps> = (props) => {
    const [saveStr, setSaveStr] = React.useState(props.defaultValue ? props.defaultValue : '');

    const onSaveData = React.useCallback((): void => {
            props.saveCallBack(saveStr);
        }, []
    );    

    return (
        <Dialog
            hidden={false}
            onDismiss={props.cancelCallBack}
            dialogContentProps={{ type: DialogType.normal, title: props.titleStr }}
            modalProps={{ isBlocking: true }}
        >
            <DialogContent>
                {props.editMode && <TextField value={saveStr} multiline={true} rows={5} onChange={(e: any, val: string) => { setSaveStr(val); }} />}
                {!props.editMode && <Label>{props.messageStr || ''}</Label>}
            </DialogContent>
            <DialogFooter>
                <DefaultButton onClick={onSaveData}>Ok</DefaultButton>
                <DefaultButton onClick={props.cancelCallBack}>Cancel</DefaultButton>
            </DialogFooter>
        </Dialog>
    );
};
