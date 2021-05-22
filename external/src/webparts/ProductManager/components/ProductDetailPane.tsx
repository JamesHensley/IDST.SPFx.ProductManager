import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';

import * as styles from './ProductManager.module.scss';

import { format } from 'date-fns';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';

export interface IProductDetailPaneProps {
    isVisible: boolean;
    currentProductId: string;
    paneCloseCallBack: () => void;
}

export interface IProductDetailPaneState {
    isVisible: boolean;
    currentProduct: ProductModel;
}

export default class ProductDetailPane extends React.Component<IProductDetailPaneProps, IProductDetailPaneState> {
    private dateFormatStr = "dd-LLL-yyyy HH:mm:ss'Z'";

    constructor(props: IProductDetailPaneProps) {
        super(props);
        const stateObj: IProductDetailPaneState = {
            isVisible: this.props.isVisible,
            currentProduct: null
        };

        this.state = stateObj;
    }

    public render(): React.ReactElement<IProductDetailPaneProps> {
        const formHeading = `${styles.gridCol3} ${styles.fieldHead}`;
        const formValue = `${styles.gridCol9} ${styles.fieldValue}`;

        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss
                isHiddenOnDismiss={true}
                headerText={this.state.currentProduct ? this.state.currentProduct.id : ''}
                isOpen={this.state.isVisible}
                onDismiss={this.togglePanelState.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                {
                    this.state.currentProduct &&
                    <div className={styles.grid + ' ' + styles.formStyles}>
                        <div className={styles.gridRow}>
                            <div className={formHeading}>Body:</div>
                            <div className={formValue}>{this.state.currentProduct.description}</div>
                        </div>
                        <div className={styles.gridRow}>
                            <div className={formHeading}>Assigned Teams:</div>
                            <div className={formValue}>// Todo //</div>
                        </div>
                        <div className={styles.gridRow}>
                            <div className={formHeading}>Request Start:</div>
                            <div className={formValue}>{format(this.state.currentProduct.requestDate, this.dateFormatStr)}</div>
                        </div>
                        <div className={styles.gridRow}>
                            <div className={formHeading}>Expected Close:</div>
                            <div className={formValue}>{format(this.state.currentProduct.returnDateExpected, this.dateFormatStr)}</div>
                        </div>
                        <div className={styles.gridRow}>
                            <div className={formHeading}>Actual Close:</div>
                            <div className={formValue}>
                            {
                                this.state.currentProduct.returnDateActual ?
                                    format(this.state.currentProduct.returnDateActual, this.dateFormatStr) : ''
                            }
                            </div>
                        </div>
                    </div>
                }
            </Panel>
        );
    }

    public componentWillReceiveProps(newProps: IProductDetailPaneProps): void {
        if(newProps.isVisible) {
            RecordService.GetProductByGUID(newProps.currentProductId)
            .then(d => {
                const stateObj: IProductDetailPaneState = {
                    isVisible: newProps.isVisible,
                    currentProduct: d
                };
                this.setState(stateObj);
            })
            .catch(e => console.log(e));
        } else {
            const stateObj: IProductDetailPaneState = {
                isVisible: newProps.isVisible,
                currentProduct: null
            };
            this.setState(stateObj);
        }
    }

    private togglePanelState(): void {
        this.props.paneCloseCallBack();
    }
}
