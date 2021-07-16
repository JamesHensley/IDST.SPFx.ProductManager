import * as React from 'react';

import AppService from '../../../services/AppService';
import RecordService from '../../../services/RecordService';

import { CommandBar, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';
import { IAppSettings } from '../ProductManagerWebPart';
import { EventModel } from '../../../models/EventModel';
import { TeamModel } from '../../../models/TeamModel';

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
                        ['data-automation-id']: 'newTeamMember',
                        onClick: this.itemClicked.bind(this)
                    } as IContextualMenuItem
                ];
            case 'ConfigView':
                return [
                    {
                        key: 'newTeam',
                        text: 'Team',
                        iconProps: { iconName: 'AddGroup' },
                        ['data-automation-id']: 'newTeam',
                        onClick: this.newTeamClicked.bind(this)
                    } as IContextualMenuItem,
                    {
                        key: 'newEventType',
                        text: 'Event Type',
                        iconProps: { iconName: 'Quantity' },
                        ['data-automation-id']: 'newEventType',
                        onClick: this.newEventTypeClicked.bind(this)
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

    private newTeamClicked(): Promise<IAppSettings> {
        const newTeam = RecordService.GetNewTeamModel();
        const teams: Array<TeamModel> = [].concat.apply(AppService.AppSettings.teams, [newTeam])
        .sort((a, b) => a.name > b.name ? 1 : (a.name < b.name ? -1 : 0));
        return AppService.UpdateAppSetting({ teams: teams }).then(d => Promise.resolve(d));
    }

    private newEventTypeClicked(): Promise<IAppSettings> {
        const newEvent = RecordService.GetNewEventTypeModel();
        const eventTypes: Array<EventModel> = [].concat.apply(AppService.AppSettings.eventTypes, [newEvent])
        .sort((a, b) => a.eventTitle > b.eventTitle ? 1 : (a.eventTitle < b.eventTitle ? -1 : 0));
        return AppService.UpdateAppSetting({ eventTypes: eventTypes }).then(d => Promise.resolve(d));
    }
}
