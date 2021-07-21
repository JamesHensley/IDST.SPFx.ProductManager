import { SPAuthor, SpListAttachment, SpProductItem } from '../models/SpListItem';
import AppService from './AppService';
import { Faker } from './FakerService';
import { FileService } from './FileService';
import { ISPService } from './ISPService';
import { v4 as uuidv4 } from 'uuid';
import { IAppSettings } from '../webparts/ProductManager/ProductManagerWebPart';

export class MockSPService implements ISPService {
    private _mockedProductItems: Array<SpProductItem> = [];
    private _mockedAttachmentItems: Array<SpListAttachment> = [];

    private get mockedProductItems(): Array<SpProductItem> {
        //  if (this._mockedProductItems.length === 0) {
        //    for (let x = 0; x < 10; x++) {
        //        this._mockedProductItems.push(Faker.CreateFakeItem());
        //    }
        //  }
        return this._mockedProductItems.filter(f => f.Active);
    }

    private set mockedProductItems(val: Array<SpProductItem>) {
        this._mockedProductItems = val;
    }

    private get mockedAttachmentItems(): Array<SpListAttachment> {
        if (this._mockedAttachmentItems.length === 0) {
            // this._mockedAttachmentItems = [];
        }

        return this._mockedAttachmentItems;
    }

    private set mockedAttachmentItems(val: Array<SpListAttachment>) {
        this._mockedAttachmentItems = val;
    }

    GetSingleFieldValues(listUrl: string, fieldName: string): Promise<Array<string>> {
        const retVal = this._mockedProductItems.map(d => d[fieldName]).filter((f, i, e) => e.indexOf(f) === i).sort();
        return Promise.resolve(retVal);
    }

    GetAttachmentsForGuid(listUrl: string, guid: string): Promise<Array<SpListAttachment>> {
        return Promise.resolve(this.mockedAttachmentItems.filter(f => f.LinkedProductGuid === guid));
    }

    AddListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem> {
        item.GUID = uuidv4();
        item.Id = Math.max(...this.mockedProductItems.map(d => d.Id)) + 1;
        this.mockedProductItems = this.mockedProductItems.concat([item]);
        return Promise.resolve(item);
    }

    UpdateListItem(listUrl: string, item: SpProductItem): Promise<SpProductItem> {
        this.mockedProductItems = this.mockedProductItems.reduce((t, n) => n.GUID === item.GUID ? t.concat([item]) : t.concat([n]), []);
// console.log('---------------------------------------');
// console.log(JSON.stringify(this.mockedProductItems, null, '    '));
console.log('MockSPService.UpdateListItem---------------------------------------');
        return Promise.resolve(item);
    }

    RemoveListItem(listUrl: string, item: SpProductItem): Promise<void> {
        this.mockedProductItems.forEach((i) => i.Active = i.GUID === item.GUID ? false : i.Active);
        return Promise.resolve();
    }

    GetListItems(listUrl: string): Promise<Array<SpProductItem>> {
        if (this.mockedProductItems.length === 0) {
            return fetch(`/dist/${AppService.AppSettings.miscSettings.productListTitle}`)
            .then(d => d.json())
            .then(d => d.map(p => new SpProductItem(p)))
            .then(d => {
                this._mockedProductItems = d;
                return Promise.resolve(this.mockedProductItems);
            })
            .catch(e => Promise.reject(e));
        } else {
            return Promise.resolve(this.mockedProductItems);
        }
    }

    AddAttachment(listUrl: string, productGuid: string, fileList: FileList): Promise<Array<SpListAttachment>> {
        return Promise.all(
            Array.from(fileList).map(d => {
                return FileService.GetFileBuffer(d)
                .then(buff => {
                    // Now that we have an arrayBuffer, we can upload this into SP
                    return this.executeUpload(listUrl, productGuid, d.name, buff);
                })
                .catch(e => Promise.reject(e));
            })
        );
    }

    GetAttachmentItems(listUrl: string): Promise<Array<SpListAttachment>> {
        return new Promise<Array<SpListAttachment>>((resolve, reject) => {
            resolve(this.mockedAttachmentItems);
        });
    }

    GetListItemByGuid(listUrl: string, guid: string): Promise<SpProductItem> {
        return new Promise<SpProductItem>((resolve, reject) => {
            const prod = this.mockedProductItems.reduce((t,n) => n.GUID === guid ? n : t, null);
            resolve(prod);
        });
    }

    CopyFile(srcUrl: string, destUrl: string, suffix: string): Promise<boolean> {
        console.log('MockSPService.CopyFile: ', srcUrl, destUrl, suffix);
        const dest: string = destUrl.split('.').map((d, i, e) => (i === e.length - 2) ? d += suffix : d).join('.');

        this._mockedAttachmentItems.push(new SpListAttachment({
            Id: '',
            Title: '',
            Updated: new Date(),
            Author: new SPAuthor({ Name: AppService.CurrentSpUser.displayName, Email: AppService.CurrentSpUser.email }),
            Url: dest,
            Version: 1,
            LinkedProductGuid: suffix
        }));
        return Promise.resolve(true);
    }

    SaveAppSettings(listTitle: string, listRecord: IAppSettings): Promise<IAppSettings> {
        return Promise.resolve(listRecord);
    }

    private executeUpload(listUrl: string, productGuid: string, fileName: string, buff: ArrayBuffer): Promise<SpListAttachment> {
        /*
        var result: any = {
            d: {
                GUID: uuidv4(),
                ServerRelativeUrl: `${listUrl}/${fileName}`,
                Modified: new Date().toJSON()
            }
        };
        const returnObj = new SpListAttachment({
            Id: result.d.GUID,
            Author: AppService.CurrentSpUser,
            LinkedProductGuid: productGuid,
            Title: fileName,
            Url: result.d.ServerRelativeUrl,
            Version: 1,
            Updated: result.d.Modified
        });
        */
        const returnObj = Faker.CreateFakeAttachment(productGuid, fileName);
        this.mockedAttachmentItems.push(returnObj);
        return Promise.resolve(returnObj);
    }
}
