import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';

// import { PropertyFieldPeoplePicker, PrincipalType } from '@pnp/spfx-property-controls/lib/PropertyFieldPeoplePicker';
// import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
// import { IDropdownOption } from '@fluentui/react';
export interface ITeamManagerInternalProps extends IPropertyPaneManagerComponentProps, IPropertyPaneCustomFieldProps {
}

export interface IPropertyPaneManagerComponentProps {
    loadOptions: () => Promise<any[]>;
    onChanged: (option: any, index?: number) => void;
    selectedKey: string | number;
    disabled: boolean;
    stateKey: string;    
}

export interface IPropertyPaneManagerComponentState {
    loading: boolean;
    options: any[];
    error: string;    
}

export default class PropertyPaneManagerComponent extends React.Component<IPropertyPaneManagerComponentProps, IPropertyPaneManagerComponentState> {
    private selectedKey: React.ReactText;

    constructor(props: IPropertyPaneManagerComponentProps, state: IPropertyPaneManagerComponentState) {
      super(props);
      this.selectedKey = props.selectedKey;
  
      this.state = {
        loading: false,
        options: undefined,
        error: undefined
      };
    }
  
    public componentDidMount(): void {
      this.loadOptions();
    }
  
    public componentDidUpdate(prevProps: IPropertyPaneManagerComponentProps, prevState: IPropertyPaneManagerComponentState): void {
      if (this.props.disabled !== prevProps.disabled ||
        this.props.stateKey !== prevProps.stateKey) {
        this.loadOptions();
      }
    }
  
    private loadOptions(): void {
      this.setState({
        loading: true,
        error: undefined,
        options: undefined
      });
  
      this.props.loadOptions()
        .then((options: any[]): void => {
          this.setState({
            loading: false,
            error: undefined,
            options: options
          });
        }, (error: any): void => {
          this.setState((prevState: IPropertyPaneManagerComponentState, props: IPropertyPaneManagerComponentProps): IPropertyPaneManagerComponentState => {
            prevState.loading = false;
            prevState.error = error;
            return prevState;
          });
        });
    }
  
    public render(): JSX.Element {
        // const loading: JSX.Element = this.state.loading ? <div><Spinner label={'Loading options...'} /></div> : <div />;
        // const error: JSX.Element = this.state.error !== undefined ? <div className={'ms-TextField-errorMessage ms-u-slideDownIn20'}>Error while loading items: {this.state.error}</div> : <div />;
        /*
        return (
            <div>
                <Dropdown label={this.props.label}
                    disabled={this.props.disabled || this.state.loading || this.state.error !== undefined}
                    onChanged={this.onChanged.bind(this)}
                    selectedKey={this.selectedKey}
                    options={this.state.options} />
                {loading}
                {error}
            </div>
        );
        */

        return (
            <div>Jim</div>
        );
    }
  
    private onChanged(option: any, index?: number): void {
      this.selectedKey = option.key;
      // reset previously selected options
      const options: any[] = this.state.options;
      options.forEach((o: any): void => {
        if (o.key !== option.key) {
          o.selected = false;
        }
      });
      this.setState((prevState: IPropertyPaneManagerComponentState, props: IPropertyPaneManagerComponentProps): IPropertyPaneManagerComponentState => {
        prevState.options = options;
        return prevState;
      });
      if (this.props.onChanged) {
        this.props.onChanged(option, index);
      }
    }
}
