import { ProductModel } from '../models/ProductModel';
import { SpListItem } from '../models/SpListItem';
import { TaskModel } from '../models/TaskModel';
import { TeamModel } from '../models/TeamModel';
import AppService from './AppService';

export class MapperService {
    public static MapItemToProduct(item: SpListItem): ProductModel {
        console.log('Mapper.MapItemToProduct:  ', item);

        const teamTasks: Array<TaskModel> = JSON.parse(item.AssignedTeamData);
        const allDocs = teamTasks.reduce((t: Array<string>, n: TaskModel) => [].concat.apply(t, n.taskFiles), []);

        const pModel: ProductModel = {
            id: item.GUID,
            description: item.Description,
            requestor: item.Requestor,
            requestDate: new Date(item.RequestDate),
            returnDateExpected: new Date(item.ReturnDateExpected),
            returnDateActual: new Date(item.ReturnDateActual),
            tasks: teamTasks,
            attachedDocumentUrls: allDocs,
            attachedDocuments: item.AttachmentFiles
        };
        return pModel;
    }

    public static mapTeam(teamId: string): TeamModel {
        return AppService.AppSettings.teams.reduce((t: TeamModel, n: TeamModel) => n.id === teamId ? n : t, null);
    }

    public static MapItemsToProducts(items: Array<SpListItem>): Array<ProductModel> {
        return items.map(d => this.MapItemToProduct(d));
    }
}
