import {
    isElementVisible,
    ModuleContext,
    setElementVisible,
    TabbedPanel,
    UserContext,
    ValueChangeHandler
} from "fmko-ts-common";
import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKConfig from "../main/FSKConfig";
import FSKUserUtil from "../util/FSKUserUtil";
import TreatmentWillType = FSKTypes.TreatmentWillType;
import TimelineUtil from "../util/TimelineUtil";
import TreatmentWillPanel from "../panels/treatment-will-panels/TreatmentWillPanel";

@Component({
    template: require("./treatmentWillTab.html")

})
export default class TreatmentWillTab implements TabbedPanel, Render {
    private static TAB_ID = "TreatmentWillTab_TS";
    private static TAB_TITLE = "Behandlingstestamente";

    public element: HTMLElement;

    private shown: boolean;
    private initialized: boolean;

    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<TreatmentWillType>>;

    @WidgetElement private treatmentWillPanel: TreatmentWillPanel;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency("FSKConfig") private fskConfig: FSKConfig,
        @Dependency(TreatmentWillCache) private treatmentWillCache: TreatmentWillCache
    ) {
    }

    public init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.moduleContext.getRootElement().appendChild(this.element);
    }

    public render(): void | Promise<never> {
        this.treatmentWillPanel = this.container.resolve(TreatmentWillPanel);
        this.treatmentWillPanel.render();
        this.element.appendChild(this.treatmentWillPanel.element);
    }

    public getId(): string {
        return TreatmentWillTab.TAB_ID;
    }

    public getTitle(): string {
        return TreatmentWillTab.TAB_TITLE;
    }

    public setVisible(visible: boolean): void {
        setElementVisible(this.element, visible);
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
            this.addListeners();
        } else {
            // Tab was de-selected
            this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        if (!TimelineUtil.useTreatmentWill(this.fskConfig)) {
            return false;
        }

        return FSKUserUtil.isFSKAdmin(userContext);
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            const isTreatmentWillStarted = TimelineUtil.useTreatmentWill(this.fskConfig);
            const isFSKAdmin = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
            const isPatientContext = applicationContextId === "PATIENT";

            if (isTreatmentWillStarted && isFSKAdmin && isPatientContext) {
                this.moduleContext.showTab(TreatmentWillTab.TAB_ID);
            } else {
                this.moduleContext.hideTab(TreatmentWillTab.TAB_ID);
            }
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 204;
    }

    public autoActivationAllowed(): boolean {
        return true;
    }

    public isTestFunctionality?(): boolean {
        return false;
    }

    private fetchDataFromCache() {
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
            this.treatmentWillPanel.setData(value);
        }
    }

    private addListeners() {
        if (!this.treatmentWillChangeHandler) {
            this.treatmentWillChangeHandler = (() => {
                if (isElementVisible(this.element)) {
                    this.fetchDataFromCache();
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
