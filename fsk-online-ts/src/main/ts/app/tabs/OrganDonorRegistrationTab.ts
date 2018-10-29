import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {
    ButtonStyle,
    DialogOption,
    ErrorDisplay,
    PopupDialog,
    PopupDialogKind,
    RadioButton,
    RadioGroup
} from "fmko-ts-widgets";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import FullAccessPermissionPanel from "../panels/organdonor-panels/FullAccessPermissionPanel";
import {IOrganDonor} from "../model/OrganDonorRegistrationType";
import DontKnowAccessPermissionPanel from "../panels/organdonor-panels/DontKnowAccessPermissionPanel";
import NoAccessPermissionPanel from "../panels/organdonor-panels/NoAccessPermissionPanel";
import FSKService from "../services/FSKService";
import SDSButton from "../elements/SDSButton";
import ErrorUtil from "../util/ErrorUtil";
import FSKUserUtil from "../util/FSKUserUtil";

export default class OrganDonorRegistrationTab extends TemplateWidget implements TabbedPanel {
    private ID = "OrganDonorRegistrationTab_TS";
    private TITLE = "Organdonorregister";
    private shown: boolean;
    private initialized: boolean;
    private organRegistrationChangeHandler: ValueChangeHandler<FSKTypes.OrganDonorRegistrationType>;

    private createButton: SDSButton;
    private updateButton: SDSButton;
    private deleteButton: SDSButton;

    private isAdminUser = this.moduleContext.getUserContext().isAdministratorLogin();

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
        const fullAccessPermissionPanel = new FullAccessPermissionPanel();
        fullAccessPermissionPanel.setVisible(false);
        fullAccessPermissionPanel.setEnabled(this.isAdminUser);
        fullAccessPermissionPanel.addStyleName('organ-donor-panel');
        const fullPermissionRadioButton = new RadioButton(fullAccessPermissionPanel, ``);
        fullPermissionRadioButton.setEnabled(this.isAdminUser);

        this.addAndReplaceWidgetByVarName(fullPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `full-permission-radio`);
        fullPermissionRadioButton.element.parentElement.style.paddingBottom = `6px`;
        this.addAndReplaceWidgetByVarName(fullAccessPermissionPanel, `full-permission-widget`);

        const limitedAccessPanel = this.container.resolve<LimitedAccessPermissionPanel>(LimitedAccessPermissionPanel);
        limitedAccessPanel.setVisible(false);
        limitedAccessPanel.setEnabled(this.isAdminUser);
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
            this.createButton.setEnabled(!!value);
            this.radioGroup.getRadioButtons().forEach(radioButton => {
                radioButton.getValue().setVisible(value === radioButton.getValue());
            });
        });

        this.createButton = new SDSButton("Opret registrering", "primary", async () => {
            try {
                if (this.radioGroup.getValue().getValue()) {
                    await this.fskService.createOrganDonorRegisterForPatient(
                        this.moduleContext.getPatient().getCpr(),
                        this.radioGroup.getValue().getValue());
                    this.updateCache(true);
                }
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.updateButton = new SDSButton("Opdatér", "primary", async () => {
            try {
                await this.fskService.updateOrganDonorRegisterForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.radioGroup.getValue().getValue());
                this.updateCache(true);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.deleteButton = new SDSButton("Slet registrering", "danger", async () => {
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
                        await this.fskService.deleteOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
                        this.updateCache(false);
                    }
                } catch (error) {
                    ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
                }
        });

        this.hideButtons();

        if (this.isAdminUser) {
            this.addAndReplaceWidgetByVarName(this.createButton, `create-button`);
            this.addAndReplaceWidgetByVarName(this.updateButton, `update-button`);
            this.addAndReplaceWidgetByVarName(this.deleteButton, `delete-button`);
        }

        this.rootElement.appendChild(this.element);
    }

    public setData(organDonorRegistration: FSKTypes.OrganDonorRegistrationType): void {
        const type = organDonorRegistration && organDonorRegistration.permissionType;

        if (!type) {
            this.radioGroup.setValue(null);
        }

        this.createButton.setEnabled(!!type);

        this.radioGroup.getRadioButtons().forEach(button => {
            if (button.getValue().getType() === type) {
                this.radioGroup.setValue(button.getValue(), false);
                button.getValue().setValue(organDonorRegistration);
                button.getValue().setVisible(true);
                button.getInput().checked = true;
            } else {
                button.getValue().setValue(null);
                button.getValue().setVisible(false);
                button.getInput().checked = false;
            }
        });
        this.setCreateMode(!organDonorRegistration);
    }

    public hideButtons() {
        this.createButton.setVisible(false);
        this.updateButton.setVisible(false);
        this.deleteButton.setVisible(false);
    }

    public setCreateMode(isCreateMode: boolean) {
        const isFSKAdmin = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        this.createButton.setVisible(isCreateMode && isFSKAdmin);
        this.updateButton.setVisible(!isCreateMode && isFSKAdmin);
        this.deleteButton.setVisible(!isCreateMode && isFSKAdmin);
    }

    public updateCache(hasRegistration: boolean) {
        this.fskOrganDonorCache.hasRegistration = hasRegistration;
        this.setCreateMode(!hasRegistration);
        this.fskOrganDonorCache.organDonorRegister.setStale();
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

    setVisible(visible: boolean): any {
        super.setVisible(visible);

        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            this.addListeners();
            this.init();
            this.render();
        } else {
            this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        const hasOrganDonorRights = FSKUserUtil.isFSKAdmin(userContext);

        const isCoodinator = FSKUserUtil.isFSKSupporter(userContext) && !hasOrganDonorRights;
        return isCoodinator || hasOrganDonorRights;
    }

    public applicationContextIdChanged(applicationContextId: string): any {
        if (applicationContextId === "PATIENT") {
            this.moduleContext.showTab(this.ID);
        } else {
            this.moduleContext.hideTab(this.ID);
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
    }

}