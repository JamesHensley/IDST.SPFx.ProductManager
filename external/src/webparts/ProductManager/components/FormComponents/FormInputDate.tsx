import * as React from 'react';

import { Label, Stack, TextField, Text } from '@fluentui/react';

import * as styles from '../ProductManager.module.scss';
import { CalendarButton } from './CalendarButton';
import { format } from 'date-fns';

import { IFormInputProps } from './IFormInputProps';

export interface IFormInputDateState {
    calendarVisible: boolean;
    draftValue: string;
}

export class FormInputDate extends React.Component<IFormInputProps, IFormInputDateState> {
    private buttonRef: any;
    private dateFormatStr = `dd-LLL-yyyy`;

    constructor(props: IFormInputProps) {
        super(props);
        this.buttonRef = React.createRef();
        this.state = { calendarVisible: false, draftValue: this.props.fieldValue }
    }

    private formatDate(dateStr: string): string {
        return format(new Date(dateStr), this.dateFormatStr);
    }
    
    render(): React.ReactElement<IFormInputProps> {
        return(
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol11} ${styles.fieldValue}`}>
                    <Stack horizontal>
                        <Label>
                            {this.props.labelValue}
                        </Label>
                        {this.props.editing &&
                            <CalendarButton
                                dateVal={this.props.fieldValue}
                                dateChangeCallback={this.updateValueFromCalendar.bind(this)}
                            />}
                    </Stack>
                    {!this.props.editing && (
                        <Text>{this.formatDate(this.props.fieldValue)}</Text>
                    )}
                    {this.props.editing && (
                        <TextField value={this.formatDate(this.props.fieldValue)}/>
                    )}
                </div>
            </div>
        );
    }

    private updateValueFromCalendar(dateVal: any): void {
        this.props.onUpdated(dateVal, this.props.fieldRef);
    }
}
