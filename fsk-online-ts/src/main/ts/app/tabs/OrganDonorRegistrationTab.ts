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
    RadioGroup,
    TextBoxField
} from "fmko-ts-widgets";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import FullAccessPermissionPanel from "../panels/organdonor-panels/FullAccessPermissionPanel";
import FSKService from "../services/FSKService";
import ErrorUtil from "../util/ErrorUtil";
import FSKUserUtil from "../util/FSKUserUtil";
import SnackBar from "../elements/SnackBar";
import {ButtonStrategy} from "../model/ButtonStrategy";
import FSKButtonStrategy from "../model/FSKButtonStrategy";
import PatientUtil from "../util/PatientUtil";
import moment from "moment";

export default class OrganDonorRegistrationTab extends TemplateWidget implements TabbedPanel {
    private ID = "OrganDonorRegistrationTab_TS";
    private TITLE = "Organdonorregister";
    private shown: boolean;
    private initialized: boolean;
    private organRegistrationChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<FSKTypes.OrganDonorRegistrationType>>;
    private registrationDateTextBox: TextBoxField;

    private buttonStrategy: ButtonStrategy;

    private isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
    private isOdrCoordinator = FSKUserUtil.isFSKSupporter(this.moduleContext.getUserContext());

    private fullAccessPanel: FullAccessPermissionPanel;
    private limitedAccessPanel: LimitedAccessPermissionPanel;
    private radioGroup: RadioGroup<FSKTypes.OrganDonorPermissionType>;
    
    public static deps = () => [IoC, "ModuleContext", FSKOrganDonorCache, FSKService, "RootElement"];

    constructor(protected container: IoC,
                private moduleContext: ModuleContext,
                private fskOrganDonorCache: FSKOrganDonorCache,
                private fskService: FSKService,
                private rootElement: HTMLElement) {
        super(container);
        this.element = document.createElement("div");
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

        this.fullAccessPanel = new FullAccessPermissionPanel();
        this.fullAccessPanel.setVisible(false);
        this.fullAccessPanel.setEnabled();
        this.fullAccessPanel.setUpdateButton(this.buttonStrategy.updateButton);
        this.fullAccessPanel.addStyleName('organ-donor-panel');
        const fullPermissionWithResearchRadioButton = new RadioButton<FSKTypes.OrganDonorPermissionType>("FULL_WITH_RESEARCH", "");
        fullPermissionWithResearchRadioButton.setEnabled(this.isAdminUser);
        const fullPermissionRadioButton = new RadioButton<FSKTypes.OrganDonorPermissionType>("FULL", "");
        fullPermissionRadioButton.setEnabled(this.isAdminUser);

        this.addAndReplaceWidgetByVarName(fullPermissionWithResearchRadioButton.getWrappedButton(this.idSynthesizer.createId()), "full-permission-with-research-radio");
        fullPermissionWithResearchRadioButton.element.parentElement.style.paddingBottom = "6px";
        this.addAndReplaceWidgetByVarName(fullPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), "full-permission-radio");
        fullPermissionRadioButton.element.parentElement.style.paddingBottom = "6px";
        this.addAndReplaceWidgetByVarName(this.fullAccessPanel, "full-permission-widget");

        this.limitedAccessPanel = this.container.resolve<LimitedAccessPermissionPanel>(LimitedAccessPermissionPanel);
        this.limitedAccessPanel.setVisible(false);
        this.limitedAccessPanel.setEnabled(this.isAdminUser);
        this.limitedAccessPanel.setUpdateButton(this.buttonStrategy.updateButton);
        this.limitedAccessPanel.addStyleName('organ-donor-panel');
        const limitedPermissionWithResearchRadioButton = new RadioButton<FSKTypes.OrganDonorPermissionType>("LIMITED_WITH_RESEARCH", "");
        limitedPermissionWithResearchRadioButton.setEnabled(this.isAdminUser);
        const limitedPermissionRadioButton = new RadioButton<FSKTypes.OrganDonorPermissionType>("LIMITED", "");
        limitedPermissionRadioButton.setEnabled(this.isAdminUser);

        this.addAndReplaceWidgetByVarName(limitedPermissionWithResearchRadioButton.getWrappedButton(this.idSynthesizer.createId()), "limited-permission-with-research-radio");
        limitedPermissionWithResearchRadioButton.element.parentElement.style.paddingBottom = "6px";
        this.addAndReplaceWidgetByVarName(limitedPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), "limited-permission-radio");
        limitedPermissionRadioButton.element.parentElement.style.paddingBottom = "6px";
        this.addAndReplaceWidgetByVarName(this.limitedAccessPanel, "limited-permission-widget");

        const dontKnowPermissionRadioButton = new RadioButton<FSKTypes.OrganDonorPermissionType>("DONT_KNOW", "");
        dontKnowPermissionRadioButton.setEnabled(this.isAdminUser);
        this.addAndReplaceWidgetByVarName(dontKnowPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), "dont-know-permission-radio");
        dontKnowPermissionRadioButton.element.parentElement.style.paddingBottom = "6px";

        const restrictedPermissionRadioButton = new RadioButton<FSKTypes.OrganDonorPermissionType>("NONE", "");
        restrictedPermissionRadioButton.setEnabled(this.isAdminUser);
        this.addAndReplaceWidgetByVarName(restrictedPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), "restricted-permission-radio");
        restrictedPermissionRadioButton.element.parentElement.style.paddingBottom = "6px";

        this.radioGroup = new RadioGroup<FSKTypes.OrganDonorPermissionType>([
            fullPermissionWithResearchRadioButton,
            fullPermissionRadioButton,
            limitedPermissionWithResearchRadioButton,
            limitedPermissionRadioButton,
            dontKnowPermissionRadioButton,
            restrictedPermissionRadioButton
        ], this.idSynthesizer, false);

        this.radioGroup.addValueChangeHandler(handler => {
            const value = handler.getValue();
            this.buttonStrategy.createButton.setEnabled(!!value);
            this.buttonStrategy.updateButton.setEnabled(true);
            this.showCorrespondingDetailPanel(value);
        });

        // registrationdate and buttons
        this.registrationDateTextBox = new TextBoxField(this.getElementByVarName("registration-date"));

        this.buttonStrategy.hideButtons();

        if (this.isAdminUser) {
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.createButton, "create-button");
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.updateButton, "update-button");
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.deleteButton, "delete-button");
        } else if (this.isOdrCoordinator) {
            this.addAndReplaceWidgetByVarName(this.buttonStrategy.printButton, "print-button");
        }

        this.rootElement.appendChild(this.element);
    }

    public setupButtons(): void {
        this.buttonStrategy = new FSKButtonStrategy(this.moduleContext.getUserContext());

        const createHandler = async () => {
            try {
                const value = this.getValue();
                if (value) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.createOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr(), value);
                    this.updateCache(true, "Organdonorregistering oprettet");
                }
            } catch (error) {
                ErrorDisplay.showError("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const updateHandler = async () => {
            try {
                const value = this.getValue();
                if (value) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.updateOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr(), value);
                    this.updateCache(true, "Organdonorregistering opdateret");
                }
            } catch (error) {
                ErrorDisplay.showError("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const deleteHandler = async () => {
            try {
                const yesOption = <DialogOption>{
                    buttonStyle: ButtonStyle.GREEN,
                    text: "Slet",
                };

                const noOption = <DialogOption>{
                    buttonStyle: ButtonStyle.RED,
                    text: "Fortryd",
                };
                const yesIsClicked = await PopupDialog.display(PopupDialogKind.WARNING, "Bekræft sletning",
                    "<p>Er du sikker på du vil slette patientens organdonorregistrering?</p>",
                    noOption, yesOption);
                if (yesIsClicked === yesOption) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.deleteOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
                    this.updateCache(false, "Organdonorregistering slettet");
                }
            } catch (error) {
                ErrorDisplay.showError("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const printHandler = async () => {
            if (this.buttonStrategy.printButton.isVisible()) {
                window.print();
            }
        };

        this.buttonStrategy.updateButton.setEnabled(false);
        this.buttonStrategy.addHandlerForCreateButton(() => createHandler());
        this.buttonStrategy.addHandlerForEditButton(() => updateHandler());
        this.buttonStrategy.addHandlerForDeleteButton(() => deleteHandler());
        this.buttonStrategy.addHandlerForPrintButton(() => printHandler())
    }

    public setData(value: FSKTypes.RegistrationTypeWrapper<FSKTypes.OrganDonorRegistrationType> | null | undefined): void {
        const organDonorRegistration = value && value.registrationType;
        const registrationDate = value && value.datetime;

        if (registrationDate) {
            const dateString = moment(registrationDate, "YYYYMMDDHHmmss").format("DD.MM.YYYY");
            this.registrationDateTextBox.element.innerHTML = `Registreringen er senest ændret: <b>${dateString}</b>`;
        }

        const type = organDonorRegistration ? organDonorRegistration.permissionType : undefined;

        if (!type) {
            this.radioGroup.setValue(null);
        }
        const isAdmin = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        Widget.setVisible(this.getElementByVarName("main-panel"), isAdmin || !!type);
        Widget.setVisible(this.getElementByVarName("empty-panel"), !isAdmin && !type);
        Widget.setVisible(this.getElementByVarName("registration-date-row"), !!type);
        this.getElementByVarName("empty-state-patient").innerText = PatientUtil.getFullName(this.moduleContext.getPatient());

        this.buttonStrategy.createButton.setEnabled(!!type);

        this.radioGroup.getRadioButtons().forEach(button => {
            if (button.getValue() === type) {
                this.radioGroup.setValue(button.getValue(), false);
                button.setEnabled(true);
                button.getInput().checked = true;
            } else {
                button.setEnabled(isAdmin);
                button.getInput().checked = false;
            }
        });

        if (type === "FULL" || type === "FULL_WITH_RESEARCH") {
            this.fullAccessPanel.setRequiresRelativeAcceptance(!!value.registrationType.requiresRelativeAcceptance, this.isOdrCoordinator);
            this.limitedAccessPanel.setValue(undefined, this.isOdrCoordinator);
        } else if (type === "LIMITED" || type === "LIMITED_WITH_RESEARCH") {
            this.fullAccessPanel.setRequiresRelativeAcceptance(false, this.isOdrCoordinator);
            this.limitedAccessPanel.setValue(value.registrationType, this.isOdrCoordinator);
        } else {
            this.fullAccessPanel.setRequiresRelativeAcceptance(false, this.isOdrCoordinator);
            this.limitedAccessPanel.setValue(undefined, this.isOdrCoordinator);
        }
        this.showCorrespondingDetailPanel(type);

        // set edit or create mode
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
            Widget.setVisible(this.getElementByVarName("main-panel"), false);
            Widget.setVisible(this.getElementByVarName("empty-panel"), false);
        }
    }

    private showCorrespondingDetailPanel(type: FSKTypes.OrganDonorPermissionType) {
        this.fullAccessPanel.setVisible(type === "FULL" || type === "FULL_WITH_RESEARCH");
        this.limitedAccessPanel.setVisible(type === "LIMITED" || type === "LIMITED_WITH_RESEARCH");
    }

    private getValue(): FSKTypes.OrganDonorRegistrationType {
        const type = this.radioGroup.getValue();

        if(type) {
            if(type === "FULL" || type === "FULL_WITH_RESEARCH") {
                return {
                    permissionType: type,
                    requiresRelativeAcceptance: this.fullAccessPanel.getRequiresRelativeAcceptance()
                };
            } else if(type === "LIMITED" || type === "LIMITED_WITH_RESEARCH") {
                const value = this.limitedAccessPanel.getValue();
                if (value) {
                    value.permissionType = type;
                }
                return value;
            } else if(type === "NONE" || type === "DONT_KNOW") {
                return { permissionType: type };
            }
        }
    }
}
