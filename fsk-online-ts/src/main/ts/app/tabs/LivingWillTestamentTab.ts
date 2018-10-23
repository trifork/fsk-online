import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {CheckboxWrapper, ErrorDisplay} from "fmko-ts-widgets";
import SDSButton from "../elements/SDSButton";
import FSKService from "../services/FSKService";
import LivingWillCache from "../services/LivingWillCache";
import ErrorUtil from "../util/ErrorUtil";
import TreatmentWillCache from "../services/TreatmentWillCache";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillTestamentTab extends TemplateWidget implements TabbedPanel {
    private ID = "LivingWillTestamentTab_TS";
    private TITLE = "Livstestamente";
    private shown: boolean;
    private initialized: boolean;

    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.LivingWillType>;

    private createButton: SDSButton;
    private updateButton: SDSButton;
    private deleteButton: SDSButton;

    private terminallyIllCheckbox: CheckboxWrapper;
    private severelyHandicappedCheckbox: CheckboxWrapper;

    public static deps = () => [IoC, "ModuleContext", LivingWillCache, TreatmentWillCache, FSKService, "RootElement"];

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext,
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
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.hideButtons();

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
        this.createButton.setVisible(isCreateMode);
        this.updateButton.setVisible(!isCreateMode);
        this.deleteButton.setVisible(!isCreateMode);
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
        return userContext.isAdministratorLogin();
        //return userContext.isAdministratorLogin() || userContext.isSupporterLogin();
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        if (applicationContextId === "PATIENT" && !(await this.treatmentWillCache.loadHasRegistration())) {
            this.moduleContext.showTab(this.ID);
        } else {
            this.moduleContext.hideTab(this.ID);
        }
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