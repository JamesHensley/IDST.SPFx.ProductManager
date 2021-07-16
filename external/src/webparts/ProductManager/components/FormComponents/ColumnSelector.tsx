import * as React from 'react';
import { ContextualMenu, IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

export interface IColumnSelectorProps {
  hideMenuCallBack: (someVal: any) => void;
}

export interface IColumnSelectorState { }

export class ColumnSelector extends React.Component<IColumnSelectorProps, IColumnSelectorState> {
  private menuItems: IContextualMenuItem[] = [
    {
      key: 'newItem1',
      text: 'New',
      canCheck: true,
      isChecked: false,
      onClick: this.onToggleSelect.bind(this)
    },
    {
      key: 'newItem2',
      text: 'New',
      canCheck: true,
      isChecked: false,
      onClick: this.onToggleSelect.bind(this)
    },
    {
      key: 'newItem3',
      text: 'New',
      canCheck: true,
      isChecked: false,
      onClick: this.onToggleSelect.bind(this)
    },
    {
      key: 'newItem4',
      text: 'New',
      canCheck: true,
      isChecked: false,
      onClick: this.onToggleSelect.bind(this)
    }
  ];
  private myRef: React.RefObject<any>;

  constructor(props: IColumnSelectorProps) {
    super(props);
    this.myRef = React.createRef();
    this.state = this.menuItems.reduce((t,n) => {
      t[n.key] = true;
      return t;
    }, {});
  }

  private onToggleSelect(ev: Event, item: IContextualMenuItem): void {
    console.log('ColumnSelector.onToggleSelect: ', item);
  }

  render(): React.ReactElement<IColumnSelectorProps> {
    return (
      <div ref={this.myRef}>
        <ContextualMenu
          items={this.menuItems}
          hidden={false}
          target={this.myRef}
          // onItemClick={onHideContextualMenu}
          onDismiss={this.props.hideMenuCallBack.bind(this, this.state)}
        />
      </div>
    );
  }

}
