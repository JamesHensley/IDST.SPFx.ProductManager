import * as React from 'react';

import { Label, Text, Dropdown, IDropdownOption } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';

import { IFormInputProps, KeyValPair } from './IFormInputProps';

export class FormInputDropDown extends React.Component<IFormInputProps, {}> {

    render(): React.ReactElement<IFormInputProps> {
        console.log('FormInputDropDown.render: ', this.props);
        const options = this.props.options.map(d => { return { key: d.key, text: d.value } as IDropdownOption; });
        const selectedKey = this.props.fieldValue;
        const dropdownStyles = { root: { width: '100%' } };
        return(
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol12} ${styles.fieldValue}`}>
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
                            styles={dropdownStyles}
                        />
                    )}
                </div>
            </div>
        );
    }

    private fieldUpdated(ev: Event, newVal: KeyValPair): void {
        this.props.onUpdated(newVal.key, this.props.fieldRef);
    }
}
