import * as React from 'react';

import { Label, Stack, TextField, Text, IStackItemStyles } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';
import { CalendarButton } from './CalendarButton';
import { format, isValid } from 'date-fns';

import { IFormInputProps } from './IFormInputProps';
import AppService from '../../../../services/AppService';

export interface IFormInputDateState {
    calendarVisible: boolean;
    draftValue: string;
}

export class FormInputDate extends React.Component<IFormInputProps, IFormInputDateState> {
    private inputRef: any;

    constructor(props: IFormInputProps) {
        super(props);
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
                                    dateVal={this.state.draftValue}
                                    dateChangeCallback={this.updateValueFromCalendar.bind(this)}
                                />
                            }
                        </Stack.Item>
                    </Stack>
                    {!this.props.editing &&
                        <Text>{format(new Date(this.state.draftValue), AppService.DateFormatView)}</Text>
                    }
                    {this.props.editing &&
                        <TextField
                            defaultValue={format(new Date(this.state.draftValue), AppService.DateFormatView)}
                            onGetErrorMessage={this.validateDate.bind(this)}
                            validateOnFocusOut
                            componentRef={(input) => this.inputRef = input}
                            onNotifyValidationResult={this.afterValidation.bind(this)}
                        />
                    }
                </Stack>
            </div>
        );
    }

    private validateDate(val: string): string {
        return (val.match(/\d{1,2}.[A-Za-z]{3,4}.\d{4}/) && isValid(new Date(val))) ? '' : `Date should be similar to "01 Jan 2021"`;
    }

    /** We use this to format the valid date value */
    private afterValidation(val: string): void {
        if (val === '' && this.inputRef) {
            this.inputRef.setState({ uncontrolledValue: format(new Date(this.inputRef.value), 'dd-MMM-yyyy') });
        }
    }

    private updateValueFromCalendar(dateVal: any): void {
        this.props.onUpdated(dateVal, this.props.fieldRef);
    }
}
