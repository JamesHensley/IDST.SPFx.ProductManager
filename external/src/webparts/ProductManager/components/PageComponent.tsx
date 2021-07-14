import * as React from 'react';
import * as styles from './ProductManager.module.scss';

import AppService, { ICmdBarListenerProps } from '../../../services/AppService';
import ProductList from './ProductList';
import ProductDetailPane from './ProductDetailPane';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

import ProductManagerCmdBar from './ProductManagerCmdBar';
import { ICommandBarItemProps } from '@fluentui/react';
import RollupView from './RollupView';
import TeamView from './TeamView';
import { TeamMemberModel, TeamModel } from '../../../models/TeamModel';
import ConfigComponent from './ConfigurationComponents/ConfigComponent';

export interface IPageComponentProps { }

export interface IPageComponentState {
    panelVisible: boolean;
    panelEditing: boolean;
    currentProduct: ProductModel;
    allProducts: Array<ProductModel>;
    view: string;
    chosenTeamId: string;
    lastUpdated: number;
}

export default class PageComponent extends React.Component <IPageComponentProps, IPageComponentState> {
    private receivers = {
        productEvents: null,
        cmdbarEvents: null
    };

    constructor(props: IPageComponentProps) {
        super(props);
        this.state = {
            panelVisible: false,
            panelEditing: false,
            currentProduct: null,
            allProducts: [],
            view: 'ProductList',
            chosenTeamId: null,
            lastUpdated: new Date().getTime()
        };

        RecordService.GetProducts()
        .then(allProducts => {
            this.setState({ allProducts: allProducts });
        })
        .catch(e => Promise.reject(e));
    }

    public render(): React.ReactElement<{}> {
        return(
            <>
                <ProductDetailPane
                    // Adding key here causes the component to be destroyed/rebuilt on each render
                    key={new Date().getTime()}
                    paneCloseCallBack={this.eventPaneClose.bind(this)}
                    currentProduct={this.state.currentProduct}
                    isVisible={this.state.panelVisible}
                    isEditing={this.state.panelEditing}
                    readOnly={this.state.view === 'RollUp'}
                />
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
                                    <ProductList
                                        // Adding key here causes the component to be destroyed/rebuilt on each render
                                        key={new Date().getTime()}
                                        allProducts={this.state.allProducts.slice()}
                                        productClicked={this.productClicked.bind(this)}
                                    />
                                }
                                {this.state.view === 'RollUp' &&
                                    <RollupView
                                        products={this.state.allProducts}
                                        productClicked={this.productClicked.bind(this)}
                                        defaultMonth={new Date()}
                                    />
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
            </>
        );
    }

    public componentDidMount(): void {
        this.receivers = {
            productEvents: this.productsUpdated.bind(this),
            cmdbarEvents: this.cmdBarItemClicked.bind(this)
        };
        AppService.RegisterProductListener(this.receivers.productEvents);
        AppService.RegisterCmdBarListener({ callback: this.receivers.cmdbarEvents } as ICmdBarListenerProps);
    }

    public componentWillUnmount(): void {
        AppService.UnRegisterProductListener(this.receivers.productEvents);
        AppService.UnRegisterCmdBarListener(this.receivers.cmdbarEvents);
    }

    private productClicked(prodId: string): void {
        this.setState({
            panelVisible: true,
            panelEditing: false,
            currentProduct: this.state.allProducts.reduce((t,n) => n.guid === prodId ? n : t, null)
        });
    }

    private eventPaneClose(): void {
        this.setState({
            panelVisible: false,
            currentProduct: null
        });
    }

    //#region Emitter receivers

    /** Receives the PRODUCT UPDATED message whenever the recordservice saves a product */
    private async productsUpdated(): Promise<void> {
        return RecordService.GetProducts()
        .then(allProducts => {
            this.setState({
                allProducts: allProducts,
                currentProduct: null,
                panelEditing: false,
                panelVisible: false
            });
        })
        .then(() => Promise.resolve())
        .catch(e => Promise.reject(e));
    }

    private async cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
        // console.log('PageComponent.cmdBarItemClicked: ', item);
        switch (item['data-automation-id']) {
            case 'viewRollup':
                this.setState({ view: 'RollUp' });
                break;
            case 'teamView':
                this.setState({
                    view: 'TeamView',
                    chosenTeamId: item.data.id
                });
                break;
            case 'viewList':
                this.setState({ view: 'ProductList' });
                break;
            case 'configView':
                this.setState({ view: 'ConfigView' });
                break;
            case 'newProduct':
                const newRecord = RecordService.GetNewProductModel(item.data.id);
                this.setState({
                    currentProduct: newRecord,
                    panelVisible: true,
                    panelEditing: true
                });
                break;
            /*
            case 'newTeamMember':
                console.log('Should be adding a new team member here: ', this.state);
                const teamId: string = this.state.chosenTeamId;
                const team = AppService.AppSettings.teams.reduce((t, n) => n.teamId === this.state.chosenTeamId ? n : t);
                team.members.push(RecordService.GetNewTeamMemberModel(teamId));
                this.setState({
                    view: 'TeamView',
                    // chosenTeamId: team,
                    lastUpdated: new Date().getTime()
                });
                break;
            */
        }
        return Promise.resolve();
    }
    //#endregion
}
