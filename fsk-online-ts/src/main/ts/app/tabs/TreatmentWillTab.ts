import {ModuleContext, TabbedPanel, UserContext} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {ButtonStyle, CheckboxWrapper, StyledButton} from "fmko-ts-widgets";
import TreatmentWillWishPanel from "../panels/treatment-will-testament-panels/TreatmentWillWishPanel";

export default class TreatmentWillTab extends TemplateWidget implements TabbedPanel {
    private ID = "TreatmentWillTab_TS";
    private TITLE = "Behandlingstestamente";
    private shown;

    public static deps = () => [IoC, "ModuleContext", "RootElement"];

    public constructor(protected container: IoC, private moduleContext: ModuleContext, private rootElement: HTMLElement) {
        super(container);
        this.element = document.createElement(`div`);
    }

    public getTemplate(): string {
        return loadTemplate("tabs/treatmentWillTab.html");
    }

    public setupBindings(): void {


        const terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        const terminallyIllPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);

        this.addAndReplaceWidgetByVarName(terminallyIllPanel,`terminally-ill-panel`);

        const illNoImprovementCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-no-improvement-checkbox`));
        const illNoImprovementPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);

        this.addAndReplaceWidgetByVarName(illNoImprovementPanel,`ill-no-improvement-panel`);

        const illWithPermanentPainCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-with-permanent-pain-checkbox`));
        const illWithPermanentPainPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);

        this.addAndReplaceWidgetByVarName(illWithPermanentPainPanel,`ill-with-permanent-pain-panel`);

        const treatmentByForceCheckbox = new CheckboxWrapper(this.getElementByVarName(`treatment-by-force-checkbox`));
        const treatmentByForcePanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);

        this.addAndReplaceWidgetByVarName(treatmentByForcePanel,`treatment-by-force-panel`);

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

    setVisible(visible: boolean): any {
        super.setVisible(visible);

        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            this.init();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return true;
    }

    public applicationContextIdChanged(applicationContextId: string): any {
        if (applicationContextId === "PATIENT") {
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

}