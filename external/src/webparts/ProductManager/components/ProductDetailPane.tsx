import * as React from 'react';
import { Panel, PanelType, Separator, FocusTrapZone, Stack, DirectionalHint, IconButton } from '@fluentui/react';
import { Text, Label, TextField } from '@fluentui/react';
import { Calendar, Callout } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

import * as styles from './ProductManager.module.scss';

import { format } from 'date-fns';
import { ProductModel } from '../../../models/ProductModel';
import { RecordService } from '../../../services/RecordService';
import { AttachmentsMgr } from './AttachmentsMgr';


export interface IProductDetailPaneProps {
    isVisible: boolean;
    currentProductId: string;
    paneCloseCallBack: () => void;
}

export interface IProductDetailPaneState {
    isVisible: boolean;
    currentProduct: ProductModel;
    isEditing: boolean;
}

// This needs a lot of work... especially the editing portion
export default class ProductDetailPane extends React.Component<IProductDetailPaneProps, IProductDetailPaneState> {
    private dateFormatStr = "dd-LLL-yyyy";

    constructor(props: IProductDetailPaneProps) {
        super(props);
        const stateObj: IProductDetailPaneState = {
            isVisible: this.props.isVisible,
            currentProduct: null,
            isEditing: false
        };

        this.state = stateObj;
    }

    public render(): React.ReactElement<IProductDetailPaneProps> {
        const formHeading = `${styles.gridCol4} ${styles.fieldHead}`;
        const formValue = `${styles.gridCol8} ${styles.fieldValue}`;

        return (
            <Panel
                className={styles.productDetailPane}
                isLightDismiss
                isHiddenOnDismiss={true}
                headerText={this.state.currentProduct ? this.state.currentProduct.id : ''}
                isOpen={this.state.isVisible}
                onDismiss={this.togglePanelVisibility.bind(this)}
                closeButtonAriaLabel='Close'
                type={PanelType.medium}
            >
                {
                    this.state.currentProduct &&
                    <FocusTrapZone disabled={!this.state.isEditing}>
                        <div className={styles.grid + ' ' + styles.formStyles}>
                            <button onClick={this.toggleEditMode.bind(this)}>Edit</button>
                            <ProductDetailTextField
                                fieldName={'Body'} editing={this.state.isEditing}
                                fieldValue={this.state.currentProduct.description} editLines={4}
                                fieldRef={'this.state.currentProduct.description'}
                                onUpdated={this.fieldUpdated.bind(this, this.state.currentProduct, '')}
                            />
                            <ProductDetailTextField
                                fieldName={'Assigned Teams'} editing={this.state.isEditing}
                                fieldValue={'// Todo //'}
                                fieldRef={'this.state.currentProduct'}
                                onUpdated={this.fieldUpdated.bind(this, this.state.currentProduct, '')}
                            />
                            <ProductDetailDateField
                                fieldName={'Request Start'} editing={this.state.isEditing}
                                fieldValue={format(this.state.currentProduct.requestDate, this.dateFormatStr)}
                                fieldRef={'this.state.currentProduct.requestDate'}
                                onUpdated={this.fieldUpdated.bind(this, this.state.currentProduct, '')}
                            />
                            <ProductDetailDateField
                                fieldName={'Expected Close'} editing={this.state.isEditing}
                                fieldValue={format(this.state.currentProduct.returnDateExpected, this.dateFormatStr)}
                                fieldRef={'this.state.currentProduct.returnDateExpected'}
                                onUpdated={this.fieldUpdated.bind(this, this.state.currentProduct, '')}
                            />
                            <ProductDetailDateField
                                fieldName={'Actual Close'} editing={this.state.isEditing}
                                fieldValue={''}
                                fieldRef={'this.state.currentProduct.returnDateActual'}
                                onUpdated={this.fieldUpdated.bind(this, this.state.currentProduct, '')}
                            />
                            <Separator></Separator>
                            <div className={styles.gridRow}>
                                <Label>Attachments</Label>
                                <div className={styles.gridCol12}>
                                    <AttachmentsMgr
                                        currentAttachments={this.state.currentProduct.attachedDocuments}
                                    />
                                </div>
                            </div>
                        </div>
                    </FocusTrapZone>
                }
            </Panel>
        );
    }

    public componentWillReceiveProps(newProps: IProductDetailPaneProps): void {
        if (newProps.isVisible) {
            RecordService.GetProductByGUID(newProps.currentProductId)
            .then(d => {
                const stateObj: IProductDetailPaneState = {
                    isVisible: newProps.isVisible,
                    currentProduct: d,
                    isEditing: this.state.isEditing
                };
                this.setState(stateObj);
            })
            .catch(e => console.log(e));
        } else {
            const stateObj: IProductDetailPaneState = {
                isVisible: newProps.isVisible,
                currentProduct: null,
                isEditing: this.state.isEditing
            };
            this.setState(stateObj);
        }
    }

    private togglePanelVisibility(): void {
        this.props.paneCloseCallBack();
    }

    private toggleEditMode(): void {
        const stateObj: IProductDetailPaneState = {
            isEditing: !this.state.isEditing,
            isVisible: this.state.isVisible,
            currentProduct: this.state.currentProduct
        };
        this.setState(stateObj);
    }

    private fieldUpdated(fieldRef, fieldVal): void {
        console.log('xxxx: ', fieldRef, fieldVal);
    }
}

export interface IProductDetailFieldProps {
    fieldName: string;
    fieldValue: string;
    fieldRef: string;
    editing: boolean;
    editLines?: number;
    onUpdated: (newVal: string) => void;
}

export class ProductDetailTextField extends React.Component<IProductDetailFieldProps, {}> {
    render(): React.ReactElement<IProductDetailFieldProps> {
        return(
            <div className={`${styles.gridRow} ${styles.padTop2}`}>
                <div className={`${styles.gridCol11} ${styles.fieldValue}`}>
                    <Label>{this.props.fieldName}</Label>
                    {!this.props.editing && (
                        <Text>{this.props.fieldValue}</Text>
                    )}
                    {this.props.editing && (
                        <TextField
                            defaultValue={this.props.fieldValue}
                            multiline={this.props.editLines ? true : false}
                            rows={this.props.editLines ? this.props.editLines : 1}
                            onChange={this.fieldUpdated.bind(this)}
                        />
                    )}
                </div>
            </div>
        );
    }

    private fieldUpdated(ctrl): void {
        console.log('Field Updated', ctrl, this, this.props);
        this.props.onUpdated('NewValueHere');
    }
}

export interface IProductDetailDateFieldState {
    calendarVisible: boolean;
}

export class ProductDetailDateField extends React.Component<IProductDetailFieldProps, IProductDetailDateFieldState> {
    buttonRef: any;
    constructor(props: IProductDetailFieldProps) {
        super(props);
        this.buttonRef = React.createRef();
        this.state = { calendarVisible: false }
    }

    render(): React.ReactElement<IProductDetailFieldProps> {
        return(
            <div className={`${styles.gridRow} ${styles.padTop2}`} ref={''}>
                <div className={`${styles.gridCol11} ${styles.fieldValue}`}>
                    <Stack horizontal>
                        <Label>
                            {this.props.fieldName}
                        </Label>
                        {this.props.editing &&
                            <CalendarButton
                                dateVal={new Date(this.props.fieldValue)}
                                dateChangeCallback={this.updateValueFromCalendar.bind(this)}
                            />}
                    </Stack>
                    {!this.props.editing && (
                        <Text>{this.props.fieldValue}</Text>
                    )}
                    {this.props.editing && (
                        <TextField defaultValue={this.props.fieldValue} />
                    )}
                </div>
            </div>
        );
    }

    private updateValueFromCalendar(dateVal: Date): void {
        this.props.onUpdated(dateVal.toJSON());
    }
}

export interface ICalendarButtonProps {
    dateVal: Date;
    dateChangeCallback: (dateVal: string) => {};
}

export const CalendarButton: React.FunctionComponent<ICalendarButtonProps> = (props) => {
    const [selectedDate, setSelectedDate] = React.useState<Date>();
    const [showCalendar, { toggle: toggleShowCalendar, setFalse: hideCalendar }] = useBoolean(false);
    const buttonContainerRef = React.useRef<HTMLDivElement>(null);

    const onSelectDate = React.useCallback(
      (date: Date, dateRangeArray: Date[]): void => {
        setSelectedDate(date);
        hideCalendar();
        props.dateChangeCallback(date.toJSON())
      },
      [hideCalendar],
    );
  
    return (
      <div>
        <div ref={buttonContainerRef}>
            <IconButton iconProps={{iconName: 'calendar'}} className={styles.appIcon} title="" ariaLabel="" onClick={toggleShowCalendar} />
        </div>

        {showCalendar && (
          <Callout
            isBeakVisible={false}
            gapSpace={0}
            doNotLayer={false}
            target={buttonContainerRef}
            directionalHint={DirectionalHint.bottomLeftEdge}
            onDismiss={hideCalendar}
            setInitialFocus
          >
            <FocusTrapZone isClickableOutsideFocusTrap>
              <Calendar
                onSelectDate={onSelectDate}
                onDismiss={hideCalendar}
                isMonthPickerVisible
                value={selectedDate}
                highlightCurrentMonth
                isDayPickerVisible
                showGoToToday
              />
            </FocusTrapZone>
          </Callout>
        )}
      </div>
    );
  };
