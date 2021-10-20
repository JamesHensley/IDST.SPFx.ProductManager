import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { DefaultButton, FocusTrapZone, ICommandBarItemProps, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import { EventModel } from '../../../../models/EventModel';
import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import { FormInputText } from '../FormComponents/FormInputText';
import RecordService from '../../../../services/RecordService';
import { FormInputColor } from '../FormComponents/FormInputColor';

export interface IEventConfigProps { showInactive: boolean; }

export interface IEventConfigState {
    draftEvent: EventModel;
    showPane: boolean;
}

export default class EventConfig extends React.Component <IEventConfigProps, IEventConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;

    constructor(props: IEventConfigProps) {
        super(props);
        this.state = {
            draftEvent: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<IEventConfigProps> {
        // <Label className={`${styles.pointer} ${styles.padTop0}`}>{d.active ? 'Active' : 'InActive'}</Label>
        return (
            <Stack className={styles.configZone} verticalFill={true}>
                <Label style={{ fontSize: '1.5rem' }}>Event Types</Label>
                <Stack key={new Date().getTime()}>
                    {
                        AppService.AppSettings.eventTypes
                        .filter(f => this.props.showInactive ? true : f.active)
                        .sort((a, b) => a.eventTitle > b.eventTitle ? 1 : (a.eventTitle < b.eventTitle ? -1 : 0))
                        .map(d => {
                            return (
                                <Stack.Item grow key={d.eventTypeId} onClick={this.showPane.bind(this, d)}>
                                    <Stack className={styles.card} style={{ opacity: d.active ? 1 : 0.4 }}>
                                        <Label className={`${styles.pointer} ${styles.padBottom0}`}>{d.eventTitle}</Label>
                                    </Stack>
                                </Stack.Item>
                            );
                        })
                    }
                </Stack>
                {
                    this.state.draftEvent &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={!this.hasUpdates}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        onRenderHeader={this.getPaneHeader.bind(this)}
                    >
                        <Stack>
                            <Stack.Item grow>
                                <FormInputText
                                    labelValue={'Event Title'} editing={true}
                                    fieldValue={this.state.draftEvent.eventTitle}
                                    fieldRef={'eventTitle'}
                                    onUpdated={this.updateEventField.bind(this)}
                                />
                            </Stack.Item>
                            <Stack.Item grow>
                                <FormInputText
                                    labelValue={'Event Description'} editing={true}
                                    fieldValue={this.state.draftEvent.eventDescription}
                                    fieldRef={'eventDescription'}
                                    onUpdated={this.updateEventField.bind(this)}
                                    editLines={4}
                                />
                            </Stack.Item>
                            <Stack horizontal tokens={{ childrenGap: 5 }}>
                                <Stack.Item grow>
                                    <FormInputText
                                        labelValue={'Default Event Length (days)'} editing={true}
                                        fieldValue={this.state.draftEvent.defaultEventLength.toString()}
                                        fieldRef={'defaultEventLength'}
                                        onUpdated={this.updateEventField.bind(this)}
                                    />
                                </Stack.Item>
                                <Stack.Item grow>
                                    <FormInputColor
                                        key={new Date().getTime()}
                                        labelValue={'Event Color'} editing={true}
                                        fieldValue={this.state.draftEvent.eventBackgroundColor}
                                        fieldRef={'eventBackgroundColor'}
                                        onUpdated={this.updateEventField.bind(this)}
                                    />
                                </Stack.Item>
                            </Stack>
                        </Stack>
                    </Panel>
                }
            </Stack>
        );
    }

    public componentDidMount(): void {
        this.menuReceiver = this.cmdBarEvent.bind(this);
        this.menuReceiver = AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);
    }
    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.menuReceiver);
    }
    private cmdBarEvent(item: ICommandBarItemProps): Promise<void> {
        if (item['data-automation-id'] === 'newEventType') {
                const newRecord = RecordService.GetNewEventTypeModel();
                this.setState({ draftEvent: newRecord, showPane: true });
        }
        return Promise.resolve();
    }

    private updateEventField(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newTeam = Object.assign(new EventModel(), this.state.draftEvent);
        switch (typeof this.state.draftEvent[fieldRef]) {
            case 'number':
                newTeam[fieldRef] = parseInt(fieldVal, 10);
                break;
            default:
                newTeam[fieldRef] = fieldVal;
                break;
        }
        this.setState({ draftEvent: newTeam });
    }

    private showPane(model: EventModel): void { this.setState({ showPane: true, draftEvent: model }); }
    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftEvent: null });
        } else {
            this.saveEvents();
        }
    }

    private saveEvents(): void {
        const events = AppService.AppSettings.eventTypes
        .filter(f => f.eventTypeId !== this.state.draftEvent.eventTypeId)
        .concat(this.state.draftEvent)
        .sort((a, b) => a.eventTitle > b.eventTitle ? 1 : (a.eventTitle < b.eventTitle ? -1 : 0));

        AppService.UpdateAppSetting({ eventTypes: events })
        .then(newSettings => {
            this.setState({ showPane: false, draftEvent: null });
        })
        .catch(e => Promise.reject(e));
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftEvent.eventTitle} [{this.state.draftEvent.active ? 'Active' : 'InActive'}]
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveEvents.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                        <FormInputToggle
                            labelValue={'Active Event Type'}
                            fieldValue={this.state.draftEvent.active}
                            fieldRef={'active'}
                            onUpdated={this.updateEventField.bind(this)}
                            oneRow={true}
                        />
                    </Stack>
                </Stack>
            </div>
        );
    }
}
