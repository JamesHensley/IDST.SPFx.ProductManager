import * as React from 'react';
import PageComponent from './PageComponent';
import ToasterComponent from './ToasterComponent';

export interface IProductManagerState { lastUpdated: number; }

export class ProductManager extends React.Component <{}, IProductManagerState> {
    public render(): React.ReactElement<{}> {
        return (
            <div id='productManager'>
                <PageComponent />
                <ToasterComponent />
            </div>
        );
    }
}
