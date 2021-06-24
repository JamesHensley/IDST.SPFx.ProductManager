export interface EventModel {
    /** GUID of the event type */
    eventTypeId: string;

    /** Pretty title for event */
    eventTitle: string;

    /** Description of event */
    eventDescription: string;

    /** Background color of event on rollup view */
    eventBackgroundColor: string;

    /** Typical number of days from event-start to event-end */
    defaultEventLength: number;
}
