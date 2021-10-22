import * as React from 'react';
import { Label, Text, Dropdown, IDropdownOption, IDropdown, IDropdownProps } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService from '../../../../services/AppService';

export interface KeyValPair {
    key: string;
    value: any;
    longValue?: any;
    selected: boolean;
}

export class IFormInputDropDownProps {
    labelValue: string;
    fieldValue: Array<string>;
    fieldRef: string;
    editing: boolean;
    options: Array<KeyValPair>;
    allowNull: boolean;
    onUpdated: (newVal: any, fieldRef: string) => void;
    toolTip?: string;
    disabledKeys: Array<string>;
    allowMultiple?: boolean;
}

export class FormInputDropDown extends React.Component<IFormInputDropDownProps, {}> {
    private inputRef: IDropdown;
    // private inputRef: React.FunctionComponent<IDropdownProps>;
    private givenOptions: Array<IDropdownOption>;
    private options: Array<IDropdownOption>;

    constructor(props: IFormInputDropDownProps) {
        super(props);
        this.givenOptions = this.props.options.map(d => {
            return {
                key: d.key,
                text: d.value,
                title: d.longValue,
                selected: d.selected,
                disabled: this.props.disabledKeys.indexOf(d.key) >= 0
            } as IDropdownOption;
        }).sort((a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0));

        this.options = this.props.allowNull && !this.props.allowMultiple ? [{
            key: null,
            text: 'None',
            selected: this.givenOptions.filter(f => f.selected).length ? false : true,
            disabled: false
        } as IDropdownOption].concat(this.givenOptions) : this.givenOptions;
    }

    render(): React.ReactElement<IFormInputDropDownProps> {
        return(
            <div className={`${styles.padTop2} ${styles.fieldValue}`}
                style={{ width: '100%' }}
                title={this.props.toolTip ? this.props.toolTip : ''}
            >
                <Label>{this.props.labelValue}</Label>
                {!this.props.editing &&
                    <Text>{this.options.filter(f => f.selected).map(d => d.text).join(', ') || 'None'}</Text>
                }
                {this.props.editing && this.props.allowMultiple &&
                    <Dropdown
                        styles={{ root: { width: '100%' } }}
                        multiSelect={true}
                        options={this.options}
                        // defaultSelectedKeys={(this.props.fieldValue as Array<string>)}
                        onChange={this.fieldUpdatedMulti.bind(this)}
                        componentRef={(input) => this.inputRef = input}
                    />
                }
                {this.props.editing && !this.props.allowMultiple &&
                    <Dropdown
                        styles={{ root: { width: '100%' } }}
                        multiSelect={false}
                        options={this.options}
                        // defaultSelectedKey={this.props.fieldValue ? this.props.fieldValue[0] : null}
                        onChange={this.fieldUpdatedSingle.bind(this)}
                        componentRef={(input) => this.inputRef = input}
                    />
                }
            </div>
        );
    }

    private fieldUpdatedMulti(ev: Event, newVal: IDropdownOption): void {
        this.options = this.options.map(d => d.key === newVal.key ? newVal : d).filter(f => f.key);
        const selKeys = this.options.filter(f => f.selected).map(d => d.key);
        this.props.onUpdated(selKeys.length > 0 ? selKeys : null, this.props.fieldRef);
    }

    private fieldUpdatedSingle(ev: Event, newVal: IDropdownOption): void {
        console.log(this.inputRef);
        this.options = this.options.map(d => d.key === newVal.key ? newVal : d);
        // const selKey = this.options.reduce((t, n) => n.key === newVal.key && newVal.key ? [newVal.key] : t, null);
        const selKey = newVal.key ? [newVal.key] : null;
        this.props.onUpdated(selKey, this.props.fieldRef);
    }

    private xfieldUpdatedSingle(ev: Event, newVal: KeyValPair): void {
        this.props.onUpdated(newVal.key, this.props.fieldRef);
    }
}
