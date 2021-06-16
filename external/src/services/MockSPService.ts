import { SpListAttachment, SpProductItem } from '../models/SpListItem';
import AppService from './AppService';
import { Faker } from './FakerService';
import { FileService } from './FileService';
import { ISPService } from './ISPService';
import { v4 as uuidv4 } from 'uuid';

export class MockSPService implements ISPService {
    private _mockedProductItems: Array<SpProductItem> = [];
    private _mockedAttachmentItems: Array<SpListAttachment> = [];

    private get mockedProductItems(): Array<SpProductItem> {
        if (this._mockedProductItems.length === 0) {
            for (let x = 0; x < 4; x++) {
                this._mockedProductItems.push(Faker.CreateFakeItem());
            }
        }
        return this._mockedProductItems;
    }
    private set mockedProductItems(val: Array<SpProductItem>) {
        this._mockedProductItems = val;
    }
    private get mockedAttachmentItems(): Array<SpListAttachment> {
        if (this._mockedAttachmentItems.length === 0) {
            this._mockedProductItems.forEach(mP => {
                for (let x = 0; x < Math.round(Math.random() * 3); x++) {
                    this._mockedAttachmentItems.push(Faker.CreateFakeAttachment(mP.Guid));
                }
            });
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
        this.mockedProductItems = this.mockedProductItems.concat([item]);
        return Promise.resolve(item);
    }

    AddAttachment(listUrl: string, productGuid: string, fileList: FileList): Promise<Array<SpListAttachment>> {
        return Promise.all(
            Array.from(fileList).map(d => {
                return FileService.GetFileBuffer(d)
                .then(buff => {
                    // Now that we have an arrayBuffer, we can upload this into SP
                    return this.executeUpload(listUrl, productGuid, d.name, buff);
                })
            })
        )
    }

    UpdateListItemByGuid(listUrl: string, guid: string, item: SpProductItem): Promise<SpProductItem> {
        this.mockedProductItems = this.mockedProductItems.reduce((t, n) => n.Guid === guid ? t.concat([item]) : t.concat([n]), []);
        return Promise.resolve(item);
    }

    GetListItems(listUrl: string): Promise<Array<SpProductItem>> {
        console.log('MockSPService.GetListItems: ', this.mockedProductItems, this.mockedAttachmentItems);
        return Promise.resolve(this.mockedProductItems);
    }

    GetAttachmentItems(listUrl: string): Promise<Array<SpListAttachment>> {
        return new Promise<Array<SpListAttachment>>((resolve, reject) => {
            resolve(this.mockedAttachmentItems);
        });
    }

    GetListItemByGuid(listUrl: string, guid: string): Promise<SpProductItem> {
        return new Promise<SpProductItem>((resolve, reject) => {
            const prod = this.mockedProductItems.reduce((t,n) => n.Guid === guid ? n : t, null);
            resolve(prod);
        });
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
        debugger;
        const returnObj = Faker.CreateFakeAttachment(productGuid, fileName);
        this.mockedAttachmentItems.push(returnObj);
        return Promise.resolve(returnObj);
    }
}
