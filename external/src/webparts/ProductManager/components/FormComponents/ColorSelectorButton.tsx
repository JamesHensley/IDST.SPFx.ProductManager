import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { IconButton, Callout, DirectionalHint, FocusTrapZone, Calendar, ColorPicker, IColor, DefaultButton, getColorFromString, Separator, Stack } from '@fluentui/react';

import { useBoolean } from '@fluentui/react-hooks';

export interface IColorSelectorButtonProps {
    color: string;
    colorChangeCallback: (color: string) => {};
}

export const ColorSelectorButton: React.FunctionComponent<IColorSelectorButtonProps> = (props) => {
    let currColor: IColor = getColorFromString(props.color);

    const [showColorControl, { toggle: toggleShowControl, setFalse: hideControl }] = useBoolean(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const updateColor = React.useCallback(
      (ev, color: IColor): void => {
        currColor = color;
      },
      [currColor]
    );

    const saveColor = React.useCallback(
        (): void => {
            hideControl();
            props.colorChangeCallback(`rgba(${currColor.r},${currColor.g},${currColor.b},${currColor.a / 100})`);
        },
        [currColor]
    )

    return (
      <div style={{ width: '100%' }} ref={buttonContainerRef}>
          <IconButton iconProps={{ iconName: 'Color' }} className={styles.appIcon} title='' ariaLabel='' onClick={toggleShowControl} />
          { showColorControl &&
            <Callout
              isBeakVisible={false}
              gapSpace={0}
              doNotLayer={false}
              target={buttonContainerRef}
              directionalHint={DirectionalHint.bottomLeftEdge}
              onDismiss={hideControl}
              setInitialFocus
            >
            <FocusTrapZone isClickableOutsideFocusTrap>
                <ColorPicker
                    color={props.color}
                    onChange={updateColor}
                    showPreview={true}
                />
                <Separator />
                <Stack horizontal>
                    <DefaultButton onClick={saveColor}>Save</DefaultButton>
                    <DefaultButton onClick={hideControl}>Cancel</DefaultButton>
                </Stack>
            </FocusTrapZone>
          </Callout>
        }
      </div>
    );
};
