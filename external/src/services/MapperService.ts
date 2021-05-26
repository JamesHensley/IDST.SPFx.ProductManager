import { SplitChunksPlugin } from 'webpack';
import { AttachmentModel } from '../models/AttachmentModel';
import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListItem } from '../models/SpListItem';
import { TaskModel } from '../models/TaskModel';
import { TeamModel } from '../models/TeamModel';
import AppService from './AppService';


export class MapperService {
    public static MapProductToItem(prod: ProductModel): SpListItem {
        // TODO: Finish this
        const listItem: SpListItem = {
            Id: prod.id,
            GUID: prod.guid,
            Title: prod.title,
            Description: prod.description,
            Requestor: prod.requestor,
            RequestDate: prod.requestDate,
            ReturnDateActual: prod.returnDateActual,
            ReturnDateExpected: prod.returnDateExpected,
            AttachmentFiles: [],
            AssignedTeamData: JSON.stringify(prod.tasks),
            ProductStatus: prod.status,
            ProductType: prod.productType
        };

        return listItem;
    }

    public static MapItemToProduct(item: SpListItem): ProductModel {
        const teamTasks: Array<TaskModel> = JSON.parse(item.AssignedTeamData ||  '[]');
        const allDocs = teamTasks.reduce((t: Array<string>, n: TaskModel) => [].concat.apply(t, n.taskFiles), []);
        const attachments: Array<AttachmentModel> = this.MapItemToAttachments(item);

        const pModel: ProductModel = {
            id: item.Id,
            guid: item.GUID,
            title: item.Title,
            description: item.Description,
            requestor: item.Requestor,
            requestDate: item.RequestDate,
            returnDateExpected: item.ReturnDateExpected,
            returnDateActual: item.ReturnDateActual,
            tasks: teamTasks,
            attachedDocumentUrls: allDocs,
            attachedDocuments: attachments,
            status: ProductStatus[item.ProductStatus],
            productType: item.ProductType
        };
        return pModel;
    }

    public static mapTeam(teamId: string): TeamModel {
        return AppService.AppSettings.teams.reduce((t: TeamModel, n: TeamModel) => n.id === teamId ? n : t, null);
    }

    public static MapItemsToProducts(items: Array<SpListItem>): Array<ProductModel> {
        const xx = items.map(d => this.MapItemToProduct(d));
        console.log(JSON.stringify(xx, null, '    '));
        return xx;
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
