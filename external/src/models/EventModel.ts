export class EventModel {
    public constructor(init?: Partial<EventModel>) {
        Object.assign(this, init);
    }

    /** GUID of the event type */
    eventTypeId: string;

    /** Pretty title for event */
    eventTitle: string;

    /** Abbreviated name for event type */
    eventShortName: string;

    /** Description of event */
    eventDescription: string;

    /** Background color of event on rollup view */
    eventBackgroundColor: string;

    /** Typical number of days from event-start to event-end */
    defaultEventLength: number;

    /** Wether this event type is actively used or not */
    active: boolean;
}
