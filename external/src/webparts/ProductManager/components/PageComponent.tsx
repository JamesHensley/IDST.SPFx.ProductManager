import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { ICommandBarItemProps } from '@fluentui/react';

import RecordService from '../../../services/RecordService';
import AppService, { ICmdBarListenerProps } from '../../../services/AppService';

import { ProductModel } from '../../../models/ProductModel';

import ProductList from './ProductList';
import RollupView from './RollupView';
import TeamView from './TeamView';
import ConfigComponent from './ConfigurationComponents/ConfigComponent';

import ProductManagerCmdBar from './ProductManagerCmdBar';

export interface IPageComponentProps { }

export interface IPageComponentState {
	currentProduct: ProductModel;
    chosenTeamId: string;
	view: string;
	lastUpdated: number;
}

export default class PageComponent extends React.Component <IPageComponentProps, IPageComponentState> {
	private menuReceiver = null;

	constructor(props: IPageComponentProps) {
		super(props);
		this.state = {
			currentProduct: null,
            chosenTeamId: null,
			view: 'ProductList',
			lastUpdated: new Date().getTime()
		};
	}

	public render(): React.ReactElement<{}> {
		return(
            <div className={styles.productManager}>
                <div className={styles.grid}>
                    <div className={styles.gridRow}>
                        <ProductManagerCmdBar
                            appView={this.state.view}
                        />
                    </div>
                    <div className={styles.gridRow}>
                        <div className={styles.gridCol12}>
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
                                <ConfigComponent />
                            }
                        </div>
                    </div>
                </div>
            </div>
		);
	}

	public componentDidMount(): void {
		this.menuReceiver = this.cmdBarItemClicked.bind(this);
		AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);
	}

	public componentWillUnmount(): void {
		AppService.UnRegisterCmdBarListener(this.menuReceiver);
	}

	//#region Emitter receivers

    /** Receives messages from the commandBar component */
	private async cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
		switch (item['data-automation-id']) {
			case 'viewRollup':
				this.setState({ view: 'RollUp' });
				break;
			case 'teamView':
				this.setState({ view: 'TeamView', chosenTeamId: item.data.id, currentProduct: null });
				break;
			case 'viewList':
				this.setState({ view: 'ProductList', chosenTeamId: null, currentProduct: null });
				break;
			case 'configView':
				this.setState({ view: 'ConfigView', chosenTeamId: null, currentProduct: null });
				break;
		}
		return Promise.resolve();
	}
	//#endregion
}
