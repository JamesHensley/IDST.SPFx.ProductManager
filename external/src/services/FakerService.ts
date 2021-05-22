import { SpListAttachment, SPAuthor, SpListItem } from '../models/SpListItem';
import { v4 as uuidv4 } from 'uuid';
import AppService from './AppService';
import { TeamModel } from '../models/TeamModel';

export class Faker {
    private static CreateFakeAttachment(): SpListAttachment {
        const author: string = ['Jimmy', 'Johnny "Two Fingers"', 'Vince', 'Fat Tony', 'Bob'][Math.round(Math.random() * 4)];
        const attachment: SpListAttachment = {
            Author: { Name: author } as SPAuthor,
            Id: uuidv4(),
            Updated: new Date(),
            Title: `Attached Document ${Math.round(Math.random() * 300)}`
        };
        return attachment;
    }

    public static CreateFakeItem(title?: string): SpListItem {
        // Randomly assign this to a team(s)
        let teams = AppService.AppSettings.teams
            .reduce((t: Array<TeamModel>, n: TeamModel) => Math.round(Math.random()) === 1 ? t.concat(n) : t, [])
            .map(d => d.id);
        teams = teams.length > 0 ? teams : [AppService.AppSettings.teams[0].id];

        const item: SpListItem = {
            Id: Math.floor(Math.random() * 300),
            Title: (title ? title : 'SP Product List Item'),
            GUID: uuidv4(),
            AttachmentFiles: [this.CreateFakeAttachment()],
            Description: 'Description of product being requested',
            RequestDate: new Date().toJSON(),
            ReturnDateExpected: new Date(new Date().getTime() + (Math.round(Math.random() * 10) * 1000 * 60 * 60 * 24)).toJSON(),
            ReturnDateActual: null,
            Requestor: 'Some Requestor',
            AssignedTeamIds: teams
        };
        return item;
    }
}
