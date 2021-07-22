import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { Label, Text, ComboBox, IComboBoxOption, TextField, IComboBox } from '@fluentui/react';

import { IFormInputProps } from './IFormInputProps';
import RecordService from '../../../../services/RecordService';

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
            <div className={`${styles.padTop2} ${styles.fieldValue}`} style={{ width: '100%' }}>
                <Label>{this.props.labelValue}</Label>
                { !this.props.editing &&
                    <Text>{this.props.fieldValue}</Text>
                }
                { this.props.editing &&
                    <ComboBox
                        key={new Date().getTime()}
                        selectedKey={this.state.draftValue}
                        onChange={this.fieldUpdated.bind(this)}
                        options={this.comboOptions}
                        allowFreeform={true}
                        styles={{ root: { width: '100%' } }}
                    />
                }
            </div>
        );
    }

    componentDidMount(): void {
        RecordService.GetUniqueValsForListField(this.props.fieldRef)
        .then(data => data.map(d => { return { key: d, text: d } as IComboBoxOption; }))
        .then(data => {
            this.comboOptions = data;
            this.setState({ lastUpdate: new Date().getTime() });
        })
        .catch(e => Promise.reject(e));
    }

    private fieldUpdated(event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void {
        if (!option && value) {
            this.comboOptions = [].concat.apply(this.comboOptions, [{ key: value, text: value } as IComboBoxOption])
                .sort((a: IComboBoxOption, b: IComboBoxOption) => a.key > b.key ? 1 : (a.key < b.key ? -1 : 0))
                .filter((f, i, e) => e.indexOf(f) === i);
            this.setState({ draftValue: value });
            this.props.onUpdated(value, this.props.fieldRef);
        }
        if (option) {
            this.setState({ draftValue: option.text });
            this.props.onUpdated(option.text, this.props.fieldRef);
        }
    }
}
