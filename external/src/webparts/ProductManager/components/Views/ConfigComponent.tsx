import * as React from 'react';
import { Stack } from '@fluentui/react';

import TeamConfig from '../ConfigurationComponents/TeamConfig';
import EventConfig from '../ConfigurationComponents/EventConfig';
import StringConfig from '../ConfigurationComponents/StringConfig';
import ClassificationConfig from '../ConfigurationComponents/ClassificationConfig';
import CategoryConfig from '../ConfigurationComponents/CategoryConfig';
import ProductTypeConfig from '../ConfigurationComponents/ProductTypeConfig';

export default class ConfigurationView extends React.Component <{}, {}> {
    public render(): React.ReactElement<{}> {
        return (
            <Stack tokens={{ childrenGap: 10 }}>
                <Stack.Item grow>
                    <TeamConfig />
                </Stack.Item>
                <Stack.Item grow>
                    <ProductTypeConfig />
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
}
