import * as React from 'react';
import * as styles from '../ProductManager.module.scss';
import { ProductModel } from '../../../../models/ProductModel';
import { DetailsList, DetailsListLayoutMode, DetailsRow, Facepile, IColumn, ICommandBarItemProps, IDetailsRowProps, IFacepilePersona, IPersona, IPersonaSharedProps, Persona, PersonaCoin, PersonaInitialsColor, PersonaSize, SelectionMode, Stack, TextField } from '@fluentui/react';
import { addDays, format } from 'date-fns';
import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import { TaskModel } from '../../../../models/TaskModel';
import { TeamModel } from '../../../../models/TeamModel';
import { FilterService } from '../../../../services/FilterService';
import RecordService from '../../../../services/RecordService';
import ProductDetailPane from '../SharedComponents/ProductDetailPane';
import ColorService from '../../../../services/ColorService';
import { NotificationType } from '../../../../services/NotificationService';

export interface IDocument {
	key: string;
	title: string;
	description: string;
	value: string;
	teamIcon: string;
	productType: string;
	productStatus: string;
	openDate: string;
	expectedReturnDate: string;
	closeDate: string;
	tasks: Array<TaskModel>;
	eventType: string;
	eventDate: string;
	classification: string;
}

export interface IProductListProps { }
export interface IProductListState { allProducts: Array<ProductModel>; lastUpdate: number; showingColumnMenu: boolean; currentProd: ProductModel; isEditing: boolean; }

export default class ProductList extends React.Component<IProductListProps, IProductListState> {
    private menuReceiver: any = null;

	constructor(props: IProductListProps) {
		super(props);
		FilterService.RegisterListFields([
			{ key: 'productType', name: 'Type', minWidth: 100, maxWidth: 150, fieldName: 'productType', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 2, displayed: true } },
			{ key: 'productStatus', name: 'Status', minWidth: 50, maxWidth: 80, fieldName: 'productStatus', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'string', colCount: 1, displayed: true } },
			{ key: 'title', name: 'Title', minWidth: 100, maxWidth: 300, fieldName: 'title', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'string', colCount: 2, displayed: true } },
			{ key: 'eventType', name: 'Event Type', minWidth: 100, maxWidth: 200, fieldName: 'eventType', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
			{ key: 'openDate', name: 'Open Date', minWidth: 100, maxWidth: 150, fieldName: 'openDate', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
			{ key: 'expectedReturnDate', name: 'Expected Return', minWidth: 100, maxWidth: 150, fieldName: 'expectedReturnDate', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
			{ key: 'eventDate', name: 'Event Date', minWidth: 100, maxWidth: 150, fieldName: 'eventDate', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } },
			{ key: 'tasks', name: 'Tasked Teams', minWidth: 100, maxWidth: 300, fieldName: 'tasks', isRowHeader: true, isSorted: false, isSortedDescending: false, data: { type: 'object', colCount: 1, displayed: true } }
		]);

        this.state = { allProducts: [], lastUpdate: new Date().getTime(), showingColumnMenu: false, currentProd: null, isEditing: false };
	}

	/** Data displayed in the list */
	private get allItems(): Array<IDocument> {
		// return (this.props.allProducts || [])
		return (this.state.allProducts || [])
		.filter(i => (i.filterString.toLowerCase().indexOf(FilterService.FilterText.toLowerCase()) >= 0))
		.map(d => {
			const lastSuspense = d.tasks.reduce((t: Date, n) => new Date(n.taskSuspense) > t ? new Date(n.taskSuspense) : t, new Date(null));
			return {
				key: d.guid,
				title: d.title,
				description: d.description,
				value: d.guid,
				teamIcon: '',
				productType: AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === d.productType ? n.typeName : t, ''),
				productStatus: d.status,
				openDate: d.requestDate ? format(d.requestDate, AppService.DateFormatValue) : '',
				expectedReturnDate: format(lastSuspense, AppService.DateFormatValue),
				closeDate: d.publishedDate ? format(d.publishedDate, AppService.DateFormatValue) : '',
				eventType: AppService.AppSettings.eventTypes.reduce((t,n) => n.eventTypeId === d.eventType ? n.eventTitle : t, ''),
				eventDate: d.eventDateStart ? format(d.eventDateStart, AppService.DateFormatValue) : '',
				classification: AppService.AppSettings.classificationModels.reduce((t,n) => n.classificationId === d.classificationId ? n.classificationTitle : t, ''),
				tasks: d.tasks || []
			} as IDocument;
		})
		.sort((a,b) => {
			return a[FilterService.SortField] > b[FilterService.SortField] ? (1 * FilterService.SortDir) : (a[FilterService.SortField] < b[FilterService.SortField] ? -1 * FilterService.SortDir : 0);
		});
	}

	/** Column definitions for the list */
	private get allColumns(): Array<IColumn> {
		return FilterService.DisplayedFields.map(d => {
			d.onColumnClick = this.onColumnClick.bind(this, d);
			d.onRender = ((i: IDocument, idx, col) => {
				switch (col.fieldName) {
                    case 'tasks':
						return <Facepile
							personas={
								(i.tasks || []).map(m => m.taskedTeamId).filter((f,i,e) => e.indexOf(f) === i)
								.map(m => AppService.AppSettings.teams.reduce((t, n) => n.teamId === m ? n : t, null))
								.map(d => { return { imageInitials: d.shortName, personaName: d.name, data: d } as IFacepilePersona; })
							}
							// The number of coins determines which render method is used... read the documentation
							onRenderPersona={(props: IFacepilePersona) => {
								return <PersonaCoin {...props} size={PersonaSize.size32} initialsColor={props.data.teamColor} initialsTextColor={ColorService.GetTextColor(props.data.teamColor)} />;
							}}
							onRenderPersonaCoin={(props: IFacepilePersona) => {
								return <PersonaCoin {...props} size={PersonaSize.size32} initialsColor={props.data.teamColor} initialsTextColor={ColorService.GetTextColor(props.data.teamColor)} />;
							}}
						/>;
					default:
						return <div>{i[col.fieldName]}</div>;
				}
			});
			return d;
		});
	}

	public render(): React.ReactElement<IProductListProps> {
		const items = this.allItems;
		return (
			<Stack>
				<Stack.Item grow>
					<TextField
						styles={{ root: { width: '100%' } }}
						label={`Filter text - [${items.length} items displayed]`}
						onChange={this.onChangeFilter}
						value={FilterService.FilterText}
					/>
				</Stack.Item>
				<Stack.Item grow>
					<DetailsList
						key={this.state.lastUpdate}
						items={items}
						columns={this.allColumns}
						selectionMode={SelectionMode.none}
						compact={true}
						layoutMode={DetailsListLayoutMode.justified}
						skipViewportMeasures={false}
						onRenderRow={(props: IDetailsRowProps) => {
							return (
								<div onClick={this.onRowClick.bind(this, props)}>
									<DetailsRow {...props} styles={{ root: { cursor: 'pointer' } }} />
								</div>);
						}}
					/>
				</Stack.Item>
				{
					this.state.currentProd &&
					<ProductDetailPane
						isVisible={true}
						isEditing={this.state.isEditing}
						currentProduct={this.state.currentProd}
						readOnly={false}
						saveProduct={this.saveProduct.bind(this)}
						closePane={() => { this.setState({ currentProd: null }); }}
					/>
				}
			</Stack>
		);
	}

	private saveProduct(newModel: ProductModel, keepPaneOpen?: boolean, notificationType?: NotificationType): void {
		RecordService.SaveProduct(newModel, notificationType)
		.then(result => result.productModel)
		.then(model => {
			RecordService.GetProducts()
			.then(prods => this.setState({
                allProducts: prods,
                isEditing: false,
                currentProd: keepPaneOpen ? (prods.reduce((t, n) => n.guid === newModel.guid ? n : t, null)) : null
            }))
			.catch(e => Promise.reject(e));
		})
		.catch(e => Promise.reject(e));
	}

	public componentDidMount(): void {
		this.menuReceiver = this.cmdBarItemClicked.bind(this);
		AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);

		RecordService.GetProducts()
		.then(prods => { this.setState({ allProducts: prods }); })
		.catch(e => Promise.reject(e));
	}

    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.menuReceiver);
    }

	/** Handler for when a user clicks a row to view the records details */
	private onRowClick(i?: IDetailsRowProps, ev?: React.FocusEvent<HTMLElement>): void {
		this.setState({ currentProd: this.state.allProducts.reduce((t, n) => n.guid === i.item.key ? n : t, null), isEditing: false });
	}

	/** Handler for when a user clicks a column heading to sort the list */
	private onColumnClick = (column: IColumn, ev: Event): void => {
		ev.preventDefault();
		FilterService.SortField = column.fieldName;
		FilterService.SortDir = FilterService.SortDir * -1;
		this.setState({ lastUpdate: new Date().getTime() });
	}

	/** Handler for when text is changed in the filter control */
	private onChangeFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
		FilterService.FilterText = text;
		this.setState({ lastUpdate: new Date().getTime() });
	}

	/** Will be used to show/hide columns in the future */
	private onShowColumnsMenu(): void {
		// this.setState({ showingColumnMenu: !((this.state && this.state.showingColumnMenu) || false) });
	}

    //#region Emitter receivers
    private cmdBarItemClicked(item: ICommandBarItemProps): Promise<void> {
        if (item['data-automation-id'] === 'newProduct') {
                const newRecord = RecordService.GetNewProductModel(item.data.id);
                this.setState({ currentProd: newRecord, isEditing: true });
        }
        return Promise.resolve();
    }
    //#endregion
}
