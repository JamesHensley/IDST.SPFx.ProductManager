import { AttachmentModel } from '../models/AttachmentModel';
import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import { TaskModel } from '../models/TaskModel';
import { TeamModel } from '../models/TeamModel';
import AppService from './AppService';

export class MapperService {
    public static MapProductToItem(prod: ProductModel): SpProductItem {
        // TODO: Finish this
        const listItem: SpProductItem = {
            Id: prod.id,
            GUID: prod.guid,
            Title: prod.title,
            Description: prod.description,
            Requestor: prod.requestor,
            RequestDate: prod.requestDate,
            ReturnDateActual: prod.returnDateActual,
            ReturnDateExpected: prod.returnDateExpected,
            AssignedTeamData: JSON.stringify(prod.tasks),
            ProductStatus: prod.status.toLowerCase(),
            ProductType: prod.productType
        };
        return listItem;
    }

    public static MapItemToProduct(item: SpProductItem, attachments: Array<SpListAttachment>): ProductModel {
        const teamTasks: Array<TaskModel> = JSON.parse(item.AssignedTeamData || '[]');
        const attachedDocs = attachments
            .filter(f => f.LinkedProductGuid === item.GUID)
            .map(d => this.MapSpAttachmentToAttachment(d));

        const prodTypeTitle = AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === item.ProductType ? n.typeName : t, '');
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
            attachedDocuments: attachedDocs,
            status: ProductStatus[item.ProductStatus],
            productType: item.ProductType,
            newProduct: false,
            filterString: `${item.Title} ${item.Description} ${prodTypeTitle}`
        };
        const taskedTeams = (teamTasks || []).map(d => d.taskedTeamId);
        pModel.filterString += AppService.AppSettings.teams.reduce((t, n) => taskedTeams.indexOf(n.id) >= 0 ? t + n.name : t, '');

        return pModel;
    }

    public static mapTeam(teamId: string): TeamModel {
        return AppService.AppSettings.teams.reduce((t: TeamModel, n: TeamModel) => n.id === teamId ? n : t, null);
    }

    public static MapItemsToProducts(items: Array<SpProductItem>, documents: Array<SpListAttachment>): Array<ProductModel> {
        // const docs = documents.map(d => this.MapItemToAttachments(d));
        return items.map(d => this.MapItemToProduct(d, documents));
    }

    public static MapSpAttachmentToAttachment(item: SpListAttachment): AttachmentModel {
        const attachment: AttachmentModel = {
            Id: item.Id,
            Title: item.Title,
            Author: item.Author.Name,
            Url: item.Url,
            Updated: item.Updated,
            Icon: 'NoIcon',
            LinkedProductGuid: item.LinkedProductGuid
        };

        return attachment;
    }
}
