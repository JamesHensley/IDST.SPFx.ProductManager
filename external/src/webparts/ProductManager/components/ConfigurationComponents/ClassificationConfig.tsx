import * as React from 'react';
import { Label, Panel, PanelType, Separator, Stack } from '@fluentui/react';
import * as styles from '../ProductManager.module.scss';
import AppService from '../../../../services/AppService';
import { FormInputText } from '../FormComponents/FormInputText';
import { ClassificationModel } from '../../../../models/ClassificationModel';

export interface IClassificationConfigProps { }

export interface IClassificationConfigState {
    draftModel: ClassificationModel;
    showPane: boolean;
}

export default class ClassificationConfig extends React.Component <IClassificationConfigProps, IClassificationConfigState> {
    private hasUpdates = false;

    constructor(props: IClassificationConfigProps) {
        super(props);
        this.state = {
            draftModel: null,
            showPane: false
        };
    }

    public render(): React.ReactElement<IClassificationConfigProps> {
        return (
            <>
                <Stack className={styles.configZone} verticalFill>
                    <Label style={{ fontSize: '1.5rem' }}>Classifications</Label>
                    {
                        AppService.AppSettings.classificationModels.map(d => {
                            return (
                                <Stack className={styles.card} key={d.classificationId}>
                                    <Label onClick={this.showPane.bind(this, d)} className={`${styles.pointer}`}>{d.classificationTitle}</Label>
                                </Stack>
                            );
                        })
                    }
                </Stack>
                { this.state.draftModel &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={true}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        headerText={`${this.state.draftModel.classificationTitle}`}
                    >
                        <FormInputText
                            labelValue={'Title'}
                            editing={true}
                            fieldValue={this.state.draftModel.classificationTitle}
                            fieldRef={'classificationTitle'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                        <FormInputText
                            labelValue={'Caveats'}
                            editing={true}
                            fieldValue={this.state.draftModel.classificationCaveats}
                            fieldRef={'classificationCaveats'}
                            onUpdated={this.updateVal.bind(this)}
                        />
                    </Panel>
                }
            </>
        );
    }

    private updateVal(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new ClassificationModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private showPane(classModel: ClassificationModel): void {
        this.setState({ draftModel: classModel, showPane: true });
    }

    private closePane(): void {
        if (this.hasUpdates) {
            this.saveClassifications();
        } else {
            this.setState({ draftModel: null, showPane: false });
        }
    }

    private saveClassifications(): void {
        const classifications = AppService.AppSettings.classificationModels
        .filter(f => f.classificationId !== this.state.draftModel.classificationId)
        .concat([this.state.draftModel])
        .sort((a, b) => a.classificationTitle > b.classificationTitle ? 1 : (a.classificationTitle < b.classificationTitle ? -1 : 0));

        AppService.UpdateAppSetting({ classificationModels: classifications })
        .then(newSettings => {
            this.hasUpdates = false;
            this.setState({ draftModel: null, showPane: false });
        })
        .catch(e => Promise.reject(e));
    }
}
