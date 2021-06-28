import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext, IPropertyPaneConfiguration, PropertyPaneTextField, IPropertyPaneCustomFieldProps } from '@microsoft/sp-webpart-base';

import { initializeIcons } from '@fluentui/react/lib/Icons';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';

import { IPageComponentProps } from './components/PageComponent';
import AppService from '../../services/AppService';
import { TeamModel } from '../../models/TeamModel';

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
  private appSettings: IProductManagerWebPartProps;

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

    this.appSettings = {
      description: '',
      isDebugging: false,
      productListUrl: '',
      documentListUrl: '',
      publishingLibraryUrl: '',
      teams: [],
      emailSenderName: '',
      productTypes: [],
      categories: [],
      eventTypes: [],
      classificationModels: []
    } as IProductManagerWebPartProps;
    await this.getAppSettings();

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
    return this.properties.isDebugging ? this.appSettings : this.properties;
  }

  public get AppContext(): WebPartContext {
    return this.context;
  }

  private getAppSettings(): Promise<void> {
    console.log('Getting application settings');

    // We can't really use any SP libraries here yet, so we'll just guess at the siteUrl
    const siteUrl = window.location.href.match(/^(.*\/sites\/\w+\/).*$/ig);
    const settingsLoc = siteUrl ? `${siteUrl[1]}JiseProdMgr-Config/Items?$orderby=Modified&$top=1` : '/dist/mockSettings.json';

    return new Promise<void>((resolve, reject) => {
      fetch(settingsLoc, { headers : { accept: 'application/json;odata=verbose' } })
      .then(data => data.json())
      .then(data => siteUrl ? data.d.results[0].configData : data)
      .then((data: IProductManagerWebPartProps) => {
        Object.assign(this.appSettings, data);
        this.appSettings.teams = data.teams.map((d: TeamModel) => new TeamModel(d));
        this.appSettings.productTypes = data.productTypes.map((d: ProductTypeModel) => new ProductTypeModel(d));
        this.appSettings.categories = data.categories.map((d: CategoryModel) => new CategoryModel(d));
        this.appSettings.eventTypes = data.eventTypes.map((d: EventModel) => new EventModel(d));
        this.appSettings.classificationModels = data.classificationModels.map(d => new ClassificationModel(d));
        return resolve();
      })
      .catch(e => reject(e));
    })
    .then(() => Promise.resolve())
    .catch(e => Promise.reject(e));
  }
}
