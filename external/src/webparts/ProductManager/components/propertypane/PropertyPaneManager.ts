import * as React from 'react';
import * as ReactDom from 'react-dom';

// import { IPropertyPaneField, PropertyPaneFieldType } from '@microsoft/sp-property-pane';
import { IPropertyPaneField, PropertyPaneFieldType } from '@microsoft/sp-webpart-base';

import PropertyPaneManagerComponent, { IPropertyPaneManagerComponentProps, ITeamManagerInternalProps } from './PropertyPaneComponentManager';

export class PropertyPaneManager implements IPropertyPaneField<IPropertyPaneManagerComponentProps> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public properties: ITeamManagerInternalProps;
    private elem: HTMLElement;

    constructor(targetProperty: string, properties: IPropertyPaneManagerComponentProps) {
        this.targetProperty = targetProperty;
        this.properties = {
          key: properties.label,
          label: properties.label,
          loadOptions: properties.loadOptions,
          onPropertyChange: properties.onPropertyChange,
          selectedKey: properties.selectedKey,
          disabled: properties.disabled,
          onRender: this.onRender.bind(this),
          onDispose: this.onDispose.bind(this)
        };
    }

    public render(): void {
        if (!this.elem) {
          return;
        }
    
        this.onRender(this.elem);
    }
    private onDispose(element: HTMLElement): void {
        ReactDom.unmountComponentAtNode(element);
      }
    
    private onRender(elem: HTMLElement): void {
        if (!this.elem) {
            this.elem = elem;
        }

        const element: React.ReactElement<IPropertyPaneManagerComponentProps> = React.createElement(
            PropertyPaneManagerComponent,
            {
                label: this.properties.label,
                loadOptions: this.properties.loadOptions,
                onChanged: this.onChanged.bind(this),
                selectedKey: this.properties.selectedKey,
                disabled: this.properties.disabled,
                // required to allow the component to be re-rendered by calling this.render() externally
                stateKey: new Date().toString()
            }
        );
        ReactDom.render(element, elem);
    }
    
    //private onChanged(option: IDropdownOption, index?: number): void {
    private onChanged(option: any, index?: number): void {
        this.properties.onPropertyChange(this.targetProperty, option.key);
    }    
}
