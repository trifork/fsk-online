import {CompareUtil, ImageSrc, ModuleContext, setElementVisible, TabbedPanel, UserContext} from "fmko-ts-common";
import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import FSKService from "../services/FSKService";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import {
    ButtonStyle,
    ImageDimensions,
    InfoPanel,
    InfoPanelSeverity,
    StyledButton,
    WCAGRadioButton
} from "fmko-ts-widgets";
import FullAccessPermissionPanel from "../panels/organdonor-panels/FullAccessPermissionPanel";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";

@Component({
    template: require("./organDonorRegistrationTab_2.html")
})
export default class OrganDonorRegistrationTab_2 implements TabbedPanel, Render {

    private static TAB_ID = "OrganDonorRegistrationTab_TS_2";
    private static TAB_TITLE = "Organdonorregister_2";

    public element: HTMLElement;

    private initialized: boolean;
    private shown: boolean;

    @WidgetElement private fullPermissionPanel: FullAccessPermissionPanel;
    @WidgetElement private limitedPermissionPanel: LimitedAccessPermissionPanel;

    @WidgetElement private mainPanel: HTMLDivElement;
    @WidgetElement private registrationDate: InfoPanel;

    private radioGroup: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>[] = [];
    @WidgetElement private fullPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private fullPermissionWithResearchRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private limitedPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private limitedPermissionWithResearchRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private dontKnowPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private restrictedPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;

    @WidgetElement private createButton: StyledButton;
    @WidgetElement private updateButton: StyledButton;
    @WidgetElement private deleteButton: StyledButton;
    @WidgetElement private printButton: StyledButton;

    @WidgetElement private noRegistrationText: HTMLSpanElement;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency(FSKService) private fskService: FSKService,
        @Dependency(FSKOrganDonorCache) private fskOrganDonorCache: FSKOrganDonorCache
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
        const registrationDate = "en eller anden dato"; // TODO fix
        this.registrationDate = new InfoPanel({
            description: `Registreringen er bekræftet og ændret: ${registrationDate}`,
            severity: InfoPanelSeverity.INFO,
            imageOptions: {
                alt: "info sign",
                src: ImageSrc.INFO,
                imageSize: ImageDimensions.S
            }
        });
        this.registrationDate.setVisible(true);

        this.fullPermissionWithResearchRadio = new WCAGRadioButton<FSKTypes.OrganDonorPermissionType>({
            checkedValue: "FULL_WITH_RESEARCH",
            label: "til transplantation og forskning i forbindelse med donationen, " +
                "som har til hensigt at forbedre transplantationsresultater"
        });
        this.fullPermissionRadio = new WCAGRadioButton<FSKTypes.OrganDonorPermissionType>({
            checkedValue: "FULL",
            label: "udelukkende til transplantation"
        });

        this.limitedPermissionWithResearchRadio = new WCAGRadioButton({
            checkedValue: "LIMITED_WITH_RESEARCH",
            label: "til transplantation og forskning i forbindelse med donationen, " +
                "som har til hensigt at forbedre transplantationsresultater"
        });
        this.limitedPermissionRadio = new WCAGRadioButton({
            checkedValue: "LIMITED",
            label: "udelukkende til transplantation"
        });
        this.dontKnowPermissionRadio = new WCAGRadioButton({
            checkedValue: "DONT_KNOW",
            label: ""
        });
        const dontKnowStrongTextElement = document.createElement("strong");
        dontKnowStrongTextElement.textContent = "overlader det i stedet til sine nærmeste pårørende";
        this.dontKnowPermissionRadio.element.querySelector("label").append(
            "Patienten ",
            dontKnowStrongTextElement,
            " at tage stilling til, om patientens organer må anvendes til transplantation og forskning ",
            "efter sin død"
        );
        this.restrictedPermissionRadio = new WCAGRadioButton({
            checkedValue: "NONE",
            label: ""
        });
        const restrictedStrongTextElement = document.createElement("strong");
        restrictedStrongTextElement.textContent = "modsætter sig, at patientens organer anvendes";
        this.restrictedPermissionRadio.element.querySelector("label").append(
            "Patienten ",
            restrictedStrongTextElement,
            " til transplantation efter sin død"
        );

        this.radioGroup.push(
            this.fullPermissionWithResearchRadio,
            this.fullPermissionRadio,
            this.limitedPermissionWithResearchRadio,
            this.limitedPermissionRadio,
            this.dontKnowPermissionRadio,
            this.restrictedPermissionRadio
        );

        this.radioGroup.forEach((radioButton) => {
            radioButton.addValueChangeHandler(() =>
                this.setValue(radioButton.getCheckedValue()));
        });

        this.fullPermissionPanel = this.container.resolve(FullAccessPermissionPanel);
        this.limitedPermissionPanel = this.container.resolve(LimitedAccessPermissionPanel);

        this.createButton = new StyledButton({
            text: "Opret registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: () => {
                // TODO Do something
            }
        });
        this.updateButton = new StyledButton({
            text: "Opdater registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: () => {
                // TODO Do something
            }
        });
        this.deleteButton = new StyledButton({
            text: "Slet registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: () => {
                // TODO Do something
            }
        });
        this.printButton = new StyledButton({
            text: "Print",
            style: ButtonStyle.DEFAULT,
            clickHandler: () => {
                // TODO Do something
            }
        });

        const patientNameElement = document.createElement("strong");
        patientNameElement.textContent = "Dude"; // TODO fix navn
        this.noRegistrationText.append(
            patientNameElement,
            " har ikke bekræftet sin tilmelding til Organdonorregistreret"
        );
    }

    public getId(): string {
        return OrganDonorRegistrationTab_2.TAB_ID;
    }

    public getTitle(): string {
        return OrganDonorRegistrationTab_2.TAB_TITLE;
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
            // TODO this.addListeners();
        } else {
            // Tab was de-selected
            // TODO this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return true;
    }

    public applicationContextIdChanged(applicationContextId: string): void {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            if (applicationContextId === "PATIENT") {
                this.moduleContext.showTab(this.getId());
            } else {
                this.moduleContext.hideTab(this.getId());
            }
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 201;
    }

    public autoActivationAllowed(): boolean {
        return true;
    }

    public isTestFunctionality?(): boolean {
        return false;
    }

    private setValue(newValue: FSKTypes.OrganDonorPermissionType | null | undefined): void {
        for (const radioButton of this.radioGroup) {
            if (!radioButton.isChecked()) {
                continue;
            }
            radioButton.setChecked(false);
        }

        const matchingRadio = this.radioGroup.find(radioButton => CompareUtil.deepEquals(radioButton.getCheckedValue(), newValue));

        if (!!matchingRadio) {
            matchingRadio.setChecked(true);
        }
    }

    private getValue(): FSKTypes.OrganDonorRegistrationType {
        const type = this.radioGroup.find(radioButton => radioButton.isChecked()).getCheckedValue();

        if (type) {
            if (type === "FULL" || type === "FULL_WITH_RESEARCH") {
                return {
                    permissionType: type,
                    requiresRelativeAcceptance: this.fullPermissionPanel.getRequiresRelativeAcceptance()
                };
            } else if (type === "LIMITED" || type === "LIMITED_WITH_RESEARCH") {
                const value = this.limitedPermissionPanel.getValue();
                if (value) {
                    value.permissionType = type;
                }
                return value;
            } else if (type === "NONE" || type === "DONT_KNOW") {
                return {permissionType: type};
            }
        }
    }
}
