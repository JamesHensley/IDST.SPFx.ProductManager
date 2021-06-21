import * as React from 'react';

import { IconButton, Callout, DirectionalHint, FocusTrapZone, Calendar } from '@fluentui/react';

import { useBoolean } from '@fluentui/react-hooks';

import * as styles from '../ProductManager.module.scss';
import { startOfDay } from 'date-fns';

export interface ICalendarButtonProps {
    dateVal: string;
    dateChangeCallback: (dateVal: string) => {};
}

export const CalendarButton: React.FunctionComponent<ICalendarButtonProps> = (props) => {
    const [showCalendar, { toggle: toggleShowCalendar, setFalse: hideCalendar }] = useBoolean(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const onSelectDate = React.useCallback(
      (date: Date, dateRangeArray: Date[]): void => {
        hideCalendar();
        props.dateChangeCallback(startOfDay(date).toJSON());
      },
      [hideCalendar]
    );

    return (
      <div style={{ width: '100%' }} ref={buttonContainerRef}>
          <IconButton iconProps={{ iconName: 'calendar' }} className={styles.appIcon} title='' ariaLabel='' onClick={toggleShowCalendar} />
          { showCalendar &&
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
        }
      </div>
    );
};
