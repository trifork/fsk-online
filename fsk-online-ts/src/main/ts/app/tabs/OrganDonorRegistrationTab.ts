import {ModuleContext, TabbedPanel, UserContext, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {RadioButton, Checkbox, RadioGroup, HTML} from "fmko-ts-widgets";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";

export default class OrganDonorRegistrationTab extends TemplateWidget implements TabbedPanel {
    private ID = "OrganDonorRegistrationTab_TS";
    private TITLE = "Organdonorregister";
    private shown;

    public static deps = () => [IoC, "ModuleContext", "RootElement"];

    constructor(protected container: IoC, private moduleContext: ModuleContext, private rootElement: HTMLElement) {
        super(container);
        this.element = document.createElement(`div`);
    }

    public getTemplate(): string {
        return loadTemplate("tabs/organDonorRegistrationTab.html");
    }

    public setupBindings(): void {

        const fullPermissionCheckBox = new Checkbox(false, `Min fulde tilladelse forudsætter mine pårørendes accept`);
        const fullPermissionRadioButton = new RadioButton(fullPermissionCheckBox, `Jeg giver hermed fuld tilladelse til, at mine organer kan anvendes til transplantation efter min død.`, true);


        const radioButtonId = this.idSynthesizer.createId();

        this.addAndReplaceWidgetByVarName(fullPermissionRadioButton.getWrappedButton(radioButtonId), `full-permission-radio`);
        this.addAndReplaceWidgetByVarName(fullPermissionCheckBox, `full-permission-widget`);

        const limitedAccessPanel = this.container.resolve<LimitedAccessPermissionPanel>(LimitedAccessPermissionPanel);
        limitedAccessPanel.setVisible(false);
        const limitedPermissionRadioButton = new RadioButton(limitedAccessPanel, `Jeg giver hermed begrænset tillade til, at de organer, jeg har sat krdyds ud for, kan anvendes til transplantation efter min død.`)

        this.addAndReplaceWidgetByVarName(limitedPermissionRadioButton.getWrappedButton(radioButtonId), `limited-permission-radio`);
        this.addAndReplaceWidgetByVarName(limitedAccessPanel, `limited-permission-widget`);

        const placeholderWidget = new Widget();
        placeholderWidget.element = document.createElement(`span`);
        placeholderWidget.setVisible(false);

        const dontKnowPermissionRadioButton = new RadioButton(
            placeholderWidget,
            `Jeg tager ikke stilling, jeg overlader det i stedet til mine nærmeste pårørende at tage stilling til, om mine organer kan anvendes til transplantation efter min død`
        );
        this.addAndReplaceWidgetByVarName(dontKnowPermissionRadioButton.getWrappedButton(radioButtonId), `dont-know-permission-radio`);

        const restrictedPermissionRadioButton = new RadioButton(placeholderWidget, `Jeg modsætter mig, at mine organer anvendes til transplantation efter min død`);
        this.addAndReplaceWidgetByVarName(restrictedPermissionRadioButton.getWrappedButton(radioButtonId), `restricted-permission-radio`);

        const radioGroup = new RadioGroup<Widget>([
            fullPermissionRadioButton,
            limitedPermissionRadioButton,
            dontKnowPermissionRadioButton,
            restrictedPermissionRadioButton
        ], this.idSynthesizer, false);

        radioGroup.addValueChangeHandler(handler => {
            const value = handler.getValue();
            radioGroup.getRadioButtons().forEach(radioButton => {
                radioButton.getValue().setVisible(value === radioButton.getValue());
            });
        });
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
        return 201;
    }

}