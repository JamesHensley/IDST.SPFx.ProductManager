import * as React from 'react';

import { Label, TextField, Text } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps } from './IFormInputProps';

export class FormInputText extends React.Component<IFormInputProps, {}> {

    render(): React.ReactElement<IFormInputProps> {
        return(
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol11} ${styles.fieldValue}`}>
                    <Label>{this.props.labelValue}</Label>
                    {!this.props.editing && (
                        <Text>{this.props.fieldValue}</Text>
                    )}
                    {this.props.editing && (
                        <TextField
                            value={this.props.fieldValue}
                            multiline={this.props.editLines ? true : false}
                            rows={this.props.editLines ? this.props.editLines : 1}
                            onChange={this.fieldUpdated.bind(this)}
                        />
                    )}
                </div>
            </div>
        );
    }

    private fieldUpdated(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
