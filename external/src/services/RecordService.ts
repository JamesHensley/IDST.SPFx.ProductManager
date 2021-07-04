import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import AppService from './AppService';
import { ISPService } from './ISPService';
import { MapperService } from './MapperService';
import { MockSPService } from './MockSPService';
import { SPService } from './SPService';
import { AttachmentModel } from '../models/AttachmentModel';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService, NotificationType } from './NotificationService';
import { TaskModel, TaskState } from '../models/TaskModel';
import addDays from 'date-fns/addDays';
import { EventModel } from '../models/EventModel';
import { TeamMemberModel, TeamMemberRole } from '../models/TeamModel';

export interface IResult {
    productModel: ProductModel;
    resultStr: string;
}



export class RecordService {
    private static _prodService = new SPService();
    private static _mockService = new MockSPService();
    private static listeners: Array<() => Promise<void>> = [];

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

    public static async AddAttachmentsForItem(product: ProductModel, files: FileList): Promise<Array<AttachmentModel>> {
        return this.spService.AddAttachment(AppService.AppSettings.documentListUrl, product.guid, files)
        .then(spAttachments => spAttachments.map(d => MapperService.MapSpAttachmentToAttachment(d)))
        .then(attachments => Promise.resolve(attachments))
        .catch(e => Promise.reject(e));
    }

    public static async SaveProduct(product: ProductModel, broadcastChange: boolean): Promise<IResult> {
        const resultStr = product.guid ? 'Updated' : 'Created';
        const newItem = MapperService.MapProductToItem(product);

        return (product.guid ? this.spService.UpdateListItem(AppService.AppSettings.productListUrl, newItem) : this.spService.AddListItem(AppService.AppSettings.productListUrl, newItem))
        .then((newItem: SpProductItem) => {
            // When we create a NEW item, we need to upload template documents here
            // newItem.Guid

            return this.spService.GetAttachmentsForGuid(AppService.AppSettings.documentListUrl, newItem.Guid)
            .then(attachments => {
                if (broadcastChange) { AppService.ProductChanged((product.guid ? NotificationType.Update : NotificationType.Create), product); }
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
        .catch(e => Promise.reject(e));
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
    public static GetNewProductModel(productType: string): ProductModel {
        const prodTypeModel = productType ? AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === productType ? n : t, null) : null;
        if (prodTypeModel) {
            const prod = new ProductModel({
                productType: prodTypeModel.typeId,
                guid: null,
                requestDate: new Date(),
                // returnDateExpected: addDays(new Date(), prodTypeModel.defaultSuspenseDays),
                status: ProductStatus.open,
                title: `NEW ${prodTypeModel.typeName}`,
                description: prodTypeModel.typeDescription,
                tasks: prodTypeModel.defaultTeamTasks.map(d => {
                    return {
                        taskedTeamId: d.teamId,
                        taskDescription: d.taskDescription,
                        taskSuspense: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * d.taskSuspenseDaysOffset)).toJSON(),
                        taskState: TaskState.pending,
                        taskGuid: uuidv4()
                    } as TaskModel;
                }),
                classificationId: AppService.AppSettings.classificationModels[0] ? AppService.AppSettings.classificationModels[0].classificationId : null,
                eventType: prodTypeModel.defaultEventType
            });

            const eventModel: EventModel = prodTypeModel.defaultEventType ? AppService.AppSettings.eventTypes.reduce((t, n) => n.eventTypeId === prodTypeModel.defaultEventType ? n : t, null) : null;
            // prod.eventDateStart = eventModel ? addDays(prod.returnDateExpected, 2) : null;
            prod.eventDateStart = eventModel ? addDays(new Date(), 14) : null;
            prod.eventDateEnd = eventModel ? addDays(prod.eventDateStart, eventModel.defaultEventLength) : null;

            return prod;
        }
        return null;
    }

    public static GetNewTeamMmeberModel(teamId: string): TeamMemberModel {
        return new TeamMemberModel({
            name: 'New Team Member',
            email: 'Member Email',
            role: TeamMemberRole.default,
            active: true,
            memberId: uuidv4()
        });
    }

    public static AddListRecord(listName: string, record: any): Promise<any> {
        const saveStr = JSON.stringify(record);

        return this.spService.SaveNewListRecord(listName, saveStr);
    }
}
