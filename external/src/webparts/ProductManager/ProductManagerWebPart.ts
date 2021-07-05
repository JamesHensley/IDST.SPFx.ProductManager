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
import { NotificationService, NotificationType } from '../../services/NotificationService';
import { RecordService } from '../../services/RecordService';

export interface IProductManagerWebPartProps {
  settingsListName: string;
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
  // protected get isRenderAsync () { return true; }

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
    this.appSettings = await this.getAppSettings();

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
    // return this.properties.isDebugging ? this.appSettings : this.properties;
    return this.appSettings;
  }

  public set AppProps(val: IProductManagerWebPartProps) {
    this.appSettings = val;
  }

  public get AppContext(): WebPartContext {
    return this.context;
  }

  private getAppSettings(): Promise<IProductManagerWebPartProps> {
    console.log('Getting application settings');

    // We can't really use any SP libraries here yet, so we'll just guess at the siteUrl
    const siteUrl = window.location.href.match(/^(.*\/sites\/\w+\/).*$/ig);
    const settingsLoc = siteUrl ? `${siteUrl[1]}${this.properties.settingsListName}/Items?$orderby=Modified&$top=1` : '/dist/mockSettings.json';

    return new Promise<IProductManagerWebPartProps>((resolve, reject) => {
      return fetch(settingsLoc, { headers : { accept: 'application/json;odata=verbose' } })
      .then(data => data.json())
      .then(data => siteUrl ? data.d.results[0].configData : data)
      .then((data: IProductManagerWebPartProps) => {
        const settings: IProductManagerWebPartProps = Object.assign({}, data);
        settings.isDebugging = siteUrl ? false : true;

        settings.teams = data.teams.map((d: TeamModel) => new TeamModel(d));
        settings.productTypes = data.productTypes.map((d: ProductTypeModel) => new ProductTypeModel(d));
        settings.categories = data.categories.map((d: CategoryModel) => new CategoryModel(d));
        settings.eventTypes = data.eventTypes.map((d: EventModel) => new EventModel(d));
        settings.classificationModels = data.classificationModels.map(d => new ClassificationModel(d));
        return resolve(settings);
      })
      .catch(e => reject(e));
    })
    .then((settings: IProductManagerWebPartProps) => Promise.resolve(settings))
    .catch(e => Promise.reject(e));
  }

  /** Updates one or more settings in the application */
  public UpdateAppSettings(newSettings: Partial<IProductManagerWebPartProps>): Promise<IProductManagerWebPartProps> {
    const newRecord = Object.assign(Object.assign(Object.assign({}, this.appSettings), this.properties), newSettings);
console.log('Attempting to update SPList with: ', newRecord);
    return RecordService.AddListRecord(this.properties.settingsListName, newRecord)
    .then(d => JSON.parse(d))
    .then(d => {
      Object.keys(d).forEach(p => this.properties[p] = d[p]);
      this.render();
      return Promise.resolve(this.properties);
    })
    .catch(e => Promise.reject(e));
  }
}
