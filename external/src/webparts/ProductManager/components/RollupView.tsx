import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import { Label, Stack } from '@fluentui/react';

export interface IRollupViewProps {}

export default class RollupView extends React.Component <IRollupViewProps, {}> {
    public render(): React.ReactElement<IRollupViewProps> {
        return (
            <Stack horizontalAlign='center' verticalAlign='center' >
                <Label style={ {fontSize: '2rem'} }>Rollup view is not yet ready</Label>
            </Stack>
        );
    }
}
