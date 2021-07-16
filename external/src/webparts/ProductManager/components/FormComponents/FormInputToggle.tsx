import * as React from 'react';
import { Label, Toggle, Stack } from '@fluentui/react';

export interface IFormInputToggleProps {
    labelValue: string;
    fieldRef: string;
    fieldValue: boolean;
    oneRow: boolean;
    onUpdated: (newVal: boolean, fieldRef: string) => void;
}

export class FormInputToggle extends React.Component<IFormInputToggleProps, {}> {
    render(): React.ReactElement<IFormInputToggleProps> {
        const oneRow = <Stack horizontal tokens={{ childrenGap: 10 }}><Label>{this.props.labelValue}</Label><Toggle checked={this.props.fieldValue} onChange={this.fieldUpdated.bind(this)}/></Stack>;
        const twoRow = <Toggle label={this.props.labelValue} checked={this.props.fieldValue} onChange={this.fieldUpdated.bind(this)} />;

        return (
            <>{this.props.oneRow ? oneRow : twoRow}</>
        );
    }
    private fieldUpdated(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
