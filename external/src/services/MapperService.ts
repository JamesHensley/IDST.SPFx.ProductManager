import { AttachmentModel } from '../models/AttachmentModel';
import { ProductModel } from '../models/ProductModel';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';

export class MapperService {
    public static MapItemsToProducts(items: Array<SpProductItem>, documents: Array<SpListAttachment>): Array<ProductModel> {
        return items.map(d => this.MapItemToProduct(d, documents));
    }

    public static MapItemToProduct(item: SpProductItem, attachments: Array<SpListAttachment>): ProductModel {
        const oModel: ProductModel = new ProductModel(Object.assign(JSON.parse(item.ProdData), { spId: item.Id, spGuid: item.GUID, active: item.Active }));
        oModel.attachedDocuments = attachments.map(d => this.MapSpAttachmentToAttachment(d));
        return new ProductModel(oModel);
    }

    public static MapProductToItem(prod: ProductModel): SpProductItem {
        const oModel: SpProductItem = Object.assign(new SpProductItem(), { Id: prod.spId, GUID: prod.spGuid, Title: prod.title, ProdData: JSON.stringify(prod), Active: prod.active });
        return oModel;
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
