import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { Label, Stack, TextField, Text, IStackItemStyles } from '@fluentui/react';

import { IFormInputProps } from './IFormInputProps';
import { ColorSelectorButton } from './ColorSelectorButton';

export interface IFormInputColorState {
    palletteVisible: boolean;
    draftValue: string;
}

export class FormInputColor extends React.Component<IFormInputProps, IFormInputColorState> {
    private buttonRef: any;

    constructor(props: IFormInputProps) {
        super(props);
        this.buttonRef = React.createRef();
        this.state = { palletteVisible: false, draftValue: this.props.fieldValue };
    }

    render(): React.ReactElement<IFormInputProps> {
        const stackItemStyles: IStackItemStyles = { root: { display: 'flex' } };

        return(
            <div className={`${styles.padTop2} ${styles.fieldValue}`} style={{ width: '100%' }}>
                <Stack>
                    <Stack.Item styles={stackItemStyles}>
                        <Label>{this.props.labelValue}</Label>
                    </Stack.Item>
                    <Stack.Item styles={stackItemStyles}>
                        {this.props.editing &&
                            <ColorSelectorButton
                                color={this.state.draftValue}
                                colorChangeCallback={this.updateValueFromPallete.bind(this)}
                            />
                        }
                    </Stack.Item>
                </Stack>
            </div>
        );
    }

    private updateValueFromPallete(colorVal: any): void {
        this.props.onUpdated(colorVal, this.props.fieldRef);
    }
}
