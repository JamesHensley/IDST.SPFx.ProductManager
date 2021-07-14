import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext, IPropertyPaneConfiguration, PropertyPaneTextField, IPropertyPaneCustomFieldProps } from '@microsoft/sp-webpart-base';

import { initializeIcons } from '@fluentui/react/lib/Icons';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';

import { IPageComponentProps } from './components/PageComponent';
import AppService from '../../services/AppService';
import { TeamMemberModel, TeamModel } from '../../models/TeamModel';

import PnPTelemetry from '@pnp/telemetry-js';
import { ProductManager } from './components/ProductManager';
import { ProductTypeModel } from '../../models/ProductTypeModel';
import { EventModel } from '../../models/EventModel';
import { ClassificationModel } from '../../models/ClassificationModel';
import { CategoryModel } from '../../models/CategoryModel';
import { RecordService } from '../../services/RecordService';
import { MiscSettingsModel } from '../../models/MiscSettingsModel';
import { TemplateDocumentModel } from '../../models/TemplateDocumentModel';

export interface IProductManagerWebPartProps {
  description: string;
  appSettingsListName: string;
}

export interface IAppSettings {
  description: string;
  appSettingsListName: string;

  isDebugging: boolean;

  miscSettings: MiscSettingsModel;
  teams: Array<TeamModel>;
  teamMembers: Array<TeamMemberModel>;
  templateDocuments: Array<TemplateDocumentModel>;
  productTypes: Array<ProductTypeModel>;
  categories: Array<CategoryModel>;
  eventTypes: Array<EventModel>;
  classificationModels: Array<ClassificationModel>;
}

export default class ProductManagerWebPart extends BaseClientSideWebPart<IProductManagerWebPartProps> {
  private appSettings: IAppSettings;

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

  protected get dataVersion(): Version { return Version.parse('1.0'); }
  public get AppProps(): IAppSettings { return this.appSettings; }
  public set AppProps(val: IAppSettings) { this.appSettings = val; }
  public get AppContext(): WebPartContext { return this.context; }
  private get isDebugging(): boolean { return window.location.href.match(/^(.*\/sites\/\w+\/).*$/ig) ? false : true; }

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

  private getAppSettings(): Promise<IAppSettings> {
    console.log('Getting application settings');

    // We can't really use any SP libraries here yet, so we'll just guess at the siteUrl
    const siteUrl = window.location.href.match(/^(.*\/sites\/\w+\/).*$/ig);
    const settingsLoc = siteUrl ? `${siteUrl[1]}${this.properties.appSettingsListName}/Items?$orderby=Modified&$top=1` : '/dist/mockSettings.json';

    return new Promise<IAppSettings>((resolve, reject) => {
      return fetch(settingsLoc, { headers : { accept: 'application/json;odata=verbose' } })
      .then(data => data.json())
      .then(data => siteUrl ? data.d.results[0].configData : data)
      .then((data: IAppSettings) => {
        const settings: IAppSettings = Object.assign({}, data);
        // We never want JSON saved data to overwrite these fields, so make sure they come from the property-pane
        settings.appSettingsListName = this.properties.appSettingsListName;
        settings.isDebugging = this.isDebugging;

        settings.teams = data.teams.map((d: TeamModel) => new TeamModel(d));
        settings.teamMembers = data.teamMembers.map((d: TeamMemberModel) => new TeamMemberModel(d));
        settings.templateDocuments = data.templateDocuments.map((d: TemplateDocumentModel) => new TemplateDocumentModel(d));
        settings.productTypes = data.productTypes.map((d: ProductTypeModel) => new ProductTypeModel(d));
        settings.categories = data.categories.map((d: CategoryModel) => new CategoryModel(d));
        settings.eventTypes = data.eventTypes.map((d: EventModel) => new EventModel(d));
        settings.classificationModels = data.classificationModels.map(d => new ClassificationModel(d));
        return resolve(settings);
      })
      .catch(e => reject(e));
    })
    .then((settings: IAppSettings) => Promise.resolve(settings))
    .catch(e => Promise.reject(e));
  }

  /** Updates one or more settings in the application */
  public UpdateAppSettings(newSettings: Partial<IAppSettings>): Promise<IAppSettings> {
    const newRecord = Object.assign(Object.assign({}, this.appSettings), newSettings);
    // Never let these be overridden by this method
    newRecord.appSettingsListName = this.properties.appSettingsListName;
    newRecord.isDebugging = this.isDebugging;

    return RecordService.AddListRecord(this.properties.appSettingsListName, newRecord)
    .then(d => JSON.parse(d))
    .then(d => {
      this.appSettings = d;
      // this.render();
      return Promise.resolve(this.appSettings);
    })
    .catch(e => Promise.reject(e));
  }
}
