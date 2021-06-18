import * as React from 'react';

import { Label, Stack, TextField, Text, IStackItemStyles } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';
import { CalendarButton } from './CalendarButton';
import { format } from 'date-fns';

import { IFormInputProps } from './IFormInputProps';
import AppService from '../../../../services/AppService';

export interface IFormInputDateState {
    calendarVisible: boolean;
    draftValue: string;
}

export class FormInputDate extends React.Component<IFormInputProps, IFormInputDateState> {
    private buttonRef: any;

    constructor(props: IFormInputProps) {
        super(props);
        this.buttonRef = React.createRef();
        this.state = { calendarVisible: false, draftValue: this.props.fieldValue };
    }

    render(): React.ReactElement<IFormInputProps> {
        const stackItemStyles: IStackItemStyles = { root: { display: 'flex' } };
        return(
            <div className={`${styles.padTop2} ${styles.fieldValue}`} style={{ width: '100%' }}>
                <Stack>
                    <Stack horizontal>
                        <Stack.Item styles={stackItemStyles}>
                            <Label>{this.props.labelValue}</Label>
                        </Stack.Item>
                        <Stack.Item styles={stackItemStyles}>
                            {this.props.editing &&
                                <CalendarButton
                                    dateVal={this.props.fieldValue}
                                    dateChangeCallback={this.updateValueFromCalendar.bind(this)}
                                />
                            }
                        </Stack.Item>
                    </Stack>
                    {!this.props.editing &&
                        <Text>{format(new Date(this.props.fieldValue), AppService.DateFormatView)}</Text>
                    }
                    {this.props.editing &&
                        <TextField value={format(new Date(this.props.fieldValue), AppService.DateFormatView)} disabled />
                    }
                </Stack>
            </div>
        );
    }

    private updateValueFromCalendar(dateVal: any): void {
        this.props.onUpdated(dateVal, this.props.fieldRef);
    }
}
