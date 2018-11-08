import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKConfig from "../main/FSKConfig";
import FSKUserUtil from "../util/FSKUserUtil";
import TimelineUtil from "../util/TimelineUtil";
import TreatmentWillPanel from "../panels/treatment-will-panels/TreatmentWillPanel";

export default class TreatmentWillTab extends TemplateWidget implements TabbedPanel {
    private ID = "TreatmentWillTab_TS";
    private TITLE = "Behandlingstestamente";
    private shown: boolean;
    private initialized: boolean;
    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.TreatmentWillType>;
    private treatmentWillPanel: TreatmentWillPanel;

    public static deps = () => [IoC, "ModuleContext", "FSKConfig", TreatmentWillCache, "RootElement"];

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext,
                       private fskConfig: FSKConfig,
                       private treatmentWillCache: TreatmentWillCache,
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

    public setupBindings(): any {
        this.treatmentWillPanel = this.container.resolve<TreatmentWillPanel>(TreatmentWillPanel);
        this.addAndReplaceWidgetByVarName(this.treatmentWillPanel, `treatment-will-panel`);
        this.rootElement.appendChild(this.element);
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
        if (!TimelineUtil.useTreatmentWill(this.fskConfig)) {
            return false;
        }

        return FSKUserUtil.isFSKAdmin(userContext);
    }

    public async applicationContextIdChanged(applicationContextId: string): Promise<void> {

        const isTreatmentWillStarted = TimelineUtil.useTreatmentWill(this.fskConfig);
        const isFSKAdmin =FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
            const isPatientContext = applicationContextId === "PATIENT";

        if (isTreatmentWillStarted && isFSKAdmin && isPatientContext) {
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

    public render() {
        const value = this.treatmentWillCache.treatmentWill.getValue();
        const loading = this.treatmentWillCache.treatmentWill.isLoading();
        const failed = this.treatmentWillCache.treatmentWill.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {
            this.treatmentWillPanel.setData(null);
        } else {
            this.treatmentWillPanel.setData(value);
        }
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