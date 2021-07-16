import * as React from 'react';

import { Dialog, DialogType, DialogFooter, DialogContent } from '@fluentui/react/lib/Dialog';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react';

export interface IFormInputDialogProps {
    titleStr: string;
    defaultValue: string;
    editMode: boolean;
    saveCallBack: (returnStr: string) => void;
    cancelCallBack: () => void;
}

export const FormInputDialog: React.FunctionComponent<IFormInputDialogProps> = (props) => {
    const [saveStr, setSaveStr] = React.useState(props.defaultValue.toString());
    const inputRef = React.useRef(null);

    const onSaveData = React.useCallback((): void => {
        props.saveCallBack(saveStr);
    }, [saveStr]);

    return (
        <Dialog
            hidden={false}
            onDismiss={props.cancelCallBack}
            dialogContentProps={{ type: DialogType.normal, title: props.titleStr }}
            modalProps={{ isBlocking: true }}
        >
            <DialogContent>
                <TextField defaultValue={props.defaultValue} multiline={true} rows={5} componentRef={inputRef}
                    onChange={(e: any, val?: string) => { if (val) { setSaveStr(val); } }}
                />
            </DialogContent>
            <DialogFooter>
                <DefaultButton onClick={onSaveData}>Ok</DefaultButton>
                <DefaultButton onClick={props.cancelCallBack}>Cancel</DefaultButton>
            </DialogFooter>
        </Dialog>
    );
};
