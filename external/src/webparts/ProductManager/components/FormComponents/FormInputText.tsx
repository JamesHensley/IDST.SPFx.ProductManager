import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { Label, TextField, Text } from '@fluentui/react';
import { IFormInputProps } from './IFormInputProps';

export interface IFormInputTextState { }

export class FormInputText extends React.Component<IFormInputProps, IFormInputTextState> {
    render(): React.ReactElement<IFormInputProps> {
        return (
            <div className={`${styles.padTop2} ${styles.fieldValue}`} style={{ width: '100%' }}>
                <Label>{this.props.labelValue}</Label>
                { !this.props.editing &&
                    <Text>{this.props.fieldValue}</Text>
                }
                { this.props.editing &&
                    <TextField
                        value={this.props.fieldValue}
                        multiline={this.props.editLines ? true : false}
                        rows={this.props.editLines ? this.props.editLines : 1}
                        onChange={this.updateField.bind(this)}
                        styles={{ root: { width: '100%' } }}
                        onGetErrorMessage={this.props.onGetErrorMessage}
                    />
                }
            </div>
        );
    }

    private updateField(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
