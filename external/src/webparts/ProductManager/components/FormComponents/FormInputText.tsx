import * as React from 'react';

import { Label, TextField, Text } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps } from './IFormInputProps';

export class FormInputText extends React.Component<IFormInputProps, {}> {

    render(): React.ReactElement<IFormInputProps> {
        const ctrlStyles = { root: { width: '100%' } };
        return(
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
                        onChange={this.fieldUpdated.bind(this)}
                        styles={ctrlStyles}
                    />
                }
            </div>
        );
    }

    private fieldUpdated(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
