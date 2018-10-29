import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {ButtonStyle, CheckboxWrapper, DialogOption, ErrorDisplay, PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import TreatmentWillWishPanel from "../panels/treatment-will-testament-panels/TreatmentWillWishPanel";
import SDSButton from "../elements/SDSButton";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKService from "../services/FSKService";
import ErrorUtil from "../util/ErrorUtil";
import FSKConfig from "../main/FSKConfig";
import LivingWillCache from "../services/LivingWillCache";
import FSKUserUtil from "../util/FSKUserUtil";
import TimelineUtil from "../util/TimelineUtil";
import TreatmentWillType = FSKTypes.TreatmentWillType;
import TreatmentWillValueType = FSKTypes.TreatmentWillValueType;

export default class TreatmentWillTab extends TemplateWidget implements TabbedPanel {
    private ID = "TreatmentWillTab_TS";
    private TITLE = "Behandlingstestamente";
    private shown: boolean;
    private initialized: boolean;
    private isAdministratorUser: boolean;
    private hasAuthAndNotAdmin: boolean;
    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.TreatmentWillType>;

    private createButton: SDSButton;
    private updateButton: SDSButton;
    private deleteButton: SDSButton;

    private terminallyIllCheckbox: CheckboxWrapper;
    private illNoImprovementCheckbox: CheckboxWrapper;
    private illWithPermanentPainCheckbox: CheckboxWrapper;
    private treatmentByForceCheckbox: CheckboxWrapper;

    private terminallyIllPanel: TreatmentWillWishPanel;
    private illNoImprovementPanel: TreatmentWillWishPanel;
    private illWithPermanentPainPanel: TreatmentWillWishPanel;
    private treatmentByForcePanel: TreatmentWillWishPanel;

    private canSee = false;

    public static deps = () => [IoC, "ModuleContext", "FSKConfig", LivingWillCache, TreatmentWillCache, FSKService, "RootElement"];

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext,
                       private fskConfig: FSKConfig,
                       private livingWillCache: LivingWillCache,
                       private treatmentWillCache: TreatmentWillCache,
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
        return loadTemplate("tabs/treatmentWillTab.html");
    }

    public getValue(): TreatmentWillType {
        return <TreatmentWillType>{
            noLifeProlongingIfDying: this.getTreatmentValue(this.terminallyIllCheckbox, this.terminallyIllPanel),
            noLifeProlongingIfSeverelyDegraded: this.getTreatmentValue(this.illNoImprovementCheckbox, this.illNoImprovementPanel),
            noLifeProlongingIfSeverePain: this.getTreatmentValue(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel),
            noForcedTreatmentIfIncapable: this.getTreatmentValue(this.treatmentByForceCheckbox, this.treatmentByForcePanel)
        };
    }

    public getTreatmentValue(checkBox: CheckboxWrapper, panel: TreatmentWillWishPanel) {
        const isChecked = !!checkBox.getValue();

        return <TreatmentWillValueType>{
            acceptanceNeeded: isChecked ? this.getWishPanelValue(panel) : null,
            $: isChecked
        };
    }
    public async setupBindings(): Promise<void> {
        this.warningIfLivingWillExist((await this.livingWillCache.loadHasRegistration() && this.isAdministratorUser));

        this.terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        this.terminallyIllPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckboxAndPanel(this.terminallyIllCheckbox, this.terminallyIllPanel);

        this.addAndReplaceWidgetByVarName(this.terminallyIllPanel, `terminally-ill-panel`);

        this.illNoImprovementCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-no-improvement-checkbox`));
        this.illNoImprovementPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckboxAndPanel(this.illNoImprovementCheckbox, this.illNoImprovementPanel);

        this.addAndReplaceWidgetByVarName(this.illNoImprovementPanel, `ill-no-improvement-panel`);

        this.illWithPermanentPainCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-with-permanent-pain-checkbox`));
        this.illWithPermanentPainPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckboxAndPanel(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel);

        this.addAndReplaceWidgetByVarName(this.illWithPermanentPainPanel, `ill-with-permanent-pain-panel`);

        this.treatmentByForceCheckbox = new CheckboxWrapper(this.getElementByVarName(`treatment-by-force-checkbox`));
        this.treatmentByForcePanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckboxAndPanel(this.treatmentByForceCheckbox, this.treatmentByForcePanel);

        this.addAndReplaceWidgetByVarName(this.treatmentByForcePanel, `treatment-by-force-panel`);

        this.createButton = new SDSButton("Opret registrering", "primary", async () => {
            try {
                if (this.livingWillCache.hasRegistration && (await this.livingWillCache.deleteRegistration())) {
                    return;
                }

                await this.fskService.createTreatmentWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true);
                this.moduleContext.setApplicationContextId(`PATIENT`);

            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.updateButton = new SDSButton("Opdatér", "primary", async () => {
            try {
                await this.fskService.updateTreatmentWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.deleteButton = new SDSButton("Slet registrering", "danger", async () => {
            try {
                await this.fskService.deleteTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
                this.updateCache(false);
                this.moduleContext.setApplicationContextId(`PATIENT`);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.hideButtons();

        this.setEnabled(this.isAdministratorUser);

        this.addAndReplaceWidgetByVarName(this.createButton, `create-button`);
        this.addAndReplaceWidgetByVarName(this.updateButton, `update-button`);
        this.addAndReplaceWidgetByVarName(this.deleteButton, `delete-button`);

        this.rootElement.appendChild(this.element);
    }

    private warningIfLivingWillExist(livingWillExist: boolean) {
        Widget.setVisible(this.getElementByVarName(`living-will-exists`), livingWillExist);
    }

    public hideButtons() {
        this.createButton.setVisible(false);
        this.updateButton.setVisible(false);
        this.deleteButton.setVisible(false);
    }

    private addHandlerForCheckboxAndPanel(checkBox: CheckboxWrapper, panel: Widget) {
        checkBox.addValueChangeHandler(handler => {
            const value = handler.getValue();
            panel.setVisible(value);
        });
    }

    public updateCache(hasRegistration: boolean) {
        this.treatmentWillCache.hasRegistration = hasRegistration;
        this.setCreateMode(!hasRegistration);
        this.treatmentWillCache.treatmentWill.setStale();
    }

    public setEnabled(enabled: boolean) {
        this.terminallyIllCheckbox.setEnabled(enabled);
        this.terminallyIllPanel.setEnabled(enabled);

        this.illNoImprovementCheckbox.setEnabled(enabled);
        this.illNoImprovementPanel.setEnabled(enabled);

        this.illWithPermanentPainCheckbox.setEnabled(enabled);
        this.illWithPermanentPainPanel.setEnabled(enabled);

        this.treatmentByForceCheckbox.setEnabled(enabled);
        this.treatmentByForcePanel.setEnabled(enabled);
    }

    public tearDownBindings(): void {
        // unused
    }

    public getId(): string {
        return this.ID;
    }

    public getTitle(): string {
        return this.TITLE;
    }

    public async setVisible(visible: boolean): Promise<void> {
        if(!this.moduleContext.getPatient()) {
            return;
        }

        let canSee = visible;

        const yesOption = <DialogOption>{
            buttonStyle: ButtonStyle.GREEN,
            text: `Videre`,
        };

        const noOption = <DialogOption>{
            buttonStyle: ButtonStyle.RED,
            text: `Fortryd`,
        };

        if (!this.isAdministratorUser && FSKUserUtil.userHasAuthorisations(this.moduleContext.getUserContext()) && visible && !this.canSee) {
            const yesClicked = await PopupDialog.display(
                PopupDialogKind.WARNING,
                "Bekræft",
                "<h4 style='font-size:18px'>Visning af behandlingstestamente</h4><br>" +
                "Behandlingstestamente bør kun fremsøges såfremt<br><br>" +
                "<ul style='list-style: inherit; padding-left:32px'>" +
                "<li>Patienten ligger for døden (dvs. er uafvendeligt døende)</li>" +
                "<li>Patienten er hjælpeløs pga. sygdom, ulykke mv., og der ikke er tegn på bedring</li>" +
                "</ul>" +
                "<br>Bemærk: Tilgang til data for testamentet vil blive logget. Tilgang vil fremgå af patientens minlog.</li>",
                noOption,
                yesOption);
            canSee = yesClicked === yesOption;
            this.canSee = canSee;
        }
        if (! await this.livingWillCache.loadHasRegistration()) {
            this.warningIfLivingWillExist(false);
        }

        super.setVisible(canSee);

        if (this.shown === canSee) {
            // Debounce..
            return;
        }

        if (canSee) {
            this.addListeners();
            this.init();
            this.render();
        } else {
            this.removeListeners();
        }

        this.shown = canSee;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        if (!TimelineUtil.useTreatmentWill(this.fskConfig)) {
            return false;
        }

        this.isAdministratorUser = FSKUserUtil.isFSKAdmin(userContext);
        const isTransplantCoordinator = FSKUserUtil.isFSKSupporter(userContext);
        this.hasAuthAndNotAdmin = (userContext.getAuthorisations() || []).length > 0 && !this.isAdministratorUser && !isTransplantCoordinator;
        return this.hasAuthAndNotAdmin || this.isAdministratorUser;
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        const treatmentWillExist = await this.treatmentWillCache.loadHasRegistration();

        const treatmentWillExistsForHealthcareProvider = !treatmentWillExist && this.hasAuthAndNotAdmin;
        if (applicationContextId === "PATIENT" && treatmentWillExistsForHealthcareProvider) {
            this.moduleContext.hideTab(this.ID);
        } else if(applicationContextId === "PATIENT") {
            this.moduleContext.showTab(this.ID);
        } else {
            this.moduleContext.hideTab(this.ID);
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 203;
    }

    public setCreateMode(isCreateMode: boolean) {
        this.createButton.setVisible(isCreateMode && this.isAdministratorUser);
        this.updateButton.setVisible(!isCreateMode && this.isAdministratorUser);
        this.deleteButton.setVisible(!isCreateMode && this.isAdministratorUser);
    }

    public setData(treatmentWill: FSKTypes.TreatmentWillType): void {
        if (treatmentWill) {
            Object.entries(treatmentWill).forEach(([property, will]) => {
                switch (property) {
                    case "noLifeProlongingIfDying":
                        this.terminallyIllPanel.setValue(will.acceptanceNeeded);
                        this.terminallyIllCheckbox.setValue(will.$, true);
                        break;
                    case "noLifeProlongingIfSeverelyDegraded":
                        this.illNoImprovementPanel.setValue(will.acceptanceNeeded);
                        this.illNoImprovementCheckbox.setValue(will.$, true);
                        break;
                    case "noLifeProlongingIfSeverePain":
                        this.illWithPermanentPainPanel.setValue(will.acceptanceNeeded);
                        this.illWithPermanentPainCheckbox.setValue(will.$, true);
                        break;
                    case "noForcedTreatmentIfIncapable":
                        this.treatmentByForcePanel.setValue(will.acceptanceNeeded);
                        this.treatmentByForceCheckbox.setValue(will.$, true);
                        break;
                }
            });
        } else {
            this.terminallyIllPanel.setValue(null);
            this.terminallyIllCheckbox.setValue(null, true);
            this.illNoImprovementPanel.setValue(null);
            this.illNoImprovementCheckbox.setValue(null, true);
            this.illWithPermanentPainPanel.setValue(null);
            this.illWithPermanentPainCheckbox.setValue(null, true);
            this.treatmentByForcePanel.setValue(null);
            this.treatmentByForceCheckbox.setValue(null, true);
        }
        this.setCreateMode(!treatmentWill);
    }

    public render() {
        const value = this.treatmentWillCache.treatmentWill.getValue();
        const loading = this.treatmentWillCache.treatmentWill.isLoading();
        const failed = this.treatmentWillCache.treatmentWill.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {

        } else {
            this.setData(value);
        }
    }

    private getWishPanelValue(wishPanel: TreatmentWillWishPanel) {
        return wishPanel.getValue() === TreatmentWillWishPanel.NO_ACCEPT_PROPERTY
            ? null
            : wishPanel.getValue();
    }


    private addListeners() {
        if (!this.treatmentWillChangeHandler) {
            this.treatmentWillChangeHandler = (() => {
                if (this.isVisible()) {
                    this.render();
                }
            });
            this.treatmentWillCache.treatmentWill.addValueChangeHandler(this.treatmentWillChangeHandler);
        }
    }

    private removeListeners() {
        if (this.treatmentWillChangeHandler) {
            this.treatmentWillCache.treatmentWill.removeValueChangeHandler(this.treatmentWillChangeHandler);
            this.treatmentWillChangeHandler = undefined;
        }
    }

}