import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {ButtonStyle, CheckboxWrapper, DialogOption, ErrorDisplay, PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import FSKService from "../services/FSKService";
import LivingWillCache from "../services/LivingWillCache";
import ErrorUtil from "../util/ErrorUtil";
import FSKConfig from "../main/FSKConfig";
import FSKUserUtil from "../util/FSKUserUtil";
import TimelineUtil from "../util/TimelineUtil";
import {ButtonStrategy} from "../model/ButtonStrategy";
import FSKButtonStrategy from "../model/FSKButtonStrategy";
import SnackBar from "../elements/SnackBar";
import PatientUtil from "../util/PatientUtil";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillTestamentTab extends TemplateWidget implements TabbedPanel {
    private ID = "LivingWillTestamentTab_TS";
    private TITLE = "Livstestamente";
    private shown: boolean;
    private initialized: boolean;
    private isAdministratorUser = false;
    private hasAuthAndNotAdmin = false;

    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.LivingWillType>;

    private terminallyIllCheckbox: CheckboxWrapper;
    private severelyHandicappedCheckbox: CheckboxWrapper;

    private canSee = false;

    private buttonStrategy: ButtonStrategy;


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
        this.setupButtons();
        this.terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        this.terminallyIllCheckbox.addValueChangeHandler(() => {
            this.buttonStrategy.updateButton.setEnabled(true);
        });
        this.severelyHandicappedCheckbox = new CheckboxWrapper(this.getElementByVarName(`severely-handicapped-checkbox`));
        this.severelyHandicappedCheckbox.addValueChangeHandler(() => {
            this.buttonStrategy.updateButton.setEnabled(true);
        });

        this.buttonStrategy.hideButtons();
        this.setEnabled(this.isAdministratorUser);

        this.addAndReplaceWidgetByVarName(this.buttonStrategy.createButton, `create-button`);
        this.addAndReplaceWidgetByVarName(this.buttonStrategy.updateButton, `update-button`);
        this.addAndReplaceWidgetByVarName(this.buttonStrategy.deleteButton, `delete-button`);

        const onlyPermissionToReadAfterDate = this.isAdministratorUser && TimelineUtil.useTreatmentWill(this.fskConfig);
        if (onlyPermissionToReadAfterDate) {
            this.setEnabled(false);
        }

        this.rootElement.appendChild(this.element);
    }

    public setupButtons(): void {
        this.buttonStrategy = new FSKButtonStrategy(this.moduleContext.getUserContext());
        const createHandler = async () => {
            try {
                this.buttonStrategy.disableButtons();
                await this.fskService.createLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Livstestamente oprettet`);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };

        const updateHandler = async () => {
            try {
                this.buttonStrategy.disableButtons();
                await this.fskService.updateLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Livstestamente opdateret`);
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
                    "<p>Er du sikker på du vil slette patientens livstestamenteregistrering?</p>",
                    noOption, yesOption);
                if (yesIsClicked == yesOption) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.deleteLivingWillForPatient(this.moduleContext.getPatient().getCpr());
                    this.terminallyIllCheckbox.setValue(false);
                    this.severelyHandicappedCheckbox.setValue(false);
                    this.updateCache(false, `Livstestamente slettet`);
                    if (TimelineUtil.useTreatmentWill(this.fskConfig)) {
                        this.moduleContext.setApplicationContextId(`PATIENT`);
                    }
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

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.livingWillCache.hasRegistration = hasRegistration;
        hasRegistration
            ? this.buttonStrategy.setEditMode(!TimelineUtil.useTreatmentWill(this.fskConfig))
            : this.buttonStrategy.setCreateMode(!TimelineUtil.useTreatmentWill(this.fskConfig));
        this.livingWillCache.livingWill.setStale();
        this.buttonStrategy.enableButtons();
        SnackBar.show(snackbarText);
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
        if (!this.moduleContext.getPatient()) {
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

        const isDoctorOrNurse = (userContext.getEducations() || []).some(education => education === "læge" || education === "sygeplejerske");
        this.hasAuthAndNotAdmin = isDoctorOrNurse && !this.isAdministratorUser;

        return (this.hasAuthAndNotAdmin || this.isAdministratorUser);
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        const livingWillDateSurpassed = TimelineUtil.useTreatmentWill(this.fskConfig);

        if (!FSKUserUtil.isFSKSupporter(this.moduleContext.getUserContext())) {
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
        } else {
            this.terminallyIllCheckbox.setValue(false);
            this.severelyHandicappedCheckbox.setValue(false);
        }

        const isAdmin = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        Widget.setVisible(this.getElementByVarName(`main-panel`), isAdmin || !!livingWill);
        Widget.setVisible(this.getElementByVarName(`empty-panel`), !isAdmin && !livingWill);
        this.getElementByVarName(`empty-state-patient`).innerText = PatientUtil.getFullName(this.moduleContext.getPatient());

        livingWill
            ? this.buttonStrategy.setEditMode(!TimelineUtil.useTreatmentWill(this.fskConfig))
            : this.buttonStrategy.setCreateMode(!TimelineUtil.useTreatmentWill(this.fskConfig));
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