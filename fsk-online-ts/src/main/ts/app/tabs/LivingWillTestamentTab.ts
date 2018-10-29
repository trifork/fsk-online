import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {ButtonStyle, CheckboxWrapper, DialogOption, ErrorDisplay, PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import SDSButton from "../elements/SDSButton";
import FSKService from "../services/FSKService";
import LivingWillCache from "../services/LivingWillCache";
import ErrorUtil from "../util/ErrorUtil";
import FSKConfig from "../main/FSKConfig";
import FSKUserUtil from "../util/FSKUserUtil";
import TimelineUtil from "../util/TimelineUtil";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillTestamentTab extends TemplateWidget implements TabbedPanel {
    private ID = "LivingWillTestamentTab_TS";
    private TITLE = "Livstestamente";
    private shown: boolean;
    private initialized: boolean;
    private isAdministratorUser = false;
    private hasAuthAndNotAdmin = false;

    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.LivingWillType>;

    private createButton: SDSButton;
    private updateButton: SDSButton;
    private deleteButton: SDSButton;

    private terminallyIllCheckbox: CheckboxWrapper;
    private severelyHandicappedCheckbox: CheckboxWrapper;

    private canSee = false;


    public static deps = () => [IoC, "ModuleContext", "FSKConfig", LivingWillCache, FSKService, "RootElement"];

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext,
                       private fskConfig: FSKConfig,
                       private livingWillCache: LivingWillCache,
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
        return loadTemplate("tabs/livingWillTestamentTab.html");
    }

    public getValue(): LivingWillType {
        return <LivingWillType>{
            noLifeProlongingIfDying: !!this.terminallyIllCheckbox.getValue(),
            noLifeProlongingIfSeverelyDegraded: !!this.severelyHandicappedCheckbox.getValue()
        };
    }

    public setupBindings(): void {
        this.terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        this.severelyHandicappedCheckbox = new CheckboxWrapper(this.getElementByVarName(`severely-handicapped-checkbox`));

        this.createButton = new SDSButton("Opret registrering", "primary", async () => {
            try {
                await this.fskService.createLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.updateButton = new SDSButton("Opdatér", "primary", async () => {
            try {
                await this.fskService.updateLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.deleteButton = new SDSButton("Slet registrering", "danger", async () => {
            try {
                await this.fskService.deleteLivingWillForPatient(this.moduleContext.getPatient().getCpr());
                this.terminallyIllCheckbox.setValue(false);
                this.severelyHandicappedCheckbox.setValue(false);
                this.updateCache(false);
                if (TimelineUtil.useTreatmentWill(this.fskConfig)) {
                    this.moduleContext.setApplicationContextId(`PATIENT`);
                }
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

    public hideButtons() {
        this.createButton.setVisible(false);
        this.updateButton.setVisible(false);
        this.deleteButton.setVisible(false);
    }

    public setCreateMode(isCreateMode: boolean) {
        this.createButton.setVisible(isCreateMode && this.isAdministratorUser && !TimelineUtil.useTreatmentWill(this.fskConfig));
        this.updateButton.setVisible(!isCreateMode && this.isAdministratorUser && !TimelineUtil.useTreatmentWill(this.fskConfig));
        const onlyPermissionToReadAfterDate = !isCreateMode && this.isAdministratorUser && TimelineUtil.useTreatmentWill(this.fskConfig);
        if (onlyPermissionToReadAfterDate) {
            this.setEnabled(false);
        }
        this.deleteButton.setVisible(!isCreateMode && this.isAdministratorUser);
    }

    public updateCache(hasRegistration: boolean) {
        this.livingWillCache.hasRegistration = hasRegistration;
        this.setCreateMode(!hasRegistration);
        this.livingWillCache.livingWill.setStale();
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

        if (!FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext()) && FSKUserUtil.userHasAuthorisations(this.moduleContext.getUserContext()) && visible && !this.canSee) {
            const yesClicked = await PopupDialog.display(
                PopupDialogKind.WARNING,
                "Bekræft",
                "<h4 style='font-size:18px'>Visning af livstestamente</h4><br>" +
                "Livstestamente bør kun fremsøges såfremt<br><br>" +
                "<ul style='list-style: inherit; padding-left:32px'>" +
                "<li>Patienten er i en situation, hvor patienten er uafvendeligt døende</li>" +
                "<li>Patienten varigt er ude af stand til at tage vare på sig selv fysisk og mentalt</li>" +
                "</ul>" +
                "<br>Bemærk: Tilgang til data for testamentet vil blive logget. Tilgang vil fremgå af patientens minlog.</li>",
                noOption,
                yesOption);
            canSee = yesClicked === yesOption;
            this.canSee = canSee;
        }

        super.setVisible(visible);

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
        if (FSKUserUtil.isFSKSupporter(userContext)) {
            return false;
        }
        this.isAdministratorUser = FSKUserUtil.isFSKAdmin(userContext);
        this.hasAuthAndNotAdmin = (userContext.getAuthorisations() || []).length > 0 && !this.isAdministratorUser;

        return this.hasAuthAndNotAdmin || this.isAdministratorUser;
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        const livingWillDateSurpassed = TimelineUtil.useTreatmentWill(this.fskConfig);

        const hasLivingWill = await this.livingWillCache.loadHasRegistration();
        const canView = !livingWillDateSurpassed || hasLivingWill;
        const livingWillExistsForHealthcareProvider = !hasLivingWill && this.hasAuthAndNotAdmin;
        if (applicationContextId === "PATIENT" && livingWillExistsForHealthcareProvider) {
            this.moduleContext.hideTab(this.ID);
        } else if (applicationContextId === "PATIENT" && canView) {
            this.moduleContext.showTab(this.ID);
        } else {
            this.moduleContext.hideTab(this.ID);
        }
    }

    public setEnabled(enabled: boolean): void {
        this.terminallyIllCheckbox.setEnabled(enabled);
        this.severelyHandicappedCheckbox.setEnabled(enabled);
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 202;
    }

    public setData(livingWill: LivingWillType) {
        if (livingWill) {
            this.terminallyIllCheckbox.setValue(livingWill.noLifeProlongingIfDying);
            this.severelyHandicappedCheckbox.setValue(livingWill.noLifeProlongingIfSeverelyDegraded);
        }
        this.setCreateMode(!livingWill);
    }

    public render() {
        const value = this.livingWillCache.livingWill.getValue();
        const loading = this.livingWillCache.livingWill.isLoading();
        const failed = this.livingWillCache.livingWill.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {

        } else {
            this.setData(value);
        }
    }

    private addListeners() {
        if (!this.livingWillChangeHandler) {
            this.livingWillChangeHandler = (() => {
                if (this.isVisible()) {
                    this.render();
                }
            });
            this.livingWillCache.livingWill.addValueChangeHandler(this.livingWillChangeHandler);
        }
    }

    private removeListeners() {
        if (this.livingWillChangeHandler) {
            this.livingWillCache.livingWill.removeValueChangeHandler(this.livingWillChangeHandler);
            this.livingWillChangeHandler = undefined;
        }
    }

}