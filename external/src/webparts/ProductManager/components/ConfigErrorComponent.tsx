import * as React from 'react';

export interface IConfigErrorComponentProps {
    displayStr: string;
}
export class ConfigErrorComponent extends React.Component <IConfigErrorComponentProps> {
    public render(): React.ReactElement<{}> {
        return (
            <>
                <h1>
                    There is a problem with the webpart's configuration
                </h1>
                <h3>{this.props.displayStr}</h3>
            </>
        );
    }
}
