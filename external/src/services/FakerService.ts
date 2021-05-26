import { SpListAttachment, SPAuthor, SpListItem } from '../models/SpListItem';
import { v4 as uuidv4 } from 'uuid';
import AppService from './AppService';
import { TeamModel } from '../models/TeamModel';
import { TaskModel, TaskState } from '../models/TaskModel';
import { addDays, addMilliseconds } from 'date-fns';

export class Faker {
    private static CreateFakeAttachment(url: string): SpListAttachment {
        const author: string = ['Jimmy', 'Johnny "Two Fingers"', 'Vince', 'Fat Tony', 'Bob'][Math.round(Math.random() * 4)];
        const attachment: SpListAttachment = {
            Author: { Name: author } as SPAuthor,
            Id: uuidv4(),
            Updated: new Date(),
            Title: `Attached Document ${Math.round(Math.random() * 300)}`,
            Url: url
        };
        return attachment;
    }

    private static CreateFakeTask(teamId: string): TaskModel {
        const state = TaskState[Math.round(Math.random() * 2)];
        const attachmentUrl = [ 'File1.txt', 'File2.txt', 'File3.txt', 'File4.txt', 'File5.txt' ][Math.round(Math.random() * 4)];
        const task: TaskModel = {
            taskedTeamId: teamId,
            taskDescription: 'Fake Tasking Desription',
            taskState: TaskState[state],
            taskFiles: [attachmentUrl]
        };
        return task;
    }

    public static CreateFakeItem(title?: string): SpListItem {
        // Randomly assign this to a team(s)
        const teams = AppService.AppSettings.teams
            .reduce((t: Array<TeamModel>, n: TeamModel) => Math.round(Math.random()) === 1 ? t.concat(n) : t, [])
            .map(d => d.id);

        const tasks: Array<TaskModel> = (teams.length > 0 ? teams : [AppService.AppSettings.teams[0].id])
            .map(d => this.CreateFakeTask(d));

        const allAttachments: Array<SpListAttachment> = tasks
            .reduce((t: Array<string>, n: TaskModel) => [].concat.apply(t, n.taskFiles), [])
            .map(d => this.CreateFakeAttachment(d));

        const reqDate = new Date().getTime() + (((Math.round(Math.random() == 0 ? -1 : 1)) * Math.round(Math.random() * 30)) * 1000 * 60 * 60 * 24);
        const endDate = new Date().getTime() + ((Math.round(Math.random() * 14) + 1) * 1000 * 60 * 60 * 24);

        const item: SpListItem = {
            Id: Math.floor(Math.random() * 300),
            Title: (title ? title : 'SP Product List Item'),
            GUID: uuidv4(),
            AttachmentFiles: allAttachments,
            Description: 'Description of product being requested',
            RequestDate: new Date(reqDate).toJSON(),
            ReturnDateExpected: new Date(endDate).toJSON(),
            ReturnDateActual: null,
            Requestor: 'Some Requestor',
            AssignedTeamData: JSON.stringify(tasks),
            ProductStatus: ['open', 'closed', 'canceled'][Math.round(Math.random() * 2)],
            ProductType: ['ProdType 1', 'ProdType 2', 'ProdType 3'][Math.round(Math.random() * 2)]
        };
        item.ProductStatus == 'Closed' ? new Date(new Date(item.RequestDate).getTime() + (3 * 24 * 60 * 60 * 1000)).toJSON() : null;

        return item;
    }
}
