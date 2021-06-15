import * as React from 'react';

import { Label, Text, ComboBox, IComboBoxOption, TextField, IComboBox } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps } from './IFormInputProps';
import { RecordService } from '../../../../services/RecordService';

export interface IFormInputState {
    lastUpdate: number;
    draftValue: string;
}

export class FormInputComboBox extends React.Component<IFormInputProps, IFormInputState> {
    private comboOptions: Array<IComboBoxOption>;

    constructor(props: IFormInputProps) {
        super(props);
        this.state = { lastUpdate: new Date().getTime(), draftValue: this.props.fieldValue };
    }

    render(): React.ReactElement<IFormInputProps> {
        return (
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol12} ${styles.fieldValue}`}>
                    <Label>{this.props.labelValue}</Label>
                    {!this.props.editing && (
                        <Text>{this.props.fieldValue}</Text>
                    )}
                    {this.props.editing &&
                        <ComboBox
                            key={new Date().getTime()}
                            selectedKey={this.state.draftValue}
                            onChange={this.fieldUpdated.bind(this)}
                            options={this.comboOptions}
                            allowFreeform={true}
                        />
                    }
                    {false &&
                        <TextField
                            value={this.state.draftValue}
                        />
                    }
                </div>
            </div>
        );
    }

    componentDidMount(): void {
        RecordService.GetUniqueValsForListField(this.props.fieldRef)
        .then(data => data.map(d => { return { key: d, text: d } as IComboBoxOption }))
        .then(data => {
            this.comboOptions = data;
            this.setState({ lastUpdate: new Date().getTime() });
        });
    }

    private fieldUpdated(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void {
        //console.log('ComboUpdate: ', event, option, index, value);
        if (!option && value) {
            console.log('Adding value to options list', value);
            this.comboOptions = [].concat.apply(this.comboOptions, [{ key: value, text: value } as IComboBoxOption])
                .sort((a: IComboBoxOption, b: IComboBoxOption) => a.key > b.key ? 1 : (a.key < b.key ? -1 : 0))
                .filter((f, i, e) => e.indexOf(f) === i);
            console.log('Setting new value', value);
            this.setState({ draftValue: value });
            this.props.onUpdated(value, this.props.fieldRef);
        }
        if (option) {
            console.log('Setting previous menu value: ', option.text);
            this.setState({ draftValue: option.text });
            this.props.onUpdated(option.text, this.props.fieldRef);
        }
    }
}
