import { ProductModel } from '../models/ProductModel';
import { SpListItem } from '../models/SpListItem';
import AppService from './AppService';
import { ISPService } from './ISPService';
import { MapperService } from './MapperService';
import { MockSPService } from './MockSPService';
import { SPService } from './SPService';
import { Faker } from './FakerService';
import { AttachmentModel } from '../models/AttachmentModel';

export class RecordService {
    private static _prodService = new SPService();
    private static _mockService = new MockSPService();

    private static get spService(): ISPService {
        return AppService.AppSettings.isDebugging ? this._mockService : this._prodService;
    }

    public static async GetProducts(): Promise<Array<ProductModel>> {
        const spItems: Array<SpListItem> = await this.spService.GetListItems(AppService.AppSettings.productListUrl);
        return MapperService.MapItemsToProducts(spItems);
    }

    public static async GetProductByGUID(guid: string): Promise<ProductModel> {
        const spItem: SpListItem = await this.spService.GetListItemByGuid(AppService.AppSettings.productListUrl, guid);
        return MapperService.MapItemToProduct(spItem);
    }

    public static async GetAttachmentsForItem(guid: string): Promise<Array<AttachmentModel>> {
        const spItem: SpListItem = await this.spService.GetListItemByGuid(AppService.AppSettings.productListUrl, guid);
        return MapperService.MapItemToAttachments(spItem);
    }

    public static async UpdateProductByGuid(guid: string, newProduct: ProductModel): Promise<void> {
        const newItem = MapperService.MapProductToItem(newProduct);
        const spItem = await this.spService.UpdateListItemByGuid(AppService.AppSettings.productListUrl, guid, newItem)
        .then(newItem => {
            this.spService.GetListItems(AppService.AppSettings.productListUrl)
            .then(items => MapperService.MapItemsToProducts(items))
            .then(prods => AppService.ProductChanged(prods))
        });
    }
}
