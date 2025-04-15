import {
    isElementVisible,
    LoginTypeUtil,
    ModuleContext,
    setElementVisible,
    TabbedPanel,
    UserContext,
    ValueChangeHandler
} from "fmko-ts-common";
import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKService from "../services/FSKService";
import LivingWillCache from "../services/LivingWillCache";
import FSKUserUtil from "../util/FSKUserUtil";
import TreatmentWillPanel from "../panels/treatment-will-panels/TreatmentWillPanel";
import {RegistrationState} from "../model/RegistrationState";
import LivingWillPanel from "../panels/living-will-panels/LivingWillPanel";
import FSKConfig from "../main/FSKConfig";
import {PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import LivingWillType = FSKTypes.LivingWillType;
import TreatmentWillType = FSKTypes.TreatmentWillType;

@Component({
    template: require("./doctorOrNurseOrDentistWillTab.html")
})
export default class DoctorOrNurseOrDentistWillTab implements TabbedPanel, Render {
    private static TAB_ID = "DoctorOrNurseWillTab_TS";
    private static TAB_TITLE = "Livs/Behandlingstestamente";

    public element: HTMLElement;

    private shown: boolean;
    private initialized: boolean;
    private readonly isDentist = FSKUserUtil.isDentistWithoutElevatedRights(this.moduleContext.getUserContext());

    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<TreatmentWillType>>;
    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<LivingWillType>>;

    @WidgetElement private willContainer: HTMLDivElement;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency("FSKConfig") private fskConfig: FSKConfig,
        @Dependency(LivingWillCache) private livingWillCache: LivingWillCache,
        @Dependency(TreatmentWillCache) private treatmentWillCache: TreatmentWillCache,
        @Dependency(FSKService) private fskService: FSKService
    ) {
    }

    public getId(): string {
        return DoctorOrNurseOrDentistWillTab.TAB_ID;
    }

    public getTitle(): string {
        return this.isDentist ? "Behandlingstestamente" : DoctorOrNurseOrDentistWillTab.TAB_TITLE;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return !LoginTypeUtil.loggedInWithPoces() && FSKUserUtil.isDoctorOrNurseOrDentistWithoutElevatedRights(userContext);
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            if (applicationContextId === "PATIENT") {
                this.moduleContext.showTab(DoctorOrNurseOrDentistWillTab.TAB_ID);
            } else {
                this.moduleContext.hideTab(DoctorOrNurseOrDentistWillTab.TAB_ID);
            }
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 205;
    }

    public autoActivationAllowed(): boolean {
        return true;
    }

    public init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.moduleContext.getRootElement().appendChild(this.element);
    }

    public render(): void | Promise<never> {
        // Handled by renderLivingWill and renderTreatmentWill
    }

    public setVisible(visible: boolean): void {
        setElementVisible(this.element, visible);
        if (this.moduleContext.getPatient()) {
            // Check if the user has clicked accept on the dialog
            if (visible && this.livingWillCache.registrationState === RegistrationState.UNCHECKED &&
                this.treatmentWillCache.registrationState === RegistrationState.UNCHECKED) {

                if (this.initialized) {
                    this.removeListeners();
                    this.willContainer.innerHTML = "";
                }
                this.showLogDialog();
            }
        }

        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            // Tab was selected
            if (!this.initialized) {
                this.render();
            }
            this.init();
        } else {
            // Tab was de-selected
            this.removeListeners();
        }

        this.shown = visible;
    }

    private async showLogDialog() {
        const confirmed = await PopupDialog.displayConfirmCancel(PopupDialogKind.WARNING,
            "Bekræft visning af " + this.getTitle(),
            require("./confirm-viewing-will-tab.html"), "Fortryd", "Videre");
        if (confirmed) {
            await this.addListeners();
        }
    }

    private async addListeners() {
        if (!this.isDentist && await this.livingWillCache.loadHasRegistration() === RegistrationState.REGISTERED) {
            if (!this.livingWillChangeHandler) {
                this.livingWillChangeHandler = (() => {
                    if (isElementVisible(this.element)) {
                        this.renderLivingWill();
                    }
                });
                this.livingWillCache.livingWill.addValueChangeHandler(this.livingWillChangeHandler, true);
            } else {
                this.livingWillCache.setStale();
            }
        } else {
            if (!this.treatmentWillChangeHandler) {
                this.treatmentWillChangeHandler = (() => {
                    if (isElementVisible(this.element)) {
                        this.renderTreatmentWill();
                    }
                });
                this.treatmentWillCache.treatmentWill.addValueChangeHandler(this.treatmentWillChangeHandler, true);
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

    private renderTreatmentWill() {
        const treatmentWillPanel = this.container.resolve(TreatmentWillPanel);
        treatmentWillPanel.render();

        const value = this.treatmentWillCache.treatmentWill.getValue();
        const loading = this.treatmentWillCache.treatmentWill.isLoading();
        const failed = this.treatmentWillCache.treatmentWill.isFailed();

        if (loading) {
            if (this.initialized) {
                // ignored
            }
        } else if (failed) {
            // ignored
        } else {
            treatmentWillPanel.setData(value);
        }
        this.willContainer.appendChild(treatmentWillPanel.element);
    }

    private renderLivingWill() {
        const livingWillPanel = this.container.resolve(LivingWillPanel);
        livingWillPanel.render();

        const value = this.livingWillCache.livingWill.getValue();
        const loading = this.livingWillCache.livingWill.isLoading();
        const failed = this.livingWillCache.livingWill.isFailed();

        if (loading) {
            if (this.initialized) {
                // ignored
            }
        } else if (failed) {
            // ignored
        } else {
            livingWillPanel.setData(value);
        }
        this.willContainer.appendChild(livingWillPanel.element);
    }
}
