import { ProductModel } from '../models/ProductModel';
import { SpListItem } from '../models/SpListItem';
import { TeamModel } from '../models/TeamModel';
import AppService from './AppService';

export class MapperService {
    public static MapItemToProduct(item: SpListItem): ProductModel {
        const teams = item.AssignedTeamIds
            .map(d => this.mapTeam(d))
            .filter(f => f);

        const pModel: ProductModel = {
            id: item.GUID,
            description: item.Description,
            requestor: item.Requestor,
            requestDate: new Date(item.RequestDate),
            returnDateExpected: new Date(item.ReturnDateExpected),
            returnDateActual: new Date(item.ReturnDateActual),
            assignedTeams: teams,
            attachedDocumentUrls: []
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
