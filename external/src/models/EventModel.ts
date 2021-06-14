export interface EventModel {
    /** GUID of the event type */
    eventTypeId: string;

    /** Pretty title for event */
    eventTitle: string;

    /** Description of event */
    eventDescription: string;

    /** Default number of days from start to finish */
    defaultEventSuspenseOffset: number;
}
