import * as React from 'react';
import { Label, Stack } from '@fluentui/react';

import TeamConfig from './TeamConfig';

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
                    <Stack horizontal tokens={{ childrenGap: 10 }} verticalFill={true}>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <StringConfig />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <EventConfig />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <CategoryConfig />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <ClassificationConfig />
                        </Stack.Item>
                    </Stack>
                </Stack.Item>
            </Stack>
        );
    }

    private updateProductType(prodTypeModel: ProductTypeModel): void {}
}
