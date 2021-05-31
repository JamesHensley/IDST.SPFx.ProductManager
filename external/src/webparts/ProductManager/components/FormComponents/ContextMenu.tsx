import * as React from 'react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { IconButton } from '@fluentui/react';

export interface IContextMenuProps {
    menuItems: Array<IContextualMenuItem>
}

export const ContextMenu: React.FunctionComponent<IContextMenuProps> = (props) => {
    const linkRef = React.useRef(null);
    const [showContextualMenu, setShowContextualMenu] = React.useState(false);
    const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault(); // don't navigate
        setShowContextualMenu(true);
    }, []);
    const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);
    //<IconButton></IconButton>
    return (
        <div>
            <div ref={linkRef} onClick={onShowContextualMenu}>...</div>
            <ContextualMenu
                items={props.menuItems}
                hidden={!showContextualMenu}
                target={linkRef}
                onItemClick={onHideContextualMenu}
                onDismiss={onHideContextualMenu}
            />
        </div>
    );
};
