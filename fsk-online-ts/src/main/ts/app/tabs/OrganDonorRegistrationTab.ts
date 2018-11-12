import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {ButtonStyle, DialogOption, ErrorDisplay, PopupDialog, PopupDialogKind, RadioButton, RadioGroup} from "fmko-ts-widgets";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import FullAccessPermissionPanel from "../panels/organdonor-panels/FullAccessPermissionPanel";
import {IOrganDonor} from "../model/OrganDonorRegistrationType";
import DontKnowAccessPermissionPanel from "../panels/organdonor-panels/DontKnowAccessPermissionPanel";
import NoAccessPermissionPanel from "../panels/organdonor-panels/NoAccessPermissionPanel";
import FSKService from "../services/FSKService";
import ErrorUtil from "../util/ErrorUtil";
import FSKUserUtil from "../util/FSKUserUtil";
import SnackBar from "../elements/SnackBar";
import {ButtonStrategy} from "../model/ButtonStrategy";
import FSKButtonStrategy from "../model/FSKButtonStrategy";
import PatientUtil from "../util/PatientUtil";

export default class OrganDonorRegistrationTab extends TemplateWidget implements TabbedPanel {
    private ID = "OrganDonorRegistrationTab_TS";
    private TITLE = "Organdonorregister";
    private shown: boolean;
    private initialized: boolean;
    private organRegistrationChangeHandler: ValueChangeHandler<FSKTypes.OrganDonorRegistrationType>;

    private buttonStrategy: ButtonStrategy;

    private isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
    private isOdrCoordinator = FSKUserUtil.isFSKSupporter(this.moduleContext.getUserContext());

    private radioGroup: RadioGroup<Widget & IOrganDonor<FSKTypes.OrganDonorRegistrationType>>;

    public static deps = () => [IoC, "ModuleContext", FSKOrganDonorCache, FSKService, "RootElement"];

    constructor(protected container: IoC,
                private moduleContext: ModuleContext,
                private fskOrganDonorCache: FSKOrganDonorCache,
                private fskService: FSKService,
                private rootElement: HTMLElement) {
        super(container);
        this.element = document.createElement(`div`);
    }

    public init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        super.init();
    }

    public getTemplate(): string {
        return loadTemplate("tabs/organDonorRegistrationTab.html");
    }

    public setupBindings(): void {
        this.setupButtons();

        const fullAccessPermissionPanel = new FullAccessPermissionPanel();
        fullAccessPermissionPanel.setVisible(false);
        fullAccessPermissionPanel.setEnabled();
        fullAccessPermissionPanel.setUpdateButton(this.buttonStrategy.updateButton);
        fullAccessPermissionPanel.addStyleName('organ-donor-panel');
        const fullPermissionRadioButton = new RadioButton(fullAccessPermissionPanel, ``);
        fullPermissionRadioButton.setEnabled(this.isAdminUser);

        this.addAndReplaceWidgetByVarName(fullPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `full-permission-radio`);
        fullPermissionRadioButton.element.parentElement.style.paddingBottom = `6px`;
        this.addAndReplaceWidgetByVarName(fullAccessPermissionPanel, `full-permission-widget`);

        const limitedAccessPanel = this.container.resolve<LimitedAccessPermissionPanel>(LimitedAccessPermissionPanel);
        limitedAccessPanel.setVisible(false);
        limitedAccessPanel.setEnabled(this.isAdminUser);
        limitedAccessPanel.setUpdateButton(this.buttonStrategy.updateButton);
        limitedAccessPanel.addStyleName('organ-donor-panel');
        const limitedPermissionRadioButton = new RadioButton(limitedAccessPanel, ``);
        limitedPermissionRadioButton.setEnabled(this.isAdminUser);

        this.addAndReplaceWidgetByVarName(limitedPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `limited-permission-radio`);
        limitedPermissionRadioButton.element.parentElement.style.paddingBottom = `6px`;
        this.addAndReplaceWidgetByVarName(limitedAccessPanel, `limited-permission-widget`);

        const dontKnowPermissionPanel = new DontKnowAccessPermissionPanel();

        const dontKnowPermissionRadioButton = new RadioButton(
            dontKnowPermissionPanel,
            ``
        );
        dontKnowPermissionRadioButton.setEnabled(this.isAdminUser);
        this.addAndReplaceWidgetByVarName(dontKnowPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `dont-know-permission-radio`);
        dontKnowPermissionRadioButton.element.parentElement.style.paddingBottom = `6px`;

        const noAccessPermissionPanel = new NoAccessPermissionPanel();

        const restrictedPermissionRadioButton = new RadioButton(noAccessPermissionPanel, ``);
        restrictedPermissionRadioButton.setEnabled(this.isAdminUser);
        this.addAndReplaceWidgetByVarName(restrictedPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `restricted-permission-radio`);
        restrictedPermissionRadioButton.element.parentElement.style.paddingBottom = `6px`;

        this.radioGroup = new RadioGroup<Widget & IOrganDonor<FSKTypes.OrganDonorRegistrationType>>([
            fullPermissionRadioButton,
            limitedPermissionRadioButton,
            dontKnowPermissionRadioButton,
            restrictedPermissionRadioButton
        ], this.idSynthesizer, false);

        this.radioGroup.addValueChangeHandler(handler => {
            const value = handler.getValue();
            this.buttonStrategy.createButton.setEnabled(!!value);
            this.radioGroup.getRadioButtons().forEach(radioButton => {
                radioButton.getValue().setVisible(value === radioButton.getValue());
                this.buttonStrategy.updateButton.setEnabled(true);
            });
        });


        this.buttonStrategy.hideButtons();

        if (this.isAdminUser) {
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.createButton, `create-button`);
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.updateButton, `update-button`);
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.deleteButton, `delete-button`);
        }

        this.rootElement.appendChild(this.element);
    }

    public setupButtons(): void {
        this.buttonStrategy = new FSKButtonStrategy(this.moduleContext.getUserContext());

        const createHandler = async () => {
            try {
                if (this.radioGroup.getValue().getValue()) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.createOrganDonorRegisterForPatient(
                        this.moduleContext.getPatient().getCpr(),
                        this.radioGroup.getValue().getValue());
                    this.updateCache(true, `Organdonorregistering oprettet`);
                }
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };

        const updateHandler = async () => {
            try {
                if (this.radioGroup.getValue().getValue()) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.updateOrganDonorRegisterForPatient(
                        this.moduleContext.getPatient().getCpr(),
                        this.radioGroup.getValue().getValue());
                    this.updateCache(true, "Organdonorregistering opdateret");
                }
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };

        const deleteHandler = async () => {
            try {
                const yesOption = <DialogOption>{
                    buttonStyle: ButtonStyle.GREEN,
                    text: `Slet`,
                };

                const noOption = <DialogOption>{
                    buttonStyle: ButtonStyle.RED,
                    text: `Fortryd`,
                };
                const yesIsClicked = await PopupDialog.display(PopupDialogKind.WARNING, "Bekræft sletning",
                    "<p>Er du sikker på du vil slette patientens organdonorregistrering?</p>",
                    noOption, yesOption);
                if (yesIsClicked === yesOption) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.deleteOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
                    this.updateCache(false, `Organdonorregistering slettet`);
                }
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };

        this.buttonStrategy.updateButton.setEnabled(false);
        this.buttonStrategy.addHandlerForCreateButton(() => createHandler());
        this.buttonStrategy.addHandlerForEditButton(() => updateHandler());
        this.buttonStrategy.addHandlerForDeleteButton(() => deleteHandler());
    }

    public setData(organDonorRegistration: FSKTypes.OrganDonorRegistrationType): void {
        const type = organDonorRegistration && organDonorRegistration.permissionType;

        if (!type) {
            this.radioGroup.setValue(null);
        }
        const isAdmin = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        Widget.setVisible(this.getElementByVarName(`main-panel`), isAdmin || !!type);
        Widget.setVisible(this.getElementByVarName(`empty-panel`), !isAdmin && !type);
        this.getElementByVarName(`empty-state-patient`).innerText = PatientUtil.getFullName(this.moduleContext.getPatient());

        this.buttonStrategy.createButton.setEnabled(!!type);

        this.radioGroup.getRadioButtons().forEach(button => {
            if (button.getValue().getType() === type) {
                this.radioGroup.setValue(button.getValue(), false);
                button.getValue().setValue(organDonorRegistration, this.isOdrCoordinator);
                button.getValue().setVisible(true);
                button.setEnabled(true);
                button.getInput().checked = true;
            } else {
                button.getValue().setValue(null, this.isOdrCoordinator);
                button.getValue().setVisible(false);
                button.getInput().checked = false;
            }
        });
        organDonorRegistration ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
    }

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.fskOrganDonorCache.hasRegistration = hasRegistration;
        hasRegistration ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
        this.fskOrganDonorCache.organDonorRegister.setStale();
        SnackBar.show(snackbarText);
        this.buttonStrategy.enableButtons();
    };

    public tearDownBindings(): void {
        // unused
    }

    public getId(): string {
        return this.ID;
    }

    public getTitle(): string {
        return this.TITLE;
    }

    public setVisible(visible: boolean): any {
        super.setVisible(visible);

        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            this.addListeners();
            this.init();
        } else {
            this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return this.isOdrCoordinator || this.isAdminUser;
    }

    public applicationContextIdChanged(applicationContextId: string): any {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            if (applicationContextId === "PATIENT") {
                this.moduleContext.showTab(this.ID);
            } else {
                this.moduleContext.hideTab(this.ID);
            }
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 201;
    }

    public render() {
        const value = this.fskOrganDonorCache.organDonorRegister.getValue();
        const loading = this.fskOrganDonorCache.organDonorRegister.isLoading();
        const failed = this.fskOrganDonorCache.organDonorRegister.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {

        } else {
            this.setData(value);
        }
    }

    private addListeners() {
        if (this.fskOrganDonorCache.organDonorRegister.getValue() !== undefined) {
            this.render();
        }
        if (!this.organRegistrationChangeHandler) {
            this.organRegistrationChangeHandler = (() => {
                if (this.isVisible()) {
                    this.render();
                }
            });
            this.fskOrganDonorCache.organDonorRegister.addValueChangeHandler(this.organRegistrationChangeHandler);
        }
    }

    private removeListeners() {
        if (this.organRegistrationChangeHandler) {
            this.fskOrganDonorCache.organDonorRegister.removeValueChangeHandler(this.organRegistrationChangeHandler);
            this.organRegistrationChangeHandler = undefined;
        }
        if (this.initialized) {
            Widget.setVisible(this.getElementByVarName(`main-panel`), false);
            Widget.setVisible(this.getElementByVarName(`empty-panel`), false);
        }
    }

}