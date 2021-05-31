import * as React from 'react';

import { Label, Stack, TextField, Text } from '@fluentui/react';

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
        this.state = { calendarVisible: false, draftValue: this.props.fieldValue }
    }

    render(): React.ReactElement<IFormInputProps> {
        //<div className={`${styles.gridRow} ${styles.padTop2}`}>
        //<div className={`${styles.gridCol11} ${styles.fieldValue}`}>
        return(
            <div className={`${styles.padTop2}`}>
                <div className={`${styles.fieldValue}`}>
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
                        <Text>{format(new Date(this.props.fieldValue), AppService.DateFormatView)}</Text>
                    )}
                    {this.props.editing && (
                        <TextField value={format(new Date(this.props.fieldValue), AppService.DateFormatView)} readOnly />
                    )}
                </div>
            </div>
        );
    }

    private updateValueFromCalendar(dateVal: any): void {
        this.props.onUpdated(dateVal, this.props.fieldRef);
    }
}
