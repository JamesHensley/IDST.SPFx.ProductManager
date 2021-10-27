import * as React from 'react';
import * as styles from '../ProductManager.module.scss';

import { DefaultButton, ICommandBarItemProps, IconButton, IPanelHeaderRenderer, Label, Panel, PanelType, Separator, Stack, Text } from '@fluentui/react';
import { ProductTypeModel } from '../../../../models/ProductTypeModel';

import AppService, { ICmdBarListenerProps } from '../../../../services/AppService';
import RecordService from '../../../../services/RecordService';
import { FormInputToggle } from '../FormComponents/FormInputToggle';
import { FormInputText } from '../FormComponents/FormInputText';
import { FormInputDropDown, KeyValPair } from '../FormComponents/FormInputDropDown';
import { FormInputColor } from '../FormComponents/FormInputColor';
import { ConfigDialogComponent } from '../FormComponents/ConfigDialogComponent';
import { TaskTemplate } from '../../../../models/TaskTemplate';
import TaskTemplateConfig from './TaskTemplateConfig';
import DocumentConfig from './DocumentConfig';
import { DocumentTemplate } from '../../../../models/DocumentTemplate';

export interface IProductTypeConfigProps { showInactive: boolean; }

export interface IProductTypeConfigState {
    draftModel: ProductTypeModel;
    showPane: boolean;
    isTeamDialogVisible: boolean;
    isDocDialogVisible: boolean;
}

export default class ProductTypeConfig extends React.Component <IProductTypeConfigProps, IProductTypeConfigState> {
    private hasUpdates = false;
    private menuReceiver = null;

    constructor(props: IProductTypeConfigProps) {
        super(props);
        this.state = {
            draftModel: null,
            showPane: false,
            isTeamDialogVisible: false,
            isDocDialogVisible: false
        };
    }

    public render(): React.ReactElement<IProductTypeConfigProps> {
        // <Label className={`${styles.pointer} ${styles.padTop0}`}>{d.active ? 'Active' : 'InActive'}</Label>
        return (
            <Stack className={styles.configZone} verticalFill={true}>
                <Label style={{ fontSize: '1.5rem' }}>Product Types</Label>
                <Stack horizontal wrap key={new Date().getTime()}>
                    {
                        AppService.AppSettings.productTypes
                        .filter(f => this.props.showInactive ? true : f.active)
                        .sort((a, b) => a.typeName > b.typeName ? 1 : (a.typeName < b.typeName ? -1 : 0))
                        .map(d => {
                            return (
                                <Stack.Item grow key={d.typeId} onClick={this.showPane.bind(this, d)}>
                                    <Stack className={styles.card} style={{ opacity: d.active ? 1 : 0.4 }}>
                                        <Label className={`${styles.pointer} ${styles.padBottom0}`}>{d.typeName}</Label>
                                    </Stack>
                                </Stack.Item>
                            );
                        })
                    }
                </Stack>
                {
                    this.state.draftModel &&
                    <Panel
                        className={styles.productDetailPane}
                        isHiddenOnDismiss={false}
                        isLightDismiss={!this.hasUpdates && !this.state.isTeamDialogVisible}
                        isOpen={this.state.showPane}
                        onDismiss={this.closePane.bind(this)}
                        closeButtonAriaLabel='Close'
                        type={PanelType.medium}
                        onRenderHeader={this.getPaneHeader.bind(this)}
                    >
                        <Stack>
                            <Stack.Item grow>
                                <FormInputText
                                    labelValue={'Type Name'} editing={true}
                                    fieldValue={this.state.draftModel.typeName}
                                    fieldRef={'typeName'}
                                    onUpdated={this.updateField.bind(this)}
                                />
                            </Stack.Item>
                            <Stack.Item grow>
                                <FormInputText
                                    labelValue={'Type Description'} editing={true}
                                    fieldValue={this.state.draftModel.typeDescription}
                                    fieldRef={'typeDescription'}
                                    onUpdated={this.updateField.bind(this)}
                                    editLines={4}
                                />
                            </Stack.Item>
                            <Stack horizontal tokens={{ childrenGap: 5 }}>
                                <FormInputColor
                                    key={new Date().getTime()}
                                    labelValue={'Product Color'} editing={true}
                                    fieldValue={this.state.draftModel.colorValue}
                                    fieldRef={'colorValue'}
                                    onUpdated={this.updateField.bind(this)}
                                />
                                <FormInputDropDown
                                    labelValue='Default Event Type'
                                    editing={true}
                                    fieldRef={'defaultEventType'}
                                    fieldValue={[this.state.draftModel.defaultEventType]}
                                    onUpdated={this.updateField.bind(this)}
                                    allowNull={true}
                                    options={
                                        AppService.AppSettings.eventTypes
                                        .map(d => {
                                            return {
                                                key: d.eventTypeId,
                                                value: d.eventTitle,
                                                selected: d.eventTypeId === this.state.draftModel.defaultEventType
                                            } as KeyValPair;
                                        })
                                    }
                                    disabledKeys={AppService.AppSettings.teams.filter(f => !f.active).map(d => d.teamId)}
                                />
                            </Stack>
                            <Separator />
                            <Stack horizontal tokens={{ childrenGap: 5 }}>
                                <Stack.Item grow>
                                    <Stack>
                                        <Stack horizontal tokens={{ childrenGap: 5 }}>
                                            <Stack.Item grow><Text>Team Tasks</Text></Stack.Item>
                                            <IconButton iconProps={{ iconName: 'add' }} className={styles.appIcon} title='' ariaLabel='' onClick={this.addTeamTask.bind(this)} />
                                        </Stack>
                                        {this.state.draftModel.defaultTeamTasks
                                        .sort((a,b) => a.taskOrder > b.taskOrder ? 1 : (a.taskOrder < b.taskOrder ? -1 : 0))
                                        .map((d,i,e) => <TaskTemplateConfig task={d} key={`${d.taskOrder}-${i}`} saveTask={this.updateTask.bind(this)} />)}
                                    </Stack>
                                </Stack.Item>
                                <Stack.Item grow>
                                    <Stack>
                                        <Stack horizontal>
                                            <Stack.Item grow><Text>Template Documents</Text></Stack.Item>
                                            <IconButton iconProps={{ iconName: 'add' }} className={styles.appIcon} title='' ariaLabel='' onClick={this.addDocTemplate.bind(this)} />
                                        </Stack>
                                        {this.state.draftModel.defaultTemplateDocs
                                        .sort((a,b) => a.destDocName > b.destDocName ? 1 : (a.destDocName < b.destDocName ? -1 : 0))
                                        .map((d,i,e) => <DocumentConfig model={d} key={i} saveModel={this.updateDoc.bind(this)} />)}
                                    </Stack>
                                </Stack.Item>
                            </Stack>
                        </Stack>
                        {
                            this.state.isTeamDialogVisible &&
                            <ConfigDialogComponent
                                key={new Date().getTime()}
                                optSelectedCallback={this.teamSelected.bind(this)}
                                title='Team Selector'
                                dropdownLabel='Team'
                                opts={
                                    AppService.AppSettings.teams
                                    .filter(f => f.active)
                                    .map(d => { return { key: d.teamId, text: d.name }; })
                                    .sort((a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0))
                                }
                                selectedOpt={''}
                                showInputText={true}
                                extraTextLabel={'Task Description'}
                                extraText={''}
                            />
                        }
                        {
                            this.state.isDocDialogVisible &&
                            <ConfigDialogComponent
                                key={new Date().getTime()}
                                optSelectedCallback={this.docSelected.bind(this)}
                                title='Document Selector'
                                dropdownLabel='Document'
                                opts={
                                    AppService.AppSettings.templateDocuments
                                    .map(d => { return { key: d.templateId, text: d.title }; })
                                    .sort((a, b) => a.text > b.text ? 1 : (a.text < b.text ? -1 : 0))
                                }
                                selectedOpt={''}
                                showInputText={true}
                                extraTextLabel={'Destination Document Name'}
                                extraText={''}
                            />
                        }
                    </Panel>
                }
            </Stack>
        );
    }

    public componentDidMount(): void {
        this.menuReceiver = this.cmdBarEvent.bind(this);
        this.menuReceiver = AppService.RegisterCmdBarListener({ callback: this.menuReceiver } as ICmdBarListenerProps);
    }

    public componentWillUnmount(): void {
        AppService.UnRegisterCmdBarListener(this.menuReceiver);
    }

    private cmdBarEvent(item: ICommandBarItemProps): Promise<void> {
        if (item['data-automation-id'] === 'newProductType') {
                const newRecord = RecordService.GetNewProductTypeModel();
                this.setState({ draftModel: newRecord, showPane: true });
        }
        return Promise.resolve();
    }

    private updateField(fieldVal: string, fieldRef: string): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new ProductTypeModel(), this.state.draftModel);
        newModel[fieldRef] = fieldVal;
        this.setState({ draftModel: newModel });
    }

    private updateTask(newTask: TaskTemplate): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new ProductTypeModel(), this.state.draftModel);
        newModel.defaultTeamTasks = this.state.draftModel.defaultTeamTasks
            .filter(f => f.taskId !== newTask.taskId)
            .concat(newTask);
        this.setState({ draftModel: newModel });
    }

    private updateDoc(newDoc: DocumentTemplate): void {
        this.hasUpdates = true;
        const newModel = Object.assign(new ProductTypeModel(), this.state.draftModel);
        newModel.defaultTemplateDocs = this.state.draftModel.defaultTemplateDocs
            .filter(f => f.docId !== newDoc.docId)
            .concat(newDoc)
            .sort((a, b) => a.destDocName > b.destDocName ? 1 : (a.destDocName < b.destDocName ? -1 : 0));
        this.setState({ draftModel: newModel });
    }

    private showPane(model: ProductTypeModel): void { this.setState({ showPane: true, draftModel: model }); }

    private closePane(ignoreChanges?: boolean): void {
        if (!this.hasUpdates || ignoreChanges) {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftModel: null });
        } else {
            this.saveProductType();
        }
    }

    private saveProductType(): void {
        const prodTypes = AppService.AppSettings.productTypes
            .filter(f => f.typeId !== this.state.draftModel.typeId)
            .concat(this.state.draftModel)
            .sort((a, b) => a.typeName > b.typeName ? 1 : (a.typeName < b.typeName ? -1 : 0));

        AppService.UpdateAppSetting({ productTypes: prodTypes })
        .then(newSettings => {
            this.hasUpdates = false;
            this.setState({ showPane: false, draftModel: null });
        })
        .catch(e => Promise.reject(e));
    }

    /** Returns a header for the detail pane with buttons */
    private getPaneHeader(props: IPanelHeaderRenderer, renderer: IPanelHeaderRenderer): JSX.Element {
        return (
            <div className={styles.panelHead}>
                <Stack>
                    <Stack.Item grow>
                        <Label style={{ fontSize: '1.5rem' }}>
                            {this.state.draftModel.typeName} [{this.state.draftModel.active ? 'Active' : 'InActive'}]
                        </Label>
                    </Stack.Item>
                    <Stack horizontal>
                        <Stack.Item grow>
                            <Stack horizontal tokens={{ childrenGap: 10 }}>
                                <DefaultButton onClick={this.saveProductType.bind(this)} disabled={!this.hasUpdates}>Save</DefaultButton>
                                <DefaultButton onClick={this.closePane.bind(this, true)}>Cancel</DefaultButton>
                            </Stack>
                        </Stack.Item>
                        <FormInputToggle
                            labelValue={'Active Event Type'}
                            fieldValue={this.state.draftModel.active}
                            fieldRef={'active'}
                            onUpdated={this.updateField.bind(this)}
                            oneRow={true}
                        />
                    </Stack>
                </Stack>
            </div>
        );
    }

    private addTeamTask(): void {
        this.setState({ isTeamDialogVisible: true, isDocDialogVisible: false });
    }

    private addDocTemplate(): void {
        this.setState({ isTeamDialogVisible: false, isDocDialogVisible: true });
    }

    private teamSelected(teamId: string, taskDescription?: string): void {
        this.hasUpdates = true;
        const newTask = new TaskTemplate({
            teamId: teamId,
            taskOrder: (this.state.draftModel.defaultTeamTasks || []).length,
            taskDescription: taskDescription ? taskDescription : 'New Task'
        });
        this.state.draftModel.defaultTeamTasks = [].concat.apply((this.state.draftModel.defaultTeamTasks || []), [newTask]);
        const newModel = Object.assign(new ProductTypeModel(), this.state.draftModel);
        this.setState({ draftModel: newModel, isTeamDialogVisible: false });
    }

    private docSelected(templateId: string, docName?: string): void {
        this.hasUpdates = true;
        const newDoc = new DocumentTemplate({
            templateId: templateId,
            destDocName: docName
        });
        this.state.draftModel.defaultTemplateDocs = [].concat.apply((this.state.draftModel.defaultTemplateDocs || []), [newDoc]);
        const newModel = Object.assign(new ProductTypeModel(), this.state.draftModel);
        this.setState({ draftModel: newModel, isDocDialogVisible: false });
    }
}
