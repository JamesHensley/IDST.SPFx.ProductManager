import { AttachmentModel } from '../models/AttachmentModel';
import { ProductModel } from '../models/ProductModel';
import { SpListItem } from '../models/SpListItem';
import { TaskModel } from '../models/TaskModel';
import { TeamModel } from '../models/TeamModel';
import AppService from './AppService';

export class MapperService {
    public static MapItemToProduct(item: SpListItem): ProductModel {
        const teamTasks: Array<TaskModel> = JSON.parse(item.AssignedTeamData);
        const allDocs = teamTasks.reduce((t: Array<string>, n: TaskModel) => [].concat.apply(t, n.taskFiles), []);
        const attachments: Array<AttachmentModel> = this.MapItemToAttachments(item);

        const pModel: ProductModel = {
            id: item.GUID,
            description: item.Description,
            requestor: item.Requestor,
            requestDate: new Date(item.RequestDate),
            returnDateExpected: new Date(item.ReturnDateExpected),
            returnDateActual: new Date(item.ReturnDateActual),
            tasks: teamTasks,
            attachedDocumentUrls: allDocs,
            attachedDocuments: attachments
        };
        return pModel;
    }

    public static mapTeam(teamId: string): TeamModel {
        return AppService.AppSettings.teams.reduce((t: TeamModel, n: TeamModel) => n.id === teamId ? n : t, null);
    }

    public static MapItemsToProducts(items: Array<SpListItem>): Array<ProductModel> {
        return items.map(d => this.MapItemToProduct(d));
    }

    public static MapItemToAttachments(item: SpListItem): Array<AttachmentModel> {
        return item.AttachmentFiles.map(d => {
            const attachment: AttachmentModel = {
                Id: d.Id,
                Title: d.Title,
                Author: d.Author.Name,
                Url: d.Url,
                Updated: d.Updated,
                Icon: 'NoIcon'
            };
            return attachment;
        });
    }
}
