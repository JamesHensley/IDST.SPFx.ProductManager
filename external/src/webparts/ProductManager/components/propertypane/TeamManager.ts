import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

// import { PropertyFieldPeoplePicker, PrincipalType } from '@pnp/spfx-property-controls/lib/PropertyFieldPeoplePicker';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';

export interface ITeamManagerProps {
    people: Array<any>;
}

export interface ITeamManagerState {

}

export default class TeamManager extends BaseClientSideWebPart<ITeamManagerProps> {
    protected render(): void {
        /*
        const element: React.ReactElement<ITeamManagerProps> = React.createElement(
            PeoplePicker,
            {
                label: 'PropertyFieldPeoplePicker',
                initialData: this.properties.people,
                allowDuplicate: false,
                principalType: [PrincipalType.Users, PrincipalType.SharePoint, PrincipalType.Security],
                onPropertyChange: this.onPropertyPaneFieldChanged,
                context: this.context,
                properties: this.properties,
                onGetErrorMessage: null,
                deferredValidationTime: 0,
                key: 'peopleFieldId'
            }
        );
        */

        const element = null;
        ReactDom.render(element, this.domElement);
    }
}
