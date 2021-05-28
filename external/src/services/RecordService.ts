import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListItem } from '../models/SpListItem';
import AppService from './AppService';
import { ISPService } from './ISPService';
import { MapperService } from './MapperService';
import { MockSPService } from './MockSPService';
import { SPService } from './SPService';
import { Faker } from './FakerService';
import { AttachmentModel } from '../models/AttachmentModel';
import { v4 as uuidv4 } from 'uuid';

export class RecordService {
    private static _prodService = new SPService();
    private static _mockService = new MockSPService();

    private static get spService(): ISPService {
        return AppService.AppSettings.isDebugging ? this._mockService : this._prodService;
    }

    public static async GetProducts(): Promise<Array<ProductModel>> {
        let spItems: Array<SpListItem> = await this.spService.GetListItems(AppService.AppSettings.productListUrl);
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
        if (newProduct.newProduct) {
            await this.spService.AddListItem(AppService.AppSettings.productListUrl, newItem)
            .then(newItem => AppService.ProductChanged());
        }
        else {
            await this.spService.UpdateListItemByGuid(AppService.AppSettings.productListUrl, guid, newItem)
            .then(newItem => AppService.ProductChanged());
        }
    }

    public static CopyAndSortArray<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
        const key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }
    
    public static GetNewProductModel(): ProductModel {
        const prod = new ProductModel();
        prod.guid = uuidv4();
        prod.requestDate = new Date().toJSON();
        prod.returnDateExpected = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 3)).toJSON();
        prod.newProduct = true;
        prod.status = ProductStatus.open;
        prod.title = "New Product";
        return prod;
    }
}
