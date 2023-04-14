import {LoginTypeUtil, ModuleContext, TabbedPanel, UserContext, ValueChangeHandler} from "fmko-ts-common";
import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKService from "../services/FSKService";
import FSKConfig from "../main/FSKConfig";
import LivingWillCache from "../services/LivingWillCache";
import FSKUserUtil from "../util/FSKUserUtil";
import TreatmentWillPanel from "../panels/treatment-will-panels/TreatmentWillPanel";
import {RegistrationState} from "../model/RegistrationState";
import LivingWillPanel from "../panels/living-will-panels/LivingWillPanel";
import LivingWillType = FSKTypes.LivingWillType;
import TreatmentWillType = FSKTypes.TreatmentWillType;

export default class DoctorOrNurseOrDentistWillTab extends TemplateWidget implements TabbedPanel {
    private ID = "DoctorOrNurseWillTab_TS";
    private shown: boolean;
    private initialized: boolean;
    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<TreatmentWillType>>;
    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<LivingWillType>>;
    private treatmentWillPanel: TreatmentWillPanel;


    public static deps = () => [IoC, "ModuleContext", "FSKConfig", LivingWillCache, TreatmentWillCache, FSKService, "RootElement"];

    constructor(protected container: IoC,
        private moduleContext: ModuleContext,
        private fskConfig: FSKConfig,
        private livingWillCache: LivingWillCache,
        private treatmentWillCache: TreatmentWillCache,
        private fskService: FSKService,
        private rootElement: HTMLElement) {
        super(container);
        this.element = document.createElement(`div`);
    }

    public override init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        super.init();
    }

    public getTemplate(): string {
        return require("./doctorOrNurseOrDentistWillTab.html");
    }

    public setupBindings(): any {
        this.rootElement.appendChild(this.element);
    }

    public override tearDownBindings(): void {
        // unused
    }

    public getId(): string {
        return this.ID;
    }

    public getTitle(): string {
        return this.isDentist() ? "Behandlingstestamente" : "Livs/Behandlingstestamente";
    }

    public autoActivationAllowed(): boolean {
        return true;
    }

    public override setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (this.moduleContext.getPatient()) {
            // Check if the user has clicked accept on the dialog
            if (visible && this.livingWillCache.registrationState === RegistrationState.UNCHECKED &&
                this.treatmentWillCache.registrationState === RegistrationState.UNCHECKED) {

                if (this.initialized) {
                    this.cleanChildrenOnVarName(`will-container`);
                }
                this.showLogDialog();

            }
        }
        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            this.init();
        } else {
            this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return !LoginTypeUtil.loggedInWithPoces() && FSKUserUtil.isDoctorOrNurseOrDentistWithoutElevatedRights(userContext);
    }

    public applicationContextIdChanged(applicationContextId: string): void {
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
        return 205;
    }

    public async showLogDialog(): Promise<void> {
        const yesClicked = await PopupDialog.displayConfirmCancel(PopupDialogKind.WARNING,
            "Bekræft visning af " + this.getTitle(),
            require("./confirm-viewing-will-tab.html"), "Fortryd", "Videre");
        if (yesClicked) {
            this.addListeners();
        }
    }

    public renderTreatmentWill() {
        this.treatmentWillPanel = this.container.resolve<TreatmentWillPanel>(TreatmentWillPanel);

        const value = this.treatmentWillCache.treatmentWill.getValue();
        const loading = this.treatmentWillCache.treatmentWill.isLoading();
        const failed = this.treatmentWillCache.treatmentWill.isFailed();

        if (loading) {
            if (this.initialized) {
                // ignored
            }
        } else if (failed) {
            // this.treatmentWillPanel.setData(value);
        } else {
            this.treatmentWillPanel.setData(value);
        }
        this.appendWidgetOnVarName(this.treatmentWillPanel, `will-container`, true);
    }

    public renderLivingWill() {
        const livingPanel = this.container.resolve<LivingWillPanel>(LivingWillPanel);

        const value = this.livingWillCache.livingWill.getValue();
        const loading = this.livingWillCache.livingWill.isLoading();
        const failed = this.livingWillCache.livingWill.isFailed();

        if (loading) {
            if (this.initialized) {
                // ignored
            }
        } else if (failed) {
            // livingPanel.setData(value);
        } else {
            livingPanel.setData(value);
        }
        this.appendWidgetOnVarName(livingPanel, `will-container`);
    }

    private isDentist(): boolean {
        return FSKUserUtil.isDentistWithoutElevatedRights(this.moduleContext.getUserContext());
    }

    private async addListeners() {
        if (!this.isDentist() && await this.livingWillCache.loadHasRegistration() === RegistrationState.REGISTERED) {
            if (!this.livingWillChangeHandler) {
                this.livingWillChangeHandler = (() => {
                    if (this.isVisible()) {
                        this.renderLivingWill();
                    }
                });
                this.livingWillCache.livingWill.addValueChangeHandler(this.livingWillChangeHandler);
            } else {
                this.livingWillCache.setStale();
            }
        } else {
            if (!this.treatmentWillChangeHandler) {
                this.treatmentWillChangeHandler = (() => {
                    if (this.isVisible()) {
                        this.renderTreatmentWill();
                    }
                });
                this.treatmentWillCache.treatmentWill.addValueChangeHandler(this.treatmentWillChangeHandler);
            } else {
                this.treatmentWillCache.setStale();
            }
        }
    }

    private removeListeners() {
        if (this.treatmentWillChangeHandler) {
            this.treatmentWillCache.treatmentWill.removeValueChangeHandler(this.treatmentWillChangeHandler);
            this.treatmentWillChangeHandler = undefined;
        }
        if (this.livingWillChangeHandler) {
            this.livingWillCache.livingWill.removeValueChangeHandler(this.livingWillChangeHandler);
            this.livingWillChangeHandler = undefined;
        }
    }
}
