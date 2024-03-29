import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler} from "fmko-ts-common";
import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import LivingWillCache from "../services/LivingWillCache";
import FSKConfig from "../main/FSKConfig";
import FSKUserUtil from "../util/FSKUserUtil";
import TimelineUtil from "../util/TimelineUtil";
import {RegistrationState} from "../model/RegistrationState";
import LivingWillPanel from "../panels/living-will-panels/LivingWillPanel";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillTestamentTab extends TemplateWidget implements TabbedPanel {
    private ID = "LivingWillTestamentTab_TS";
    private TITLE = "Livstestamente";
    private shown: boolean;
    private initialized: boolean;
    private isAdministratorUser = false;

    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<LivingWillType>>;
    private livingWillPanel: LivingWillPanel;

    public static deps = () => [IoC, "ModuleContext", "FSKConfig", LivingWillCache, "RootElement"];

    constructor(protected container: IoC,
        private moduleContext: ModuleContext,
        private fskConfig: FSKConfig,
        private livingWillCache: LivingWillCache,
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
        return require("./livingWillTestamentTab.html");
    }

    public setupBindings(): void {
        this.livingWillPanel = this.container.resolve<LivingWillPanel>(LivingWillPanel);
        this.addAndReplaceWidgetByVarName(this.livingWillPanel, `living-will-panel`);
        this.rootElement.appendChild(this.element);
    }

    public override tearDownBindings(): void {
        // unused
    }

    public getId(): string {
        return this.ID;
    }

    public getTitle(): string {
        return this.TITLE;
    }

    public autoActivationAllowed(): boolean {
        return true;
    }

    public override async setVisible(visible: boolean): Promise<void> {
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
        this.isAdministratorUser = FSKUserUtil.isFSKAdmin(userContext);
        return this.isAdministratorUser;
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            const useLivingWill = !TimelineUtil.useTreatmentWill(this.fskConfig);
            const isPatientContext = applicationContextId === "PATIENT";

            if (this.isAdministratorUser && isPatientContext && useLivingWill) {
                this.moduleContext.showTab(this.ID);
            } else if (this.isAdministratorUser
                && isPatientContext
                && await this.livingWillCache.loadHasRegistration() === RegistrationState.REGISTERED) {
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
        return 202;
    }

    public render() {
        const value = this.livingWillCache.livingWill.getValue();
        const loading = this.livingWillCache.livingWill.isLoading();
        const failed = this.livingWillCache.livingWill.isFailed();

        if (loading) {
            if (this.initialized) {
                // ignored
            }
        } else if (failed) {
            // this.livingWillPanel.setData(value);
        } else {
            this.livingWillPanel.setData(value);
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
