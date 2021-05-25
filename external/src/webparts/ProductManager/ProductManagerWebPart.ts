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
  productsUpdated: (newProducts: Array<ProductModel>) => void;
}

export default class ProductManagerWebPart extends BaseClientSideWebPart<IProductManagerWebPartProps> {
  private mockSettings: IProductManagerWebPartProps;
  private allProducts: Array<ProductModel>;

  public render(): void {
    //if(this.AppProps.isDebugging) {
      new Promise<void>((resolve, reject) => {
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
          //Add call to "getProductList" HERE
          this.renderCompleted();
          resolve();
        })
        .catch(e => {
          console.log(e);
          this.renderCompleted();
          reject();
        });
      })
      .catch(e => {
        console.log(e);
        this.renderCompleted();
      });
    //}
    //else {
    //  this.renderCompleted();
    //}
  }

  protected renderCompleted(): void {
    super.renderCompleted();

    const element: React.ReactElement<IProductManagerProps> = React.createElement(
      ProductManager, { allProducts: this.allProducts }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get isRenderAsync(): boolean {
    return true;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected async onInit(): Promise<void> {
    const telemetry = PnPTelemetry.getInstance();
    telemetry.optOut();
    (window as any).disableBeaconLogToConsole = true;

    initializeIcons();
    const callBacks: IProductManagerWebPartCallbacks = {
      productsUpdated: this.updateProducts.bind(this)
    };
    AppService.Init(this, callBacks);
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

  private updateProducts(newProducts: Array<ProductManager>): void {
    this.getProductList();
  }

  private getProductList(): void {
    RecordService.GetProducts()
    .then(allProducts => {
      this.allProducts = allProducts;
      console.log('Got new products: ', allProducts);
      this.render();
    });
  }
}
