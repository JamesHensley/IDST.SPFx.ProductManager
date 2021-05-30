import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import AppService from '../../../services/AppService';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react';

export interface IProductManagerCmdBarProps { }
export interface IProductManagerCmdBarState {}

export default class ProductManagerCmdBar extends React.Component <IProductManagerCmdBarProps, IProductManagerCmdBarState> {
    private get cmdBarItems(): Array<ICommandBarItemProps> {
        return [
            {
                key: 'newItems',
                text: 'New',
                cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
                iconProps: { iconName: 'Add' },
                subMenuProps: {
                    items: [
                        {
                            key: 'productItem',
                            text: 'Product',
                            iconProps: { iconName: 'Questionnaire' },
                            ['data-automation-id']: 'newProduct',
                            onClick: this.itemClicked.bind(this)
                        }
                    ]
                }
            },
            {
                key: 'views',
                text: 'Views',
                cacheKey: 'myCacheKey', // changing this key will invalidate this item's cache
                //iconProps: { iconName: 'Add' },
                subMenuProps: {
                    items: [
                        {
                            key: 'list',
                            text: 'List',
                            iconProps: { iconName: 'Questionnaire' },
                            ['data-automation-id']: 'viewList',
                            onClick: this.itemClicked.bind(this)
                        },
                        {
                            key: 'rollup',
                            text: 'Rollup',
                            iconProps: { iconName: 'Questionnaire' },
                            ['data-automation-id']: 'viewRollup',
                            onClick: this.itemClicked.bind(this)
                        }                        
                    ]
                }
            }            
        ];
      }

    public render(): React.ReactElement<IProductManagerCmdBarProps> {
        return (
            <CommandBar
                items={this.cmdBarItems}
            />
        );
    }

    private itemClicked(ev: any, item: ICommandBarItemProps): void {
        AppService.MenuItemClicked(item);
    }
}
