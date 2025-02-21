import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {
    ButtonStyle,
    DialogOption,
    HasValueWidget,
    ImageDimensions,
    InfoPanel,
    InfoPanelSeverity,
    PopupDialog,
    PopupDialogKind,
    SnackBar,
    StyledButton,
    WCAGCheckbox
} from "fmko-ts-widgets";
import {CompareUtil, ImageSrc, ModuleContext, setElementVisible, ValueChangeEvent} from "fmko-ts-common";
import ErrorUtil from "../../util/ErrorUtil";
import FSKUserUtil from "../../util/FSKUserUtil";
import PatientUtil from "../../util/PatientUtil";
import TreatmentWillCache from "../../services/TreatmentWillCache";
import FSKService from "../../services/FSKService";
import LivingWillCache from "../../services/LivingWillCache";
import FSKConfig from "../../main/FSKConfig";
import {RegistrationState} from "../../model/RegistrationState";
import RegistrationStateUtil from "../../util/RegistrationStateUtil";
import TreatmentWillWishPanel_2 from "./TreatmentWillWishPanel_2";
import RegistrationDatePanel from "../registration-date-panel/RegistrationDatePanel";
import {ButtonStrategy_ODR} from "../../model/ButtonStrategy_ODR";
import FSKButtonStrategy_ODR from "../../model/FSKButtonStrategy_ODR";
import TreatmentWillValueType = FSKTypes.TreatmentWillValueType;
import TreatmentWillType = FSKTypes.TreatmentWillType;

@Component ({
    template: require("./treatmentWillPanel_2.html")
})
export default class TreatmentWillPanel_2
    extends HasValueWidget<FSKTypes.TreatmentWillType>
    implements Render {
    private lastSavedValue: FSKTypes.TreatmentWillType;

    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
    private readonly isDentist = FSKUserUtil.isDentistWithoutElevatedRights(this.moduleContext.getUserContext());
    private isReadOnlySet: boolean;

    @WidgetElement private mainPanel: HTMLDivElement;
    @WidgetElement private registrationDatePanel: RegistrationDatePanel;
    @WidgetElement private livingWillExistsWarning: InfoPanel;
    @WidgetElement private lifeProlongingSection: HTMLDivElement;

    @WidgetElement private terminallyIllCheckbox: WCAGCheckbox;
    @WidgetElement private illNoImprovementCheckbox: WCAGCheckbox;
    @WidgetElement private illWithPermanentPainCheckbox: WCAGCheckbox;
    @WidgetElement private treatmentByForceCheckbox: WCAGCheckbox;

    @WidgetElement private illNoImprovementPanel: TreatmentWillWishPanel_2;
    @WidgetElement private illWithPermanentPainPanel: TreatmentWillWishPanel_2;
    @WidgetElement private treatmentByForcePanel: TreatmentWillWishPanel_2;

    private buttonStrategy: ButtonStrategy_ODR;
    @WidgetElement private createButton: StyledButton;
    @WidgetElement private updateButton: StyledButton;
    @WidgetElement private deleteButton: StyledButton;

    @WidgetElement private noRegistrationPanel: HTMLDivElement;
    @WidgetElement private noRegistrationText: HTMLSpanElement;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency("FSKConfig") private fskConfig: FSKConfig,
        @Dependency(FSKService) private fskService: FSKService,
        @Dependency(LivingWillCache) private livingWillCache: LivingWillCache,
        @Dependency(TreatmentWillCache) private treatmentWillCache: TreatmentWillCache
    ) {
        super();
    }

    public render(): void | Promise<never> {
        this.setupButtons();

        this.registrationDatePanel = this.container.resolve(RegistrationDatePanel);

        this.livingWillExistsWarning = new InfoPanel({
            description: "Vær opmærksom! Patienten har en livstestamenteregistering, der " +
                "vil blive slettet, når der oprettes en behandlingstestamenteregistering",
            severity: InfoPanelSeverity.WARNING,
            imageOptions: {
                src: ImageSrc.ATTENTION,
                alt: "Advarsel",
                imageSize: ImageDimensions.L
            }
        });
        if (!this.isDentist) { // don't check livingWill existence for dentists
            this.warningIfLivingWillExist(this.livingWillCache.loadHasRegistration());
        }

        this.terminallyIllCheckbox = new WCAGCheckbox({
            label: "Hvis patienten ligger for døden (dvs. er uafvendeligt døende)"
        });
        this.addHandlerForCheckboxAndPanel(this.terminallyIllCheckbox);

        this.illNoImprovementCheckbox = new WCAGCheckbox({
            label: "Hvis patienten ligger hjælpeløs hen pga. sygdom, ulykke mv, og der ikke er tegn på bedring"
        });
        this.illNoImprovementPanel = this.container.resolve(TreatmentWillWishPanel_2);
        this.illNoImprovementPanel.render();
        this.addHandlerForCheckboxAndPanel(this.illNoImprovementCheckbox, this.illNoImprovementPanel);

        this.illWithPermanentPainCheckbox = new WCAGCheckbox({
            label: "Hvis livsforlængende behandling kan føre til, at patienten overlever, men de fysiske konsekvenser" +
                "af patientens sygdom eller behandling vurderes at være meget alvorlige og lidelsesfulde"
        });
        this.illWithPermanentPainPanel = this.container.resolve(TreatmentWillWishPanel_2);
        this.illWithPermanentPainPanel.render();
        this.addHandlerForCheckboxAndPanel(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel);

        // hide the section with the fields above for dentists
        setElementVisible(this.lifeProlongingSection, !this.isDentist);

        this.treatmentByForceCheckbox = new WCAGCheckbox({
            label: "Hvis patienten er umyndiggjort og der er tale om tvang"
        });
        this.treatmentByForcePanel = this.container.resolve(TreatmentWillWishPanel_2);
        this.treatmentByForcePanel.render();
        this.addHandlerForCheckboxAndPanel(this.treatmentByForceCheckbox, this.treatmentByForcePanel);
    }

    public override setValue(newValue: TreatmentWillType, fireEvents?: boolean) {
        // Not used
    }

    public getValue(): TreatmentWillType {
        this.updateValue();
        return this.value;
    }

    public getTreatmentValue(checkBox: WCAGCheckbox, panel?: TreatmentWillWishPanel_2): TreatmentWillValueType | boolean {
        const isChecked = !!checkBox.getValue();
        if (!panel) {
            return isChecked;
        }
        const panelValue = panel.getValue();
        if (!isChecked || panelValue == undefined) {
            return <TreatmentWillValueType>{
                $: isChecked
            };
        }
        return <TreatmentWillValueType>{
            acceptanceNeeded: panelValue,
            $: isChecked
        };
    }

    public setupButtons(): void {
        const createHandler = async () => {
            try {
                const hasRegisteredLivingWill: boolean = this.livingWillCache.registrationState === RegistrationState.REGISTERED;
                this.buttonStrategy.disableButtons();
                if (hasRegisteredLivingWill) {
                    this.warningIfLivingWillExist(Promise.resolve(RegistrationState.NOT_REGISTERED)); // remove warning
                    this.livingWillCache.setStale(true);
                    await this.fskService.upgradeToTreatmentWillForPatient(
                        this.moduleContext.getPatient().getCpr(),
                        this.getValue());
                } else {
                    await this.fskService.createTreatmentWillForPatient(
                        this.moduleContext.getPatient().getCpr(),
                        this.getValue());
                }
                this.updateCache(true, `Behandlingstestamente oprettet`);
                this.moduleContext.setApplicationContextId(`PATIENT`);

            } catch (error) {
                PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const updateHandler = async () => {
            try {
                this.buttonStrategy.disableButtons();
                await this.fskService.updateTreatmentWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Behandlingstestamente opdateret`);
            } catch (error) {
                PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const deleteHandler = async () => {
            try {
                const yesOption = <DialogOption>{
                    buttonStyle: ButtonStyle.DEFAULT,
                    text: `Slet`
                };

                const noOption = <DialogOption>{
                    buttonStyle: ButtonStyle.SECONDARY,
                    text: `Fortryd`
                };
                const yesIsClicked = await PopupDialog.display(
                    PopupDialogKind.WARNING,
                    "Bekræft sletning",
                    "Er du sikker på du vil slette patientens behandlingstestamenteregistrering?",
                    noOption, yesOption);
                if (yesIsClicked === yesOption) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.deleteTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
                    this.updateCache(false, `Behandlingstestamente slettet`);
                    this.moduleContext.setApplicationContextId(`PATIENT`);
                }
            } catch (error) {
                PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        this.createButton = new StyledButton({
            text: "Opret registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: createHandler
        });

        this.updateButton = new StyledButton({
            text: "Opdater registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: updateHandler
        });
        this.updateButton.setEnabled(false);

        this.deleteButton = new StyledButton({
            text: "Slet registrering",
            style: ButtonStyle.DEFAULT,
            clickHandler: deleteHandler
        });

        this.buttonStrategy = new FSKButtonStrategy_ODR(
            this.moduleContext.getUserContext(),
            this.createButton,
            this.updateButton,
            this.deleteButton
        );

        this.buttonStrategy.hideButtons();
    }

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.treatmentWillCache.registrationState = RegistrationStateUtil.registrationStateMapper(hasRegistration);
        hasRegistration ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
        this.treatmentWillCache.treatmentWill.setStale();
        SnackBar.show({headerText: snackbarText, delay: 5000});

        this.buttonStrategy.enableButtons();
    }

    public setEnabled(): void {
        if (!this.isAdminUser) {
            this.terminallyIllCheckbox.setEnabled(this.terminallyIllCheckbox.getValue());
            this.terminallyIllCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.illNoImprovementCheckbox.setEnabled((this.illNoImprovementCheckbox.getValue()));
            this.illNoImprovementCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.illWithPermanentPainCheckbox.setEnabled((this.illWithPermanentPainCheckbox.getValue()));
            this.illWithPermanentPainCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.treatmentByForceCheckbox.setEnabled((this.treatmentByForceCheckbox.getValue()));
            this.treatmentByForceCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
        }
        this.isReadOnlySet = true;
    }

    public async setData(value: FSKTypes.RegistrationTypeWrapper<FSKTypes.TreatmentWillType> | null | undefined): Promise<void> {
        this.lastSavedValue = value && value.registrationType;
        this.value = this.lastSavedValue;
        const registrationDate = value && value.datetime;

        this.registrationDatePanel.setValue(registrationDate);

        setElementVisible(this.mainPanel, this.isAdminUser || !!this.lastSavedValue);
        setElementVisible(this.noRegistrationPanel, !this.isAdminUser && !this.lastSavedValue);

        const patientNameElement = document.createElement("strong");
        patientNameElement.textContent = PatientUtil.getFullName(this.moduleContext.getPatient());
        this.noRegistrationText.append(
            patientNameElement,
            this.isDentist ? " har ikke et behandlingstestamente" : " har hverken et livs- eller behandlingstestamente"
        );

        if (!this.isDentist) { // don't check livingWill existence for dentists
            this.warningIfLivingWillExist(this.livingWillCache.loadHasRegistration());
        }

        if (this.lastSavedValue) {
            Object.entries(this.lastSavedValue).forEach(([property, will]) => {
                switch (property) {
                    case "noLifeProlongingIfDying":
                        this.terminallyIllCheckbox.setValue(will, true);
                        break;
                    case "noLifeProlongingIfSeverelyDegraded":
                        this.illNoImprovementPanel.setValue(will.acceptanceNeeded);
                        this.illNoImprovementCheckbox.setValue(will.$, true);
                        break;
                    case "noLifeProlongingIfSeverePain":
                        this.illWithPermanentPainPanel.setValue(will.acceptanceNeeded);
                        this.illWithPermanentPainCheckbox.setValue(will.$, true);
                        break;
                    case "noForcedTreatmentIfIncapable":
                        this.treatmentByForcePanel.setValue(will.acceptanceNeeded);
                        this.treatmentByForceCheckbox.setValue(will.$, true);
                        break;
                }
            });
        } else {
            this.terminallyIllCheckbox.setValue(null, true);
            this.illNoImprovementPanel.setValue(null);
            this.illNoImprovementCheckbox.setValue(null, true);
            this.illWithPermanentPainPanel.setValue(null);
            this.illWithPermanentPainCheckbox.setValue(null, true);
            this.treatmentByForcePanel.setValue(null);
            this.treatmentByForceCheckbox.setValue(null, true);
        }
        if (!this.isReadOnlySet) {
            this.setEnabled();
        }
        this.lastSavedValue ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
    }

    private updateValue() {
        const oldValue = this.value;
        const newValue = <TreatmentWillType>{
            noLifeProlongingIfDying: this.getTreatmentValue(this.terminallyIllCheckbox),
            noLifeProlongingIfSeverelyDegraded: this.getTreatmentValue(this.illNoImprovementCheckbox, this.illNoImprovementPanel),
            noLifeProlongingIfSeverePain: this.getTreatmentValue(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel),
            noForcedTreatmentIfIncapable: this.getTreatmentValue(this.treatmentByForceCheckbox, this.treatmentByForcePanel)
        };
        this.value = newValue;

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }
    // TODO: Test this
    private async warningIfLivingWillExist(livingWillExist: Promise<RegistrationState>) {
        const hasRegisteredLivingWillAndIsAdmin = await livingWillExist === RegistrationState.REGISTERED && this.isAdminUser;
        this.livingWillExistsWarning.setVisible(hasRegisteredLivingWillAndIsAdmin);
    }

    private addHandlerForCheckboxAndPanel(checkBox: WCAGCheckbox, panel?: TreatmentWillWishPanel_2) {
        checkBox.addValueChangeHandler(handler => {
            // If you are administrator you can do whatever, otherwise you can only set it to tru, which is in the initial
            if (this.isAdminUser || handler.getValue()) {
                const value = handler.getValue();
                const isValueChanged = this.isValueChanged();
                this.updateButton.setEnabled(isValueChanged);
                if (panel) {
                    panel.setVisible(value);
                    if (!value) {
                        panel.setValue(null);
                    }
                }
            }
        });
        if (!!panel) {
            panel.addValueChangeHandler(() => {
                this.updateButton.setEnabled(this.isValueChanged());
            });
        }
    }

    private isValueChanged(): boolean {
        const newValue = this.getValue();
        return !CompareUtil.deepEquals(this.lastSavedValue, newValue);
    }
}
