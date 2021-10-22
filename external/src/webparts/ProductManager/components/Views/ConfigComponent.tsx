import * as React from 'react';
import { Label, Stack } from '@fluentui/react';

import TeamConfig from '../ConfigurationComponents/TeamConfig';
import EventConfig from '../ConfigurationComponents/EventConfig';
import StringConfig from '../ConfigurationComponents/StringConfig';
import ClassificationConfig from '../ConfigurationComponents/ClassificationConfig';
import PirConfig from '../ConfigurationComponents/PirConfig';
import ProductTypeConfig from '../ConfigurationComponents/ProductTypeConfig';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import DocumentTemplateConfig from '../ConfigurationComponents/DocumentTemplateConfig';

export interface IConfigurationViewState {
    showInactive: boolean;
}
export interface IConfigurationViewProps {}
export default class ConfigurationView extends React.Component <{}, IConfigurationViewState> {
    constructor(props: IConfigurationViewProps) {
        super(props);
        this.state = { showInactive: false };
    }

    public render(): React.ReactElement<{}> {
        return (
            <Stack tokens={{ childrenGap: 10 }}>
                <Label style={{ fontSize: '1.5rem' }}>Application Configuration</Label>
                <FormInputToggle
                    labelValue={'Show Inactive Settings'}
                    fieldValue={this.state.showInactive}
                    fieldRef={null}
                    onUpdated={() => this.setState({ showInactive: !this.state.showInactive })}
                    oneRow={true}
                />
                <Stack.Item grow>
                    <TeamConfig showInactive={this.state.showInactive} />
                </Stack.Item>
                <Stack.Item grow>
                    <DocumentTemplateConfig showInactive={this.state.showInactive} />
                </Stack.Item>
                <Stack.Item grow>
                    <ProductTypeConfig showInactive={this.state.showInactive} />
                </Stack.Item>
                <Stack.Item grow>
                    <Stack horizontal tokens={{ childrenGap: 10 }} verticalFill={true}>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <StringConfig />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <EventConfig showInactive={this.state.showInactive} />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <PirConfig showInactive={this.state.showInactive} />
                        </Stack.Item>
                        <Stack.Item grow verticalFill={true} align={'stretch'}>
                            <ClassificationConfig showInactive={this.state.showInactive} />
                        </Stack.Item>
                    </Stack>
                </Stack.Item>
            </Stack>
        );
    }
}
