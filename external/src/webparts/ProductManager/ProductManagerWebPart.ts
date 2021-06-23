import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext, IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-webpart-base';

import { initializeIcons } from '@fluentui/react/lib/Icons';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';

import { IPageComponentProps } from './components/PageComponent';
import AppService from '../../services/AppService';
import { TeamModel } from '../../models/TeamModel';
import { TeamMemberModel } from '../../models/PeopleModel';

import PnPTelemetry from '@pnp/telemetry-js';
import { ProductManager } from './components/ProductManager';
import { ProductTypeModel } from '../../models/ProductTypeModel';
import { EventModel } from '../../models/EventModel';
import { ClassificationModel } from '../../models/ClassificationModel';
import { CategoryModel } from '../../models/CategoryModel';

export interface IProductManagerWebPartProps {
  description: string;
  isDebugging: boolean;
  productListUrl: string;
  documentListUrl: string;
  publishingLibraryUrl: string;
  teams: Array<TeamModel>;
  emailSenderName: string;
  productTypes: Array<ProductTypeModel>;
  categories: Array<CategoryModel>;
  eventTypes: Array<EventModel>;
  classificationModels: Array<ClassificationModel>;
}

export default class ProductManagerWebPart extends BaseClientSideWebPart<IProductManagerWebPartProps> {
  private mockSettings: IProductManagerWebPartProps;

  public render(): void {
    const element: React.ReactElement<IPageComponentProps> = React.createElement(
      ProductManager, { }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected async onInit(): Promise<void> {
    const telemetry = PnPTelemetry.getInstance();
    telemetry.optOut();
    (window as any).disableBeaconLogToConsole = true;

    initializeIcons();
    initializeFileTypeIcons();

    AppService.Init(this);

    await this.getMockAppSettings();

    return Promise.resolve();
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

  public get AppProps(): IProductManagerWebPartProps {
    return this.properties.isDebugging ? this.mockSettings : this.properties;
  }

  public get AppContext(): WebPartContext {
    return this.context;
  }

  private getMockAppSettings(): Promise<void> {
    if (window.location.host.toLowerCase().indexOf('localhost') === 0) {
      return new Promise<void>((resolve, reject) => {
        fetch('/dist/mockSettings.json')
        .then(data => data.json())
        .then((data: IProductManagerWebPartProps) => {
          this.mockSettings = data;
          this.mockSettings.teams = data.teams.map((m1: TeamModel, i1: number) => {
            m1.members = m1.members.map((m2: TeamMemberModel, i2: number) => {
              m2.memberNum = `${i1}-${i2}`;
              return m2;
            });
            return m1;
          });
        })
        .then(() => {
          resolve();
        })
        .catch(e => {
          console.log(e);
          reject();
        });
      })
      .catch(e => {
        console.log(e);
      });
    } else {
      return Promise.resolve();
    }
  }
}
