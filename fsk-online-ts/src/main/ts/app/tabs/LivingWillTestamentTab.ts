import {ModuleContext, TabbedPanel, UserContext} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {CheckboxWrapper} from "fmko-ts-widgets";
import SDSButton from "../elements/SDSButton";

export default class LivingWillTestamentTab extends TemplateWidget implements TabbedPanel {
    private ID = "LivingWillTestamentTab_TS";
    private TITLE = "Livstestamente";
    private shown: boolean;
    private initialized: boolean;

    public static deps = () => [IoC, "ModuleContext", "RootElement"];

    public constructor(protected container: IoC, private moduleContext: ModuleContext, private rootElement: HTMLElement) {
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

    public setupBindings(): void {

        // const terminallyIllCheckbox = new Checkbox(false, `Jeg er i en situation, hvor jeg er uafvendeligt døende`);
        // this.addAndReplaceWidgetByVarName(terminallyIllCheckbox, `terminally-ill-checkbox`);

        const terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        const severelyHandicappedCheckbox = new CheckboxWrapper(this.getElementByVarName(`severely-handicapped-checkbox`));

        const updateButton = new SDSButton(`Opdatér`, "primary");
        this.addAndReplaceWidgetByVarName(updateButton, `update-button`);

        const deleteButton = new SDSButton(`Slet`, "danger");
        this.addAndReplaceWidgetByVarName(deleteButton, `delete-button`);

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
        return 202;
    }

}