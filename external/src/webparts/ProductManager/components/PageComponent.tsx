import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ICommandBarItemProps, Stack } from '@fluentui/react';

import AppService, { GlobalMsg, ICmdBarListenerProps, IGlobalListenerProps } from '../../../services/AppService';

import ProductList from './Views/ProductList';
import RollupView from './Views/RollupView';
import TeamView from './Views/TeamView';
import ConfigurationView from './Views/ConfigComponent';

import ProductManagerCmdBar from './ProductManagerCmdBar';

export interface IPageComponentProps { }

export interface IPageComponentState {
    chosenTeamId: string;
	view: string;
	lastUpdated: number;
	iconsInitialized: boolean;
}

export default class PageComponent extends React.Component <IPageComponentProps, IPageComponentState> {
	private menuReceiver = null;
	private globalReceiver = null;

	constructor(props: IPageComponentProps) {
		super(props);
		this.state = {
            chosenTeamId: null,
			view: 'ProductList',
			lastUpdated: new Date().getTime(),
			iconsInitialized: false
		};
	}

	public render(): React.ReactElement<{}> {
		return(
			<Stack className={styles.productManager}>
				<Stack.Item grow>
					{ this.state.iconsInitialized &&
						<ProductManagerCmdBar appView={this.state.view} />
					}
				</Stack.Item>
				<Stack.Item grow>
					{this.state.view === 'ProductList' &&
						<ProductList />
					}
					{this.state.view === 'RollUp' &&
						<RollupView />
					}
					{this.state.view === 'TeamView' &&
						<TeamView
							key={new Date().getTime()}
							teamModel={AppService.AppSettings.teams.reduce((t,n) => n.teamId === this.state.chosenTeamId ? n : t, null)}
						/>
					}
					{this.state.view === 'ConfigView' &&
						<ConfigurationView />
					}
				</Stack.Item>
			</Stack>
		);
	}

	public componentDidMount(): void {
		this.menuReceiver = this.cmdBarItemClicked.bind(this);
		AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);
		this.globalReceiver = this.globalMessageReceived.bind(this);
		AppService.RegisterGlobalListener({ callback: this.globalReceiver, msg: GlobalMsg.IconsInitialized } as IGlobalListenerProps);
		setTimeout(() => {
			this.setState({ iconsInitialized: true });
		}, 10);
	}

	public componentWillUnmount(): void {
		AppService.UnRegisterCmdBarListener(this.menuReceiver);
		AppService.UnRegisterGlobalListener(this.globalReceiver);
	}

	//#region Emitter receivers

    /** Receives messages from the commandBar component */
	private async cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
		switch (item['data-automation-id']) {
			case 'viewRollup':
				this.setState({ view: 'RollUp', chosenTeamId: null });
				break;
			case 'teamView':
				this.setState({ view: 'TeamView', chosenTeamId: item.data.id });
				break;
			case 'viewList':
				this.setState({ view: 'ProductList', chosenTeamId: null });
				break;
			case 'configView':
				this.setState({ view: 'ConfigView', chosenTeamId: null });
				break;
		}
		return Promise.resolve();
	}

	/** Receives messages from the global message emitter in the AppService */
	private async globalMessageReceived(): Promise<void> {
		this.setState({ iconsInitialized: true });
	}
	//#endregion
}
