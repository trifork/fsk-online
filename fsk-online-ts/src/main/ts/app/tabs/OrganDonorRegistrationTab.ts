import {
    CompareUtil,
    isElementVisible,
    ModuleContext,
    setElementVisible,
    TabbedPanel,
    UserContext,
    ValueChangeHandler
} from "fmko-ts-common";
import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import FSKService from "../services/FSKService";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import {
    ButtonStyle,
    DialogOption,
    PopupDialog,
    PopupDialogKind,
    SnackBar,
    StyledButton,
    WCAGRadioButton
} from "fmko-ts-widgets";
import FullAccessPermissionPanel from "../panels/organdonor-panels/FullAccessPermissionPanel";
import LimitedAccessPermissionPanel from "../panels/organdonor-panels/LimitedAccessPermissionPanel";
import FSKButtonStrategy from "../model/FSKButtonStrategy";
import ErrorUtil from "../util/ErrorUtil";
import FSKUserUtil from "../util/FSKUserUtil";
import PatientUtil from "../util/PatientUtil";
import RegistrationDatePanel from "../panels/registration-date-panel/RegistrationDatePanel";

@Component({
    template: require("./organDonorRegistrationTab.html")
})
export default class OrganDonorRegistrationTab implements TabbedPanel, Render {

    private static TAB_ID = "OrganDonorRegistrationTab_TS";
    private static TAB_TITLE = "Organdonorregister";

    public element: HTMLElement;

    private initialized: boolean;
    private shown: boolean;

    private lastSavedValue: FSKTypes.OrganDonorRegistrationType;

    private organRegistrationChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<FSKTypes.OrganDonorRegistrationType>>;

    private isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
    private isOdrCoordinator = FSKUserUtil.isFSKSupporter(this.moduleContext.getUserContext());

    @WidgetElement private mainPanel: HTMLDivElement;
    @WidgetElement private registrationDatePanel: RegistrationDatePanel;

    @WidgetElement private fullPermissionPanel: FullAccessPermissionPanel;
    @WidgetElement private limitedPermissionPanel: LimitedAccessPermissionPanel;

    private radioGroup: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>[] = [];
    private radioGroupValue: FSKTypes.OrganDonorPermissionType;
    @WidgetElement private fullPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private fullPermissionWithResearchRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private limitedPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private limitedPermissionWithResearchRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private dontKnowPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;
    @WidgetElement private restrictedPermissionRadio: WCAGRadioButton<FSKTypes.OrganDonorPermissionType>;

    private buttonStrategy: FSKButtonStrategy;
    @WidgetElement private createButton: StyledButton;
    @WidgetElement private updateButton: StyledButton;
    @WidgetElement private deleteButton: StyledButton;
    @WidgetElement private printButton: StyledButton;

    @WidgetElement private noRegistrationPanel: HTMLDivElement;
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
        setElementVisible(this.mainPanel, false);
        setElementVisible(this.noRegistrationPanel, false);

        // Main panel
        this.registrationDatePanel = this.container.resolve(RegistrationDatePanel);

        this.fullPermissionWithResearchRadio = new WCAGRadioButton<FSKTypes.OrganDonorPermissionType>({
            checkedValue: "FULL_WITH_RESEARCH",
            label: "til transplantation og forskning i forbindelse med donationen, " +
                "som har til hensigt at forbedre transplantationsresultater"
        });

        this.fullPermissionRadio = new WCAGRadioButton<FSKTypes.OrganDonorPermissionType>({
            checkedValue: "FULL",
            label: "udelukkende til transplantation"
        });

        this.fullPermissionPanel = this.container.resolve(FullAccessPermissionPanel);
        this.fullPermissionPanel.setIsFSKSupporter(this.isOdrCoordinator);
        this.fullPermissionPanel.render();
        this.fullPermissionPanel.setVisible(false);
        this.fullPermissionPanel.setEnabled(this.isAdminUser);
        this.fullPermissionPanel.addValueChangeHandler(() => {
            if (this.isAdminUser) {
                const valueHasChanged = this.isValueChanged();
                this.updateButton.setEnabled(
                    valueHasChanged
                    && isElementVisible(this.updateButton.element)
                );
                this.createButton.setEnabled(
                    valueHasChanged
                    && isElementVisible(this.createButton.element)
                );
            }
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

        this.limitedPermissionPanel = this.container.resolve(LimitedAccessPermissionPanel);
        this.limitedPermissionPanel.setIsFSKSupporter(this.isOdrCoordinator);
        this.limitedPermissionPanel.render();
        this.limitedPermissionPanel.setVisible(false);
        this.limitedPermissionPanel.setEnabled(this.isAdminUser);
        this.limitedPermissionPanel.addValueChangeHandler(() => {
            if (this.isAdminUser) {
                const isCheckboxChosen = this.limitedPermissionPanel.isAnyCheckboxChosen();
                const valueHasChanged = this.isValueChanged();
                this.updateButton.setEnabled(
                    valueHasChanged
                    && isCheckboxChosen
                    && isElementVisible(this.updateButton.element)
                );
                this.createButton.setEnabled(
                    valueHasChanged
                    && isCheckboxChosen
                    && isElementVisible(this.createButton.element)
                    && !!this.radioGroupValue
                );
            }
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
            radioButton.setEnabled(this.isAdminUser);

            radioButton.addValueChangeHandler(() => {
                this.setValue(radioButton.getCheckedValue());
                if (this.isAdminUser) {
                    this.updateButton.setEnabled(
                        this.isValueChanged()
                        && isElementVisible(this.updateButton.element));
                }
            });
        });

        // Buttons
        this.createButton = new StyledButton({
            text: "Opret registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: async () => {
                try {
                    const value = this.getValue();
                    if (value) {
                        this.buttonStrategy.disableButtons();
                        await this.fskService.createOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr(), value);
                        this.updateCache(true, "Organdonorregistering oprettet");
                    }
                } catch (error) {
                    PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
                }
            }
        });
        this.updateButton = new StyledButton({
            text: "Opdater registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: async () => {
                try {
                    const value = this.getValue();
                    if (value) {
                        this.buttonStrategy.disableButtons();
                        await this.fskService.updateOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr(), value);
                        this.updateCache(true, "Organdonorregistering opdateret");
                    }
                } catch (error) {
                    PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
                }
            }
        });
        this.deleteButton = new StyledButton({
            text: "Slet registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: async () => {
                try {
                    const yesOption = <DialogOption>{
                        buttonStyle: ButtonStyle.DEFAULT,
                        text: "Slet"
                    };

                    const noOption = <DialogOption>{
                        buttonStyle: ButtonStyle.SECONDARY,
                        text: "Fortryd"
                    };
                    const yesIsClicked = await PopupDialog.display(PopupDialogKind.WARNING, "Bekræft sletning",
                        "Er du sikker på du vil slette patientens organdonorregistrering?",
                        noOption, yesOption);
                    if (yesIsClicked === yesOption) {
                        this.buttonStrategy.disableButtons();
                        await this.fskService.deleteOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
                        this.updateCache(false, "Organdonorregistering slettet");
                    }
                } catch (error) {
                    PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
                }
            }
        });

        this.printButton = new StyledButton({
            text: "Print",
            style: ButtonStyle.DEFAULT,
            clickHandler: async () => {
                if (this.printButton.isVisible()) {
                    window.print();
                }
            }
        });

        this.buttonStrategy = new FSKButtonStrategy(this.moduleContext.getUserContext(),
            this.createButton,
            this.updateButton,
            this.deleteButton,
            this.printButton);

        if (this.isAdminUser) {
            this.printButton.setVisible(false);
            this.printButton.setEnabled(false);
            this.updateButton.setEnabled(false);
        } else if (this.isOdrCoordinator) {
            this.buttonStrategy.disableButtons();
        }

        this.buttonStrategy.hideButtons();
    }

    public getId(): string {
        return OrganDonorRegistrationTab.TAB_ID;
    }

    public getTitle(): string {
        return OrganDonorRegistrationTab.TAB_TITLE;
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
        return this.isOdrCoordinator || this.isAdminUser;
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

    private updateCache(hasRegistration: boolean, snackbarText: string) {
        this.fskOrganDonorCache.hasRegistration = hasRegistration;
        hasRegistration ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
        this.fskOrganDonorCache.organDonorRegister.setStale();
        SnackBar.show({headerText: snackbarText, delay: 5000});

        this.buttonStrategy.enableButtons();
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
            this.radioGroupValue = matchingRadio.getCheckedValue();
            if (newValue === "LIMITED" || newValue === "LIMITED_WITH_RESEARCH") {
                this.createButton.setEnabled(!!this.radioGroupValue && this.limitedPermissionPanel.isAnyCheckboxChosen());
                this.updateButton.setEnabled(this.limitedPermissionPanel.isAnyCheckboxChosen());
            } else {
                this.createButton.setEnabled(!!this.radioGroupValue);
                this.updateButton.setEnabled(true);
            }
            this.showCorrespondingDetailPanel(this.radioGroupValue);
        }
    }

    private showCorrespondingDetailPanel(type: FSKTypes.OrganDonorPermissionType) {
        this.fullPermissionPanel.setVisible(type === "FULL" || type === "FULL_WITH_RESEARCH");
        this.limitedPermissionPanel.setVisible(type === "LIMITED" || type === "LIMITED_WITH_RESEARCH");
    }

    private getValue(): FSKTypes.OrganDonorRegistrationType {
        const type = this.radioGroupValue;
        if (type) {
            if (type === "FULL" || type === "FULL_WITH_RESEARCH") {
                return {
                    permissionType: type,
                    requiresRelativeAcceptance: this.fullPermissionPanel.getValue().requiresRelativeAcceptance
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

    private addListeners() {
        if (this.fskOrganDonorCache.organDonorRegister.getValue() !== undefined) {
            this.fetchDataFromCache();
        }
        if (!this.organRegistrationChangeHandler) {
            this.organRegistrationChangeHandler = (() => {
                if (isElementVisible(this.element)) {
                    this.fetchDataFromCache();
                }
            });
            this.fskOrganDonorCache.organDonorRegister.addValueChangeHandler(this.organRegistrationChangeHandler);
        }
    }

    private removeListeners() {
        if (this.organRegistrationChangeHandler) {
            this.fskOrganDonorCache.organDonorRegister.removeValueChangeHandler(this.organRegistrationChangeHandler);
            this.organRegistrationChangeHandler = undefined;
        }
        if (this.initialized) {
            setElementVisible(this.mainPanel, false);
            setElementVisible(this.noRegistrationPanel, false);
        }
    }

    private fetchDataFromCache() {
        const value = this.fskOrganDonorCache.organDonorRegister.getValue();
        const loading = this.fskOrganDonorCache.organDonorRegister.isLoading();
        const failed = this.fskOrganDonorCache.organDonorRegister.isFailed();

        if (loading) {
            if (this.initialized) {
                // do nothing
            }
        } else if (failed) {
            // do nothing
        } else {
            this.setData(value);
        }
    }

    private setData(value: FSKTypes.RegistrationTypeWrapper<FSKTypes.OrganDonorRegistrationType> | null | undefined): void {
        this.lastSavedValue = value && value.registrationType;
        const registrationDate = value && value.datetime;

        const type = this.lastSavedValue ? this.lastSavedValue.permissionType : undefined;

        if (!type) {
            this.radioGroupValue = null;
        }

        setElementVisible(this.mainPanel, this.isAdminUser || !!type);
        setElementVisible(this.noRegistrationPanel, !this.isAdminUser && !type);

        this.registrationDatePanel.setValue(registrationDate);
        if (!!type) {
            this.registrationDatePanel.render();
        }

        const patientNameElement = document.createElement("strong");
        patientNameElement.textContent = PatientUtil.getFullName(this.moduleContext.getPatient());
        this.noRegistrationText.append(
            patientNameElement,
            " har ikke bekræftet sin tilmelding til Organdonorregistreret"
        );

        this.createButton.setEnabled(!!type);

        this.radioGroup.forEach(radioButton => {
            if (radioButton.getCheckedValue() === type) {
                this.setValue(radioButton.getCheckedValue());
                radioButton.setEnabled(true);
                radioButton.setChecked(true);
            } else {
                radioButton.setEnabled(this.isAdminUser);
                radioButton.setChecked(false);
            }
        });

        if (type === "FULL" || type === "FULL_WITH_RESEARCH") {
            this.fullPermissionPanel.setValue(this.lastSavedValue);
            this.limitedPermissionPanel.setValue(undefined);
        } else if (type === "LIMITED" || type === "LIMITED_WITH_RESEARCH") {
            this.fullPermissionPanel.setValue(undefined);
            this.limitedPermissionPanel.setValue(value.registrationType);
        } else {
            this.fullPermissionPanel.setValue(undefined);
            this.limitedPermissionPanel.setValue(undefined);
        }
        this.showCorrespondingDetailPanel(type);

        // set edit or create mode
        this.lastSavedValue ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
    }

    private isValueChanged(): boolean {
        return !CompareUtil.deepEquals(this.lastSavedValue, this.getValue());
    }
}
