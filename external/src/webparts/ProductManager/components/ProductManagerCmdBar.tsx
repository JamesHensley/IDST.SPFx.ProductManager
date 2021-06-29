import * as React from 'react';

import AppService from '../../../services/AppService';
import { CommandBar, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';

export interface IProductManagerCmdBarProps {
    appView: string;
}
export interface IProductManagerCmdBarState { }

export default class ProductManagerCmdBar extends React.Component <IProductManagerCmdBarProps, IProductManagerCmdBarState> {
    private get getNewMenuItems(): Array<IContextualMenuItem> {
        switch (this.props.appView) {
            case 'ProductList':
                return AppService.AppSettings.productTypes.map(d => {
                    return {
                        key: d.typeId,
                        text: d.typeName,
                        iconProps: { iconName: 'Questionnaire' },
                        ['data-automation-id']: 'newProduct',
                        onClick: this.itemClicked.bind(this),
                        data: { id: d.typeId, name: d.typeName }
                    } as IContextualMenuItem;
                });
            case 'RollUp':
                return [];
            case 'TeamView':
                return [
                    {
                        key: 'newTeamMember',
                        text: 'Team Member',
                        iconProps: { iconName: 'AddFriend' },
                        ['data-automation-id']: 'newTeamMmeber',
                        onClick: this.itemClicked.bind(this)
                    } as IContextualMenuItem
                ];
        }
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
                                    iconProps: { iconName: 'WorkforceManagement' },
                                    subMenuProps: {
                                        items: AppService.AppSettings.teams.map(d => {
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
