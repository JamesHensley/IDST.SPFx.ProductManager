import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

// import * as strings from 'IdstSpfxProductManagerWebPartStrings';
import IdstSpfxProductManager from './components/IdstSpfxProductManager';
import { IIdstSpfxProductManagerProps } from './components/IIdstSpfxProductManagerProps';

export interface IIdstSpfxProductManagerWebPartProps {
  description: string;
}

export default class IdstSpfxProductManagerWebPart extends BaseClientSideWebPart<IIdstSpfxProductManagerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IIdstSpfxProductManagerProps > = React.createElement(
      IdstSpfxProductManager,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Description'
          },
          groups: [
            {
              groupName: '',
              groupFields: [
                PropertyPaneTextField('description', {
                  label: this.properties.description
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
