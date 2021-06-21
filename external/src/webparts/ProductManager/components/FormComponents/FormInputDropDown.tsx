import * as React from 'react';

import { Label, Text, Dropdown, IDropdownOption } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps, KeyValPair } from './IFormInputProps';

export class FormInputDropDown extends React.Component<IFormInputProps, {}> {

    render(): React.ReactElement<IFormInputProps> {
        const options = this.props.options.map(d => { return { key: d.key, text: d.value } as IDropdownOption; });
        const selectedKey = this.props.fieldValue;
        // const ctrlStyles = { root: { width: '100%' } };
        return(
            <div className={`${styles.padTop2} ${styles.fieldValue}`}
                style={{ width: '100%' }}
                title={this.props.toolTip ? this.props.toolTip : ''}
            >
                <Label>{this.props.labelValue}</Label>
                {!this.props.editing && (
                    <Text>{this.props.options.reduce((t,n) => n.key === this.props.fieldValue ? n.value : t, '')}</Text>
                )}
                {this.props.editing && (
                    <Dropdown
                        multiSelect={false}
                        options={options}
                        defaultSelectedKey={selectedKey}
                        onChange={this.fieldUpdated.bind(this)}
                    />
                )}
            </div>
        );
    }

    private fieldUpdated(ev: Event, newVal: KeyValPair): void {
        this.props.onUpdated(newVal.key, this.props.fieldRef);
    }
}
