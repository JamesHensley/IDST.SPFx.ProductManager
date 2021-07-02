import * as React from 'react';

import { Label, TextField, Text, Toggle } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

export interface IFormInputToggleProps {
    labelValue: string;
    fieldRef: string;
    fieldValue: boolean;
    onUpdated: (newVal: boolean, fieldRef: string) => void;
}

export class FormInputToggle extends React.Component<IFormInputToggleProps, {}> {
    render(): React.ReactElement<IFormInputToggleProps> {
        return (
            <>
                <Toggle
                    label={'Member Active'}
                    checked={this.props.fieldValue}
                    onChange={this.fieldUpdated.bind(this)}
                />
            </>
        );
    }
    private fieldUpdated(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
