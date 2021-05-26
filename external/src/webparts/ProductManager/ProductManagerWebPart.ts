import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart, WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IPropertyPaneField,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import { initializeIcons } from '@fluentui/react/lib/Icons';

import ProductManager, { IProductManagerProps } from './components/ProductManager';
import AppService from '../../services/AppService';
import { TeamModel } from '../../models/TeamModel';
import { TeamMemberModel } from '../../models/PeopleModel';

import PnPTelemetry from '@pnp/telemetry-js';
import { ProductModel } from '../../models/ProductModel';
import { RecordService } from '../../services/RecordService';

export interface IProductManagerWebPartProps {
  description: string;
  isDebugging: boolean;
  productListUrl: string;
  teams: Array<TeamModel>;
}

export interface IProductManagerWebPartCallbacks {
  /** Global method to notify the WebPart that the product list may have changed */
  productsUpdated: () => void;
}

export default class ProductManagerWebPart extends BaseClientSideWebPart<IProductManagerWebPartProps> {
  private mockSettings: IProductManagerWebPartProps;
  private allProducts: Array<ProductModel>;

  public render(): void {
    console.log('ProductManagerWebPart.render:  ');
    this.getProductList().then(() => this.renderCompleted()).catch(e => Promise.reject(e));
  }

  protected renderCompleted(): void {
    super.renderCompleted();

    const element: React.ReactElement<IProductManagerProps> = React.createElement(
      ProductManager, { allProducts: this.allProducts }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get isRenderAsync(): boolean { return true; }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected async onInit(): Promise<void> {
    const telemetry = PnPTelemetry.getInstance();
    telemetry.optOut();
    (window as any).disableBeaconLogToConsole = true;

    initializeIcons();
    AppService.Init(this, {
      productsUpdated: this.updateProducts.bind(this)
    });

    await this.getMockAppSettings();
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
                // PropertyPaneTextField('description', {
                //   label: this.properties.description
                // })
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

  private updateProducts(): void {
    this.getProductList();
  }

  private getProductList(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      RecordService.GetProducts()
      .then(allProducts => {
        this.allProducts = allProducts;
        resolve();
      })
      .catch(e => reject(e));
    });
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
