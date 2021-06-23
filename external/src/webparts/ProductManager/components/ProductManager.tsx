import * as React from 'react';
import PageComponent from './PageComponent';
import ToasterComponent from './ToasterComponent';

export class ProductManager extends React.Component <{}, {}> {
    public render(): React.ReactElement<{}> {
        return (
            <div>
                <PageComponent />
                <ToasterComponent />
            </div>
        );
    }
}
