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
            RequestDate: prod.requestDate ? prod.requestDate.toJSON() : null,
            ReturnDateActual: prod.publishedDate ? prod.publishedDate.toJSON() : null,
            AssignedTeamData: JSON.stringify(prod.tasks),
            ProductStatus: prod.status.toLowerCase(),
            ProductType: prod.productType,
            CategoryId: JSON.stringify(prod.categoryId),
            EventType: prod.eventType,
            EventDateStart: (prod.eventType && prod.eventDateStart) ? prod.eventDateStart.toJSON() : null,
            EventDateEnd: (prod.eventType && prod.eventDateEnd) ? prod.eventDateEnd.toJSON() : null,
            ClassificationId: prod.classificationId,
            RequestUrl: prod.requestUrl,
            Customer: prod.customer,
            Comments: JSON.stringify(prod.comments),
            Active: true
        });
    }

    public static MapItemToProduct(item: SpProductItem, attachments: Array<SpListAttachment>): ProductModel {
        return new ProductModel({
            id: item.Id,
            guid: item.Guid,
            title: item.Title,
            description: item.Description,
            requestor: item.Requestor,
            requestDate: item.RequestDate ? new Date(item.RequestDate) : null,
            publishedDate: item.ReturnDateActual ? new Date(item.ReturnDateActual) : null,
            tasks: JSON.parse(item.AssignedTeamData || '[]').map((d: any) => new TaskModel(d)),
            attachedDocuments: attachments.filter(f => f.LinkedProductGuid === item.Guid).map(d => this.MapSpAttachmentToAttachment(d)),
            status: ProductStatus[item.ProductStatus],
            productType: item.ProductType,
            categoryId: item.CategoryId,
            eventType: item.EventType,
            eventDateStart: item.EventDateStart ? new Date(item.EventDateStart) : null,
            eventDateEnd: item.EventDateEnd ? new Date(item.EventDateEnd) : null,
            classificationId: item.ClassificationId,
            requestUrl: item.RequestUrl,
            comments: JSON.parse(item.Comments || '[]').map((d: any) => new CommentsModel(d)),
            customer: item.Customer
        });
    }

    public static mapTeam(teamId: string): TeamModel {
        return AppService.AppSettings.teams.reduce((t: TeamModel, n: TeamModel) => n.teamId === teamId ? n : t, null);
    }

    public static MapItemsToProducts(items: Array<SpProductItem>, documents: Array<SpListAttachment>): Array<ProductModel> {
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
