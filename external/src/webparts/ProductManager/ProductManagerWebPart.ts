import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext, IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-webpart-base';
import PnPTelemetry from '@pnp/telemetry-js';

import AppService, { GlobalMsg } from '../../services/AppService';
import RecordService from '../../services/RecordService';

import { IPageComponentProps } from './components/PageComponent';
import { ConfigErrorComponent } from './components/ConfigErrorComponent';
import { ProductManager } from './components/ProductManager';

import { TeamMemberModel, TeamModel } from '../../models/TeamModel';
import { ProductTypeModel } from '../../models/ProductTypeModel';
import { EventModel } from '../../models/EventModel';
import { ClassificationModel } from '../../models/ClassificationModel';
import { PirModel } from '../../models/PirModel';
import { MiscSettingsModel } from '../../models/MiscSettingsModel';
import { TemplateDocumentModel } from '../../models/TemplateDocumentModel';

import { IIconOptions, initializeIcons } from 'office-ui-fabric-react';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';

import './components/Overrides.css';

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
  pirs: Array<PirModel>;
  eventTypes: Array<EventModel>;
  classificationModels: Array<ClassificationModel>;
}

export default class ProductManagerWebPart extends BaseClientSideWebPart<IProductManagerWebPartProps> {
  private appSettings: IAppSettings;

  public render(): void {
    console.log('ProductManagerWebPart.render: ', this.properties);
    const element: React.ReactElement<IPageComponentProps> = this.appSettings ?
      React.createElement(ProductManager, {}) :
      React.createElement(
        ConfigErrorComponent, { displayStr: 'Application settings could not be loaded or are invalid' }
      );
    this.domElement.setAttribute('id', 'productManagerDomElem');
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected async onInit(): Promise<void> {
    PnPTelemetry.getInstance().optOut();
    (window as any).disableBeaconLogToConsole = true;

    this.properties.siteRootUrl = '/sites/jise';
    this.properties.appSettingsListName = 'JiseToolAppSettings';

    AppService.Init(this);
    this.appSettings = await this.getAppSettings()
    .then(d => {
      initializeIcons(`${d.miscSettings.fluentUiCDN}/icons`, { disableWarnings: true } as IIconOptions);
      initializeFileTypeIcons(`${d.miscSettings.fluentUiCDN}/item-types/`, { disableWarnings: true } as IIconOptions);
      AppService.TriggerGlobalMessage(GlobalMsg.IconsInitialized);
      return d;
    })
    .catch(e => {
      console.log('onInit-Failed to get AppSettings: ', e);
      return Promise.reject(e);
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
        console.log('onDisplayModeChanged-Failed to get app settings: ', e);
        this.appSettings = null;
        super.onDisplayModeChanged(oldDisplayMode);
      });
    }
  }

  protected get dataVersion(): Version { return Version.parse('1.1'); }
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
              groupName: 'App Settings',
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
      const listUrl = `${this.properties.siteRootUrl}/_api/web/lists/getbytitle('${this.properties.appSettingsListName}')/Items?$orderby=Modified desc&$top=1`;

      return fetch(listUrl, { headers: { accept: 'application/json' } })
      .then(d => d.status === 200 ? d.json() : null)
      .then(d => d ? JSON.parse(d.value[0].Data) : null)
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
          settings.pirs = data.pirs.map((d: PirModel) => new PirModel(d));
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
      settings.pirs = data.pirs.map((d: PirModel) => new PirModel(d));
      settings.eventTypes = data.eventTypes.map((d: EventModel) => new EventModel(d));
      settings.classificationModels = data.classificationModels.map(d => new ClassificationModel(d));
      this.appSettings = settings;
      return Promise.resolve(this.appSettings);
    })
    .catch(e => Promise.reject(e));
  }
}
