import { AttachmentModel } from '../models/AttachmentModel';
import { CommentsModel } from '../models/CommentsModel';
import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import { TaskModel } from '../models/TaskModel';
import { TeamModel } from '../models/TeamModel';
import AppService from './AppService';

export class MapperService {
    public static MapProductToItem(prod: ProductModel): SpProductItem {
        return new SpProductItem({
            Id: prod.id,
            Guid: prod.guid,
            Title: prod.title,
            Description: prod.description,
            Requestor: prod.requestor,
            RequestDate: prod.requestDate,
            ReturnDateActual: prod.returnDateActual,
            ReturnDateExpected: prod.returnDateExpected,
            AssignedTeamData: JSON.stringify(prod.tasks),
            ProductStatus: prod.status.toLowerCase(),
            ProductType: prod.productType,
            EventType: prod.eventType,
            EventDate: prod.eventDate,
            ClassificationId: prod.classificationId,
            RequestUrl: prod.requestUrl,
            Customer: prod.customer,
            Comments: JSON.stringify(prod.comments),
            Active: true
        });
    }

    public static MapItemToProduct(item: SpProductItem, attachments: Array<SpListAttachment>): ProductModel {
        const product = new ProductModel({
            id: item.Id,
            guid: item.Guid,
            title: item.Title,
            description: item.Description,
            requestor: item.Requestor,
            requestDate: item.RequestDate,
            returnDateExpected: item.ReturnDateExpected,
            returnDateActual: item.ReturnDateActual,
            tasks: JSON.parse(item.AssignedTeamData || '[]').map((d: any) => new TaskModel(d)),
            attachedDocuments: attachments.filter(f => f.LinkedProductGuid === item.Guid).map(d => this.MapSpAttachmentToAttachment(d)),
            status: ProductStatus[item.ProductStatus],
            productType: item.ProductType,
            eventType: item.EventType,
            eventDate: item.EventDate,
            classificationId: item.ClassificationId,
            requestUrl: item.RequestUrl,
            comments: JSON.parse(item.Comments || '[]').map(d => new CommentsModel(d)),
            customer: item.Customer
        });
        
        return product;
    }

    public static mapTeam(teamId: string): TeamModel {
        return AppService.AppSettings.teams.reduce((t: TeamModel, n: TeamModel) => n.id === teamId ? n : t, null);
    }

    public static MapItemsToProducts(items: Array<SpProductItem>, documents: Array<SpListAttachment>): Array<ProductModel> {
        // const docs = documents.map(d => this.MapItemToAttachments(d));
        return items.map(d => this.MapItemToProduct(d, documents));
    }

    public static MapSpAttachmentToAttachment(item: SpListAttachment): AttachmentModel {
        const attachment: AttachmentModel = new AttachmentModel({
            Id: item.Id,
            Title: item.Title,
            Author: item.Author.Name,
            Url: item.Url,
            Updated: item.Updated,
            LinkedProductGuid: item.LinkedProductGuid,
            Version: item.Version
        });

        return attachment;
    }
}
