import * as React from 'react';

import { IconButton, Callout, DirectionalHint, FocusTrapZone, Calendar } from '@fluentui/react';

import { useBoolean } from '@fluentui/react-hooks';

import * as styles from '../ProductManager.module.scss';

export interface ICalendarButtonProps {
    dateVal: string;
    dateChangeCallback: (dateVal: string) => {};
}

export const CalendarButton: React.FunctionComponent<ICalendarButtonProps> = (props) => {
    //const [selectedDate, setSelectedDate] = React.useState<Date>();
    const [showCalendar, { toggle: toggleShowCalendar, setFalse: hideCalendar }] = useBoolean(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const onSelectDate = React.useCallback(
      (date: Date, dateRangeArray: Date[]): void => {
        hideCalendar();
        props.dateChangeCallback(date.toJSON());
      },
      [hideCalendar]
    );

    return (
      <div>
        <div ref={buttonContainerRef}>
            <IconButton iconProps={{ iconName: 'calendar' }} className={styles.appIcon} title='' ariaLabel='' onClick={toggleShowCalendar} />
        </div>

        {showCalendar && (
          <Callout
            isBeakVisible={false}
            gapSpace={0}
            doNotLayer={false}
            target={buttonContainerRef}
            directionalHint={DirectionalHint.bottomLeftEdge}
            onDismiss={hideCalendar}
            setInitialFocus
          >
            <FocusTrapZone isClickableOutsideFocusTrap>
              <Calendar
                onSelectDate={onSelectDate}
                onDismiss={hideCalendar}
                isMonthPickerVisible={false}
                value={props.dateVal ? new Date(props.dateVal) : new Date()}
                highlightCurrentMonth
                isDayPickerVisible
                showGoToToday
              />
            </FocusTrapZone>
          </Callout>
        )}
      </div>
    );
};
