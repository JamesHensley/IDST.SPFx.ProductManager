import * as React from 'react';

import { Label, TextField, Text } from '@fluentui/react';
import { FieldUrlRenderer } from '@pnp/spfx-controls-react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps } from './IFormInputProps';

export class FormInputUrl extends React.Component<IFormInputProps, {}> {
    render(): React.ReactElement<IFormInputProps> {
        return(
            <div className={`${styles.padTop2} ${styles.fieldValue}`} style={{ width: '100%' }}>
                <Label>{this.props.labelValue}</Label>
                { !this.props.editing &&
                    <FieldUrlRenderer text={this.props.fieldValue} url={this.props.fieldValue} />
                }
                { this.props.editing &&
                    <TextField
                        value={this.props.fieldValue}
                        multiline={this.props.editLines ? true : false}
                        rows={this.props.editLines ? this.props.editLines : 1}
                        onChange={this.fieldUpdated.bind(this)}
                    />
                }
            </div>
        );
    }

    private fieldUpdated(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
