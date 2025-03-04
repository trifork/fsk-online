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
import LivingWillCache from "../services/LivingWillCache";
import FSKConfig from "../main/FSKConfig";
import FSKUserUtil from "../util/FSKUserUtil";
import TimelineUtil from "../util/TimelineUtil";
import LivingWillType = FSKTypes.LivingWillType;
import LivingWillPanel from "../panels/living-will-panels/LivingWillPanel";
import {RegistrationState} from "../model/RegistrationState";

@Component({
    template: require("./livingWillTab.html")
})
export default class LivingWillTab implements TabbedPanel, Render {
    private static TAB_ID = "LivingWillTestamentTab_TS";
    private static TAB_TITLE = "Livstestamente";

    public element: HTMLElement;

    private shown: boolean;
    private initialized: boolean;
    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());

    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<LivingWillType>>;

    @WidgetElement private livingWillPanel: LivingWillPanel;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency("FSKConfig") private fskConfig: FSKConfig,
        @Dependency(LivingWillCache) private livingWillCache: LivingWillCache
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
        this.livingWillPanel = this.container.resolve(LivingWillPanel);
        this.livingWillPanel.render();
        this.element.appendChild(this.livingWillPanel.element);
    }

    public getId(): string {
        return LivingWillTab.TAB_ID;
    }

    public getTitle(): string {
        return LivingWillTab.TAB_TITLE;
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
        return this.isAdminUser;
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            const useLivingWill = !TimelineUtil.useTreatmentWill(this.fskConfig);
            const isPatientContext = applicationContextId === "PATIENT";

            if (this.isAdminUser && isPatientContext && useLivingWill) {
                this.moduleContext.showTab(LivingWillTab.TAB_ID);
            } else if (this.isAdminUser
                        && isPatientContext
                        && await this.livingWillCache.loadHasRegistration() === RegistrationState.REGISTERED) {
                this.moduleContext.showTab(LivingWillTab.TAB_ID);
            } else {
                this.moduleContext.hideTab(LivingWillTab.TAB_ID);
            }
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 202;
    }

    public autoActivationAllowed(): boolean {
        return true;
    }

    private fetchDataFromCache() {
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
            this.livingWillPanel.setData(value);
        }
    }

    private addListeners() {
        if (!this.livingWillChangeHandler) {
            this.livingWillChangeHandler = (() => {
                if (isElementVisible(this.element)) {
                    this.fetchDataFromCache();
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
