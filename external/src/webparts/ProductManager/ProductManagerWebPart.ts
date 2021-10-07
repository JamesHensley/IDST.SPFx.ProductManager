import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext, IPropertyPaneConfiguration, PropertyPaneTextField, IPropertyPaneCustomFieldProps } from '@microsoft/sp-webpart-base';
import PnPTelemetry from '@pnp/telemetry-js';

import { initializeIcons } from '@fluentui/react/lib/Icons';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';

import AppService from '../../services/AppService';
import RecordService from '../../services/RecordService';

import { IPageComponentProps } from './components/PageComponent';
import { ConfigErrorComponent } from './components/ConfigErrorComponent';
import { ProductManager } from './components/ProductManager';

import { TeamMemberModel, TeamModel } from '../../models/TeamModel';
import { ProductTypeModel } from '../../models/ProductTypeModel';
import { EventModel } from '../../models/EventModel';
import { ClassificationModel } from '../../models/ClassificationModel';
import { CategoryModel } from '../../models/CategoryModel';
import { MiscSettingsModel } from '../../models/MiscSettingsModel';
import { TemplateDocumentModel } from '../../models/TemplateDocumentModel';

export interface IProductManagerWebPartProps {
  description: string;
  appSettingsListName: string;
  siteRootUrl: string;
}

export interface IAppSettings {
  description: string;
  appSettingsListName: string;
  siteRootUrl: string;

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
    console.log('ProductManagerWebPart.render: ', this.properties);
    if (this.appSettings) {
      const element: React.ReactElement<IPageComponentProps> = React.createElement(
        ProductManager, { }
      );
      ReactDom.render(element, this.domElement);
    } else {
      const element: React.ReactElement<IPageComponentProps> = React.createElement(
        ConfigErrorComponent, { displayStr: 'Application settings could not be loaded or are invalid' }
      );
      ReactDom.render(element, this.domElement);
    }
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
    this.appSettings = await this.getAppSettings()
    .then(d => {
      initializeIcons(`${d.siteRootUrl}/fabric/assets/icons/`);
      initializeFileTypeIcons(`${d.siteRootUrl}/fabric/assets/icons/`);
      return d;
    })
    .catch(e => {
      console.log('onInit: ', e);
      return null;
    });
    return Promise.resolve();
  }

  protected onDisplayModeChanged(oldDisplayMode: DisplayMode): void {
    if (oldDisplayMode === DisplayMode.Edit) {
      this.getAppSettings()
      .then(d => {
        this.appSettings = d;
        super.onDisplayModeChanged(oldDisplayMode);
      })
      .catch(e => {
        this.appSettings = null;
        super.onDisplayModeChanged(oldDisplayMode);
      });
    }
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
            description: 'Basic Application Settings'
          },
          groups: [
            {
              groupName: '',
              groupFields: [
                PropertyPaneTextField('description', {
                   label: 'Application Description',
                    multiline: true,
                    rows: 4
                }),
                PropertyPaneTextField('siteRootUrl', {
                  label: 'URL for the root of this site'
               }),
                PropertyPaneTextField('appSettingsListName', {
                  label: 'List name for application settings'
               })
              ]
            }
          ]
        }
      ]
    };
  }

  /** Called when the application is first loading; used to read the app-settings from the settings list */
  private getAppSettings(): Promise<IAppSettings> {
    if (!window.location.href.match(/^(.*\/sites\/\w+\/).*$/ig)) {
      // Must be running in debug mode
      return fetch('/dist/mockSettings.json', { headers: { accept: 'application/json;odata=verbose' } })
      .then(d => d.json())
      .then((d: IAppSettings) => Promise.resolve(d))
      .catch(e => Promise.reject(e));
    } else {
      if (!this.properties.siteRootUrl) { return Promise.reject('No siteRootUrl defined in properties'); }
      if (!this.properties.appSettingsListName) { return Promise.reject('No appSettingsListName defined in properties'); }
      const listUrl = `${this.properties.siteRootUrl}/_api/web/lists/getbytitle('${this.properties.appSettingsListName}')/Items?$orderby=Modified&$top=1`;

      return fetch(listUrl, { headers: { accept: 'application/json' } })
      .then(d => d.status === 200 ? d.json() : null)
      .then(d => d ? JSON.parse(d.d.results[0].Data) : null)
      .then((data: IAppSettings) => {
        if (data) {
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
          return Promise.resolve(settings);
        } else {
          return Promise.reject(`Invalid url for settings list: ${listUrl}`);
        }
      })
      .catch(e => Promise.reject(e));
    }
  }

  /** Updates one or more settings in the application */
  public UpdateAppSettings(newSettings: Partial<IAppSettings>): Promise<IAppSettings> {
    const newRecord = Object.assign(Object.assign({}, this.appSettings), newSettings);
    // Never let these be overridden by this method
    newRecord.appSettingsListName = this.properties.appSettingsListName;
    newRecord.isDebugging = this.isDebugging;

    return RecordService.SaveAppSettings(this.properties.appSettingsListName, newRecord, 'Data')
    .then(data => {
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
      this.appSettings = settings;
      return Promise.resolve(this.appSettings);
    })
    .catch(e => Promise.reject(e));
  }
}
