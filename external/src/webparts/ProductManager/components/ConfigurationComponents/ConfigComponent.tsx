import * as React from 'react';
import { Label, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';

import TeamConfig from './TeamConfig';
import { TeamMemberModel, TeamModel } from '../../../../models/TeamModel';

import AppService from '../../../../services/AppService';
import EventConfig from './EventConfig';
import StringConfig from './StringConfig';
import ClassificationConfig from './ClassificationConfig';
import CategoryConfig from './CategoryConfig';

import { ProductTypeModel } from '../../../../models/ProductTypeModel';

export interface IConfigComponentProps {}
export interface IConfigComponentState {}

export default class ConfigComponent extends React.Component <IConfigComponentProps, IConfigComponentState> {
    public render(): React.ReactElement<IConfigComponentProps> {

        return (
            <Stack tokens={{ childrenGap: 10 }}>
                <Stack.Item grow>
                    <TeamConfig />
                </Stack.Item>
                <Stack.Item grow>
                    <EventConfig />
                </Stack.Item>
                <Stack.Item grow>
                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                        <Stack.Item grow verticalFill={true}>
                            <StringConfig />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true}>
                            <ClassificationConfig />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true}>
                            <CategoryConfig />
                        </Stack.Item>
                    </Stack>
                </Stack.Item>
            </Stack>
        );
    }

    private updateProductType(prodTypeModel: ProductTypeModel): void {}
}
