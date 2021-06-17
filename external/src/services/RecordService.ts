import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import AppService from './AppService';
import { ISPService } from './ISPService';
import { MapperService } from './MapperService';
import { MockSPService } from './MockSPService';
import { SPService } from './SPService';
import { AttachmentModel } from '../models/AttachmentModel';
import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from './NotificationService';
import { ProductTypeModel } from '../models/ProductTypeModel';
import { task } from 'gulp';
import { TaskModel, TaskState } from '../models/TaskModel';

export interface IResult {
    productModel: ProductModel;
    resultStr: string;
}
export class RecordService {
    private static _prodService = new SPService();
    private static _mockService = new MockSPService();

    private static get spService(): ISPService {
        return AppService.AppSettings.isDebugging ? this._mockService : this._prodService;
    }

    public static async GetProducts(): Promise<Array<ProductModel>> {
        const spItems: Array<SpProductItem> = await this.spService.GetListItems(AppService.AppSettings.productListUrl);
        const spAttachments: Array<SpListAttachment> = await this.spService.GetAttachmentItems(AppService.AppSettings.documentListUrl);
        return MapperService.MapItemsToProducts(spItems.filter(f => f.Active), spAttachments);
    }

    public static async GetProductByGUID(guid: string): Promise<ProductModel> {
        const spItem: SpProductItem = await this.spService.GetListItemByGuid(AppService.AppSettings.productListUrl, guid);
        const spAttachments = await this.spService.GetAttachmentsForGuid(AppService.AppSettings.documentListUrl, guid);
        return MapperService.MapItemToProduct(spItem, spAttachments);
    }

    public static async GetAttachmentsForItem(guid: string): Promise<Array<AttachmentModel>> {
        const spItems = (await this.spService.GetAttachmentsForGuid(AppService.AppSettings.documentListUrl, guid))
            .map(d => MapperService.MapSpAttachmentToAttachment(d));
        return spItems;
    }

    public static async AddAttachmentsForItem(guid: string, files: FileList): Promise<Array<AttachmentModel>> {
        return this.spService.AddAttachment(AppService.AppSettings.documentListUrl, guid, files)
        .then(spAttachments => spAttachments.map(d => MapperService.MapSpAttachmentToAttachment(d)))
        .then(attachments => {
            AppService.ProductChanged(NotificationType.Create, 'Attachments: ');
            return Promise.resolve(attachments);
        })
        .catch(e => Promise.reject(e))
    }

    public static async SaveProduct(guid: string, newProduct: ProductModel): Promise<IResult> {
        const resultStr = guid ? 'Updated' : 'Created';
        const newItem = MapperService.MapProductToItem(newProduct);
        
        return (guid ? this.spService.UpdateListItem(AppService.AppSettings.productListUrl, newItem) : this.spService.AddListItem(AppService.AppSettings.productListUrl, newItem))
            .then((newItem: SpProductItem) => {
            AppService.ProductChanged(NotificationType.Create, newProduct.title);
            return this.spService.GetAttachmentsForGuid(AppService.AppSettings.documentListUrl, newItem.Guid)
            .then(attachments => {
                return Promise.resolve({
                    productModel: MapperService.MapItemToProduct(newItem, attachments),
                    resultStr: resultStr
                } as IResult);
            })
            .catch(e => Promise.reject(e));
        })
        .catch(e => Promise.reject(e));
    }

    public static async RemoveProduct(product: ProductModel): Promise<Array<ProductModel>> {
        return this.spService.RemoveListItem(AppService.AppSettings.productListUrl, MapperService.MapProductToItem(product))
        .then(async () => {
            const items = await this.GetProducts();
            return Promise.resolve(items);
        })
    }

    public static CopyAndSortArray<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
        const key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }

    public static GetUniqueValsForListField(fieldName: string): Promise<Array<string>> {
        return this.GetProducts()
        .then(items => items.map(d => d[fieldName]).filter((f, i, e) => e.indexOf(f) === i).sort())
        .then(results => Promise.resolve(results));
    }

    /** Creates a new empty product model but does not commit it to SharePoint */
    public static GetNewProductModel(productType?: string): ProductModel {
        const prod = new ProductModel({
            guid: null,
            requestDate: new Date().toJSON(),
            returnDateExpected: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 3)).toJSON(),
            status: ProductStatus.open,
            title: 'New Product',
            description: '',
            tasks: [],
            classificationId: AppService.AppSettings.classificationModels[0] ? AppService.AppSettings.classificationModels[0].classificationId : null
        });

        if (productType) {
            const temp = AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === productType ? n : t, undefined);
            if (temp) {
                prod.tasks = temp.defaultTeamTasks.map(d => {
                    return {
                        taskedTeamId: d.teamId,
                        taskDescription: d.taskDescription,
                        taskSuspense: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * d.taskSuspenseDays)).toJSON(),
                        taskState: TaskState.pending,
                        taskGuid: uuidv4()
                    } as TaskModel;
                });
                prod.productType = temp.typeId;
                prod.title = `NEW ${temp.typeName}`;
                prod.returnDateExpected = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * temp.defaultSuspenseDays)).toJSON();
                prod.description = temp.typeDescription;
            }
        }
        prod.eventType = AppService.AppSettings.eventTypes[0] ? AppService.AppSettings.eventTypes[0].eventTypeId : null;
        prod.eventDate = new Date(new Date(prod.returnDateExpected).getTime() + (1000 * 60 * 60 * 24 * 3)).toJSON();

        return prod;
    }
}
