import { ProductModel, ProductStatus } from '../models/ProductModel';
import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import AppService, { GlobalMsg } from './AppService';
import { ISPService } from './ISPService';
import { MapperService } from './MapperService';
import { MockSPService } from './MockSPService';
import { SPService } from './SPService';
import { AttachmentModel } from '../models/AttachmentModel';
import { v4 as uuidv4 } from 'uuid';
// import { NotificationService, ProductNotificationType } from './NotificationService';
import { TaskModel, TaskState } from '../models/TaskModel';
import addDays from 'date-fns/addDays';
import { EventModel } from '../models/EventModel';
import { TeamMemberModel, TeamMemberRole, TeamModel } from '../models/TeamModel';
import { ProductTypeModel } from '../models/ProductTypeModel';
import { ClassificationModel } from '../models/ClassificationModel';
import { format } from 'date-fns';
import { PirModel } from '../models/PirModel';
import { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';

export interface IResult {
    productModel: ProductModel;
    resultStr: string;
}

export default class RecordService {
    private static _prodService = new SPService();
    private static _mockService = new MockSPService();
    private static listeners: Array<() => Promise<void>> = [];

    private static get spService(): ISPService {
        return AppService.AppSettings.isDebugging ? this._mockService : this._prodService;
    }

    public static async GetProducts(): Promise<Array<ProductModel>> {
        const spItems: Array<SpProductItem> = await this.spService.GetListItems(AppService.AppSettings.miscSettings.productListTitle);
        const spAttachments: Array<SpListAttachment> = await this.spService.GetAttachmentItems(AppService.AppSettings.miscSettings.documentLibraryName);
        return MapperService.MapItemsToProducts(spItems.filter(f => f.Active), spAttachments);
    }

    public static async GetAttachmentsForItem(item: ProductModel): Promise<Array<AttachmentModel>> {
        const spItems = (await this.spService.GetAttachmentsForGuid(AppService.AppSettings.miscSettings.documentLibraryName, item.spGuid))
            .map(d => MapperService.MapSpAttachmentToAttachment(d));
        return spItems;
    }

    public static async AddAttachmentsForItem(product: ProductModel, files: FileList): Promise<void> {
        AppService.TriggerGlobalMessage(GlobalMsg.DocumentUploading);
        return this.spService.AddAttachment(AppService.AppSettings.miscSettings.documentLibraryName, product.spGuid, files)
        .then(() => {
            AppService.TriggerGlobalMessage(GlobalMsg.DocumentUploaded, [product, Array.from(files).map(d => d.name).join(',')]);
            return Promise.resolve();
        })
        .catch(e => {
            AppService.TriggerGlobalMessage(GlobalMsg.DocumentUploadFailed, [product, Array.from(files).map(d => d.name).join(',')]);
            return Promise.reject(e);
        });
    }

    public static async SaveProduct(product: ProductModel): Promise<IResult> {
        const resultStr = product.spId ? 'Updated' : 'Created';
        const newItem = MapperService.MapProductToItem(product);

        return (product.spId ? this.spService.UpdateListItem(AppService.AppSettings.miscSettings.productListTitle, newItem) : this.spService.AddListItem(AppService.AppSettings.miscSettings.productListTitle, newItem))
        .then((newItem: SpProductItem) => {
            // When we create a NEW item, we need to upload template documents here
            // UPLOAD DOCUMENTS
            return Promise.all(
                AppService.AppSettings.productTypes.reduce((t: ProductTypeModel, n) => n.typeId === product.productType ? n : t, null)
                .defaultTemplateDocs.map(d => Object.assign(d, {
                    srcDocUrl: AppService.AppSettings.templateDocuments.reduce((t: string, n) => n.templateId === d.templateId ? n.documentUrl : t, null)
                }))
                .map(d => product.spId ? Promise.resolve(true) : this.spService.CopyTemplateDocToProdDocs(d.srcDocUrl, d.destDocName, newItem.GUID)
                .then(d => Promise.resolve(d)
                .catch(e => Promise.reject(e)))
            ))
            .then(() => {
                return this.spService.GetAttachmentsForGuid(AppService.AppSettings.miscSettings.documentLibraryName, newItem.GUID)
                .then(attachments => {
                    return Promise.resolve({
                        productModel: MapperService.MapItemToProduct(newItem, attachments),
                        resultStr: resultStr
                    } as IResult);
                })
                .catch(e => Promise.reject(e));
            })
            .catch(e => Promise.reject(e));
            })
        .then(d => {
            AppService.TriggerGlobalMessage((product.spId ? GlobalMsg.ProductUpdated : GlobalMsg.ProductCreated), [product]);
            return Promise.resolve(d);
        })
        .catch(e => {
            AppService.TriggerGlobalMessage(GlobalMsg.ProductSaveFailed);
            return Promise.reject(e);
        });
    }

    public static async RemoveProduct(product: ProductModel): Promise<Array<ProductModel>> {
        return this.spService.RemoveListItem(AppService.AppSettings.miscSettings.productListTitle, MapperService.MapProductToItem(product))
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
    public static GetNewProductModel(productTypeId: string): ProductModel {
        const prodTypeModel = productTypeId ? AppService.AppSettings.productTypes.reduce((t,n) => n.typeId === productTypeId ? n : t, null) : null;
        if (prodTypeModel) {
            const prod = new ProductModel({
                spId: null,
                productType: prodTypeModel.typeId,
                guid: uuidv4(),
                requestDate: new Date(),
                status: ProductStatus.open,
                title: `NEW ${prodTypeModel.typeName}`,
                description: prodTypeModel.typeDescription,
                tasks: prodTypeModel.defaultTeamTasks
                .sort((a,b) => a.taskOrder > b.taskOrder ? 1 : (a.taskOrder < b.taskOrder ? -1 : 0))
                .map((d, i, e) => {
                    const taskSuspense = e.reduce((t, n, c) => c <= i ? addDays(t, n.typicalTaskLength) : t, new Date());
                    return this.GetNewTask(d.teamId, d.taskDescription, taskSuspense);
                }),
                classificationId: AppService.AppSettings.classificationModels[0] ? AppService.AppSettings.classificationModels[0].classificationId : null,
                eventType: prodTypeModel.defaultEventType,
                active: true
            });

            const eventModel: EventModel = prodTypeModel.defaultEventType ? AppService.AppSettings.eventTypes.reduce((t, n) => n.eventTypeId === prodTypeModel.defaultEventType ? n : t, null) : null;
            // prod.eventDateStart = eventModel ? addDays(prod.returnDateExpected, 2) : null;
            prod.eventDateStart = eventModel ? addDays(new Date(), 14) : null;
            prod.eventDateEnd = eventModel ? addDays(prod.eventDateStart, eventModel.defaultEventLength) : null;

            return prod;
        }
        return null;
    }

    public static GetNewTeamMemberModel(teamId: string): TeamMemberModel {
        return new TeamMemberModel({
            spId: '',
            name: 'New Team Member',
            email: 'Member Email',
            role: TeamMemberRole.default,
            active: true,
            teamId: teamId,
            memberId: uuidv4()
        });
    }

    public static GetNewTeamModel(): TeamModel {
        return new TeamModel({
            teamId: uuidv4(),
            name: 'New Team',
            shortName: 'NT',
            description: 'New team supporting something awesome',
            active: true,
            teamColor: 'rgb(100, 0, 0)'
        });
    }

    public static GetNewEventTypeModel(): EventModel {
        return new EventModel({
            active: true,
            eventTitle: 'New Event Type',
            eventDescription: 'Please enter a description of the event type',
            eventBackgroundColor: 'rgba(180, 180, 180, 1)',
            defaultEventLength: 3,
            eventTypeId: uuidv4()
        });
    }

    public static GetNewProductTypeModel(): ProductTypeModel {
        return new ProductTypeModel({
            active: true,
            typeId: uuidv4(),
            typeName: 'New Product Type',
            typeDescription: 'Please enter a description of this product-type',
            defaultTemplateDocs: [],
            defaultTeamTasks: [],
            colorValue: 'rgba(180, 180, 180, 1)',
            defaultEventType: null
        });
    }

    public static GetNewClassificationModel(): ClassificationModel {
        return new ClassificationModel({
            classificationId: uuidv4(),
            classificationTitle: 'New Title',
            classificationCaveats: 'Caveats'
        });
    }

    public static GetNewPirModel(): PirModel {
        return new PirModel({
            pirText: 'New PIR',
            pirDescription: 'New PIR description',
            pirId: uuidv4()
        });
    }

    public static GetNewTask(teamId: string, taskDescription?: string, taskSuspense?: Date): TaskModel {
        return new TaskModel({
            taskedTeamId: teamId,
            taskDescription: taskDescription || '',
            taskSuspense: taskSuspense ? taskSuspense.toJSON() : null,
            taskState: TaskState.Pending,
            taskGuid: uuidv4()
        });
    }

    public static SaveAppSettings(listName: string, record: IAppSettings, dataFieldName: string): Promise<IAppSettings> {
        return this.spService.SaveAppSettings(listName, record, dataFieldName)
        .then(d => Promise.resolve(d))
        .catch(e => Promise.reject(e));
    }
}
