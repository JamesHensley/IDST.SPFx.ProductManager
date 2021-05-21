import * as React from 'react';
import * as styles from './ProductManager.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import TeamPanel from './TeamPanel';
import AppService from '../../../services/AppService';

export interface IProductManagerProps {

}

export default class ProductManager extends React.Component <IProductManagerProps, {}> {
  public render(): React.ReactElement<IProductManagerProps> {
    return(
      <div className={styles.grid}>
        <div className={styles.row}>
          <div className={styles.gridCol9}></div>
          <div className={styles.gridCol3}>
            <TeamPanel
              teams={AppService.AppSettings.teams}
            >
            </TeamPanel>
          </div>
        </div>
      </div>
    );
  }
}
