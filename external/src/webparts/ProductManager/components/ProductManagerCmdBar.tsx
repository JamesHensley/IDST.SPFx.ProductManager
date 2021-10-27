import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import AppService from '../../../services/AppService';
// import { CommandBar, ICommandBarItemProps, IContextualMenuItem, IIconOptions, initializeIcons } from '@fluentui/react';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { CommandBar, ICommandBarItemProps, IContextualMenuItem, IIconOptions, initializeIcons } from 'office-ui-fabric-react';

export interface IProductManagerCmdBarProps {
    appView: string;
}
export interface IProductManagerCmdBarState { }

export default class ProductManagerCmdBar extends React.Component <IProductManagerCmdBarProps, IProductManagerCmdBarState> {
    private get getNewMenuItems(): Array<IContextualMenuItem> {
        return AppService.AppSettings.productTypes
        .filter(f => f.active)
        .map(d => {
            return {
                key: d.typeId,
                text: d.typeName,
                iconProps: { iconName: 'Questionnaire' },
                ['data-automation-id']: 'newProduct',
                onClick: this.itemClicked.bind(this),
                data: { id: d.typeId, name: d.typeName },
                className: this.props.appView !== 'ProductList' ? styles.hidden : ''
            } as IContextualMenuItem;
        }).concat([
            {
                key: 'newTeam',
                text: 'Team',
                iconProps: { iconName: 'AddGroup' },
                ['data-automation-id']: 'newTeam',
                onClick: this.itemClicked.bind(this),
                className: this.props.appView !== 'ConfigView' ? styles.hidden : ''
            } as IContextualMenuItem,
            {
                key: 'newTemplateDocument',
                text: 'Template Document',
                iconProps: { iconName: 'AddToShoppingList' },
                ['data-automation-id']: 'newTemplateDocument',
                onClick: this.itemClicked.bind(this),
                className: this.props.appView !== 'ConfigView' ? styles.hidden : ''
            } as IContextualMenuItem,
            {
                key: 'newProductType',
                text: 'Product Type',
                iconProps: { iconName: 'PageAdd' },
                ['data-automation-id']: 'newProductType',
                onClick: this.itemClicked.bind(this),
                className: this.props.appView !== 'ConfigView' ? styles.hidden : ''
            } as IContextualMenuItem,
            {
                key: 'newEventType',
                text: 'Event Type',
                iconProps: { iconName: 'Quantity' },
                ['data-automation-id']: 'newEventType',
                onClick: this.itemClicked.bind(this),
                className: this.props.appView !== 'ConfigView' ? styles.hidden : ''
            } as IContextualMenuItem,
            {
                key: 'newCategoryModel',
                text: 'Category',
                iconProps: { iconName: 'GroupedList' },
                ['data-automation-id']: 'newCategoryModel',
                onClick: this.itemClicked.bind(this),
                className: this.props.appView !== 'ConfigView' ? styles.hidden : ''
            } as IContextualMenuItem,
            {
                key: 'newClassificationModel',
                text: 'Classification model',
                iconProps: { iconName: 'Admin' },
                ['data-automation-id']: 'newClassificationModel',
                onClick: this.itemClicked.bind(this),
                className: this.props.appView !== 'ConfigView' ? styles.hidden : ''
            } as IContextualMenuItem
        ]);
    }

    constructor(props: IProductManagerCmdBarProps) {
        super(props);
        initializeIcons(`${AppService.AppSettings.miscSettings.fluentUiCDN}/icons`, { disableWarnings: true } as IIconOptions);
        initializeFileTypeIcons(`${AppService.AppSettings.miscSettings.fluentUiCDN}/item-types/`, { disableWarnings: true } as IIconOptions);
      }

    public render(): React.ReactElement<IProductManagerCmdBarProps> {
        return (
            <CommandBar
                key={new Date().getTime()}
                items={[
                    {
                        key: 'newItems',
                        text: 'New',
                        cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
                        iconProps: { iconName: 'Add' },
                        disabled: this.getNewMenuItems.length === 0,
                        subMenuProps: { items: this.getNewMenuItems }
                    },
                    {
                        key: 'views',
                        text: 'Views',
                        cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
                        subMenuProps: {
                            items: [
                                {
                                    key: 'list',
                                    text: 'Product List',
                                    iconProps: { iconName: 'TimelineMatrixView' },
                                    ['data-automation-id']: 'viewList',
                                    onClick: this.itemClicked.bind(this)
                                },
                                {
                                    key: 'rollup',
                                    text: 'Rollup',
                                    iconProps: { iconName: 'PollResults' },
                                    ['data-automation-id']: 'viewRollup',
                                    onClick: this.itemClicked.bind(this)
                                },
                                {
                                    key: 'teamView',
                                    text: 'Team Views',
                                    disabled: true,
                                    iconProps: { iconName: 'WorkforceManagement' },
                                    subMenuProps: {
                                        items: AppService.AppSettings.teams
                                        .filter(f => f.active)
                                        .map(d => {
                                            return {
                                                key: d.teamId,
                                                text: d.name,
                                                iconProps: { iconName: 'Family' },
                                                ['data-automation-id']: 'teamView',
                                                onClick: this.itemClicked.bind(this),
                                                data: { id: d.teamId, name: d.name }
                                            } as IContextualMenuItem;
                                        })
                                    }
                                },
                                {
                                    key: 'configView',
                                    text: 'Configuration',
                                    iconProps: { iconName: 'Settings' },
                                    ['data-automation-id']: 'configView',
                                    onClick: this.itemClicked.bind(this)
                                }
                            ]
                        }
                    }
                ]}
            />
        );
    }

    private itemClicked(ev: any, item: ICommandBarItemProps): void {
        AppService.MenuItemClicked(item);
    }
}
