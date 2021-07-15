import * as React from 'react';
import { Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import { EventModel } from '../../../../models/EventModel';
import AppService from '../../../../services/AppService';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import { FormInputText } from '../FormComponents/FormInputText';

export interface IEventConfigProps { }

export interface IEventConfigState {
    draftEvent: EventModel;
    showPane: boolean;
}

export default class EventConfig extends React.Component <IEventConfigProps, IEventConfigState> {
    private hasUpdates = false;

    constructor(props: IEventConfigProps) {
        super(props);
        this.state = {
            draftEvent: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<IEventConfigProps> {
        return (
            <Stack className={styles.configZone}>
                <Label style={{ fontSize: '1.5rem' }}>Event Types</Label>
                <Stack horizontal key={new Date().getTime()}>
                    {
                        AppService.AppSettings.eventTypes
                        .sort((a, b) => a.eventTitle > b.eventTitle ? 1 : (a.eventTitle < b.eventTitle ? -1 : 0))
                        .map(d => {
                            return (
                                <Stack.Item grow key={d.eventTypeId} onClick={this.showPane.bind(this, d)}>
                                    <Stack className={styles.card} style={{ opacity: d.active ? 1 : 0.4 }}>
                                        <Label className={`${styles.pointer} ${styles.padBottom0}`}>{d.eventTitle}</Label>
                                        <Label className={`${styles.pointer} ${styles.padTop0}`}>{d.active ? 'Active' : 'InActive'}</Label>
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
                        isLightDismiss={true}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        headerText={`${this.state.draftEvent.eventTitle} [${this.state.draftEvent.active ? 'Active' : 'InActive'}]`}
                    >
                        <Stack>
                            <Stack.Item align='end'>
                                <FormInputToggle
                                    labelValue={'Active EventType'}
                                    fieldValue={this.state.draftEvent.active}
                                    fieldRef={'active'}
                                    onUpdated={this.updateEventField.bind(this)}
                                    oneRow={true}
                                />
                            </Stack.Item>
                            <Separator />
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
                                    <FormInputText
                                        labelValue={'Event Color (CSS color string)'} editing={true}
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
    private closePane(): void {
        if (this.hasUpdates) {
            this.saveEvents();
        } else {
            this.setState({ showPane: false, draftEvent: null });
        }
    }

    private saveEvents(): void {
        const events = AppService.AppSettings.eventTypes
        .filter(f => f.eventTypeId !== this.state.draftEvent.eventTypeId)
        .concat([this.state.draftEvent])
        .sort((a, b) => a.eventTitle > b.eventTitle ? 1 : (a.eventTitle < b.eventTitle ? -1 : 0));

        AppService.UpdateAppSetting({ eventTypes: events })
        .then(newSettings => {
            this.setState({ showPane: false, draftEvent: null });
        })
        .catch(e => Promise.reject(e));
    }
}
