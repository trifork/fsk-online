import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {RadioButton, RadioGroup} from "fmko-ts-widgets";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import FullAccessPermissionPanel from "../panels/organdonor-panels/FullAccessPermissionPanel";
import {IOrganDonor} from "../model/OrganDonorRegistrationType";
import DontKnowAccessPermissionPanel from "../panels/organdonor-panels/DontKnowAccessPermissionPanel";
import NoAccessPermissionPanel from "../panels/organdonor-panels/NoAccessPermissionPanel";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistration;

export default class OrganDonorRegistrationTab extends TemplateWidget implements TabbedPanel {
    private ID = "OrganDonorRegistrationTab_TS";
    private TITLE = "Organdonorregister";
    private shown: boolean;
    private initialized: boolean;
    private OrganRegistrationChangeHandler: ValueChangeHandler<FSKTypes.OrganDonorRegistration>;

    private radioGroup: RadioGroup<Widget & IOrganDonor<FSKTypes.OrganDonorRegistration>>;

    public static deps = () => [IoC, "ModuleContext", FSKOrganDonorCache, "RootElement"];

    constructor(protected container: IoC, private moduleContext: ModuleContext, private fskOrganDonorCache: FSKOrganDonorCache, private rootElement: HTMLElement) {
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
        return loadTemplate("tabs/organDonorRegistrationTab.html");
    }

    public setupBindings(): void {

        const fullAccessPermissionPanel = new FullAccessPermissionPanel();
        const fullPermissionRadioButton = new RadioButton(fullAccessPermissionPanel, `Jeg giver hermed fuld tilladelse til, at mine organer kan anvendes til transplantation efter min død.`, true);

        this.addAndReplaceWidgetByVarName(fullPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `full-permission-radio`);
        this.addAndReplaceWidgetByVarName(fullAccessPermissionPanel, `full-permission-widget`);

        const limitedAccessPanel = this.container.resolve<LimitedAccessPermissionPanel>(LimitedAccessPermissionPanel);
        limitedAccessPanel.setVisible(false);
        const limitedPermissionRadioButton = new RadioButton(limitedAccessPanel, `Jeg giver hermed begrænset tillade til, at de organer, jeg har sat krdyds ud for, kan anvendes til transplantation efter min død.`);

        this.addAndReplaceWidgetByVarName(limitedPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `limited-permission-radio`);
        this.addAndReplaceWidgetByVarName(limitedAccessPanel, `limited-permission-widget`);

        const dontKnowPermissionPanel = new DontKnowAccessPermissionPanel();

        const dontKnowPermissionRadioButton = new RadioButton(
            dontKnowPermissionPanel,
            `Jeg tager ikke stilling, jeg overlader det i stedet til mine nærmeste pårørende at tage stilling til, om mine organer kan anvendes til transplantation efter min død`
        );
        this.addAndReplaceWidgetByVarName(dontKnowPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `dont-know-permission-radio`);

        const noAccessPermissionPanel = new NoAccessPermissionPanel();

        const restrictedPermissionRadioButton = new RadioButton(noAccessPermissionPanel, `Jeg modsætter mig, at mine organer anvendes til transplantation efter min død`);
        this.addAndReplaceWidgetByVarName(restrictedPermissionRadioButton.getWrappedButton(this.idSynthesizer.createId()), `restricted-permission-radio`);

        this.radioGroup = new RadioGroup<Widget & IOrganDonor<FSKTypes.OrganDonorRegistration>>([
            fullPermissionRadioButton,
            limitedPermissionRadioButton,
            dontKnowPermissionRadioButton,
            restrictedPermissionRadioButton
        ], this.idSynthesizer, false);

        this.radioGroup.addValueChangeHandler(handler => {
            const value = handler.getValue();
            this.radioGroup.getRadioButtons().forEach(radioButton => {
                radioButton.getValue().setVisible(value === radioButton.getValue());
            });
        });
        this.rootElement.appendChild(this.element);
    }

    public setData(organDonorRegistration: OrganDonorRegistration): void {
        const type = organDonorRegistration.permissionType;

        this.radioGroup.getRadioButtons().forEach(button => {
            if (button.getValue().getType() === type) {
                this.radioGroup.setValue(button.getValue(), false);
                button.getValue().setValue(organDonorRegistration);
                button.getInput().checked = true;
                button.getValue().setVisible(true);
            } else {
                button.getValue().setVisible(false);
            }
        });
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
            this.addListeners();
            this.init();
            this.render();
        } else {
            this.removeListeners();
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

    public render() {
        const value = this.fskOrganDonorCache.organDonorRegister.getValue();
        const loading = this.fskOrganDonorCache.organDonorRegister.isLoading();
        const failed = this.fskOrganDonorCache.organDonorRegister.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {

        } else {
            this.setData(value);
        }
    }

    private addListeners() {
        if (!this.OrganRegistrationChangeHandler) {
            this.OrganRegistrationChangeHandler = (() => {
                if (this.isVisible()) {
                    this.render();
                }
            });
            this.fskOrganDonorCache.organDonorRegister.addValueChangeHandler(this.OrganRegistrationChangeHandler);
        }
    }

    private removeListeners() {
        if (this.OrganRegistrationChangeHandler) {
            this.fskOrganDonorCache.organDonorRegister.removeValueChangeHandler(this.OrganRegistrationChangeHandler);
            this.OrganRegistrationChangeHandler = undefined;
        }
    }

}