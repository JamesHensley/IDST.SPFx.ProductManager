import * as React from 'react';
import { Label, Text, Dropdown, IDropdownOption } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';

export interface KeyValPair {
    key: string;
    value: any;
    // data?: any;
    selected: boolean;
}

export class IFormInputDropDownProps {
    labelValue: string;
    fieldValue: string;
    fieldRef: string;
    editing: boolean;
    options: Array<KeyValPair>;
    allowNull: boolean;
    onUpdated: (newVal: string, fieldRef: string) => void;
    toolTip?: string;
    disabledKeys: Array<string>;
}

export class FormInputDropDown extends React.Component<IFormInputDropDownProps, {}> {
    render(): React.ReactElement<IFormInputDropDownProps> {
        const givenOptions = this.props.options.map(d => {
            return {
                key: d.key,
                text: d.value,
                selected: d.selected,
                disabled: this.props.disabledKeys.indexOf(d.key) >= 0
            } as IDropdownOption;
        }).sort((a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0));
        
        const options: Array<IDropdownOption> = this.props.allowNull ? [{ key: null, text: 'None' }].concat(givenOptions) : givenOptions;
        const nullOption = this.props.allowNull ? { key: null, text: 'None' } : { key: null, text: '' };
        const selectedKVP = options.reduce((t,n) => n.selected ? n : t, nullOption);

        return(
            <div className={`${styles.padTop2} ${styles.fieldValue}`}
                style={{ width: '100%' }}
                title={this.props.toolTip ? this.props.toolTip : ''}
            >
                <Label>{this.props.labelValue}</Label>
                {!this.props.editing &&
                    <Text>{selectedKVP.text}</Text>
                }
                {this.props.editing &&
                    <Dropdown
                        styles={{ root: { width: '100%' } }}
                        multiSelect={false}
                        options={options}
                        // defaultSelectedKey={selectedKVP.key}
                        onChange={this.fieldUpdated.bind(this)}
                    />
                }
            </div>
        );
    }

    private fieldUpdated(ev: Event, newVal: KeyValPair): void {
        this.props.onUpdated(newVal.key, this.props.fieldRef);
    }
}
