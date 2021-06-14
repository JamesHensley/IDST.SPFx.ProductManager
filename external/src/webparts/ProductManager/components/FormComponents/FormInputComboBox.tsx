import * as React from 'react';

import { Label, Text, ComboBox, IComboBoxOption, TextField } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps } from './IFormInputProps';
import { RecordService } from '../../../../services/RecordService';

export interface IFormInputState {
    options: Array<IComboBoxOption>;
}

export class FormInputComboBox extends React.Component<IFormInputProps, IFormInputState> {
    constructor(props: IFormInputProps) {
        super(props);
        this.state = { options: [] };
    }

    render(): React.ReactElement<IFormInputProps> {
        return (
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol12} ${styles.fieldValue}`}>
                    <Label>{this.props.labelValue}</Label>
                    {!this.props.editing && (
                        <Text>{this.props.fieldValue}</Text>
                    )}
                    {false && (
                        <ComboBox
                            defaultValue={this.props.fieldValue}
                            onChange={this.fieldUpdated.bind(this)}
                            options={this.state.options}
                        />
                    )}
                    {this.props.editing && 
                        <TextField
                            value={this.props.fieldValue}
                            multiline={this.props.editLines ? true : false}
                            rows={this.props.editLines ? this.props.editLines : 1}
                            onChange={this.fieldUpdated.bind(this)}
                        />
                    }
                </div>
            </div>
        );
    }

    componentDidMount(): void {
        /*
        RecordService.GetUniqueValsForListField(this.props.fieldRef)
        .then(data => data.map(d => { return { key: d, text: d } as IComboBoxOption }))
        .then(data => this.setState({ options: data }));
        */
    }

    private fieldUpdated(e: any, newVal: any): void {
        this.props.onUpdated(newVal, this.props.fieldRef);
    }
}
