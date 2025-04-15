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
    TypedWCAGCheckbox
} from "fmko-ts-widgets";
import {CompareUtil, ImageSrc, ModuleContext, setElementVisible, ValueChangeEvent} from "fmko-ts-common";
import ErrorUtil from "../../util/ErrorUtil";
import FSKUserUtil from "../../util/FSKUserUtil";
import PatientUtil from "../../util/PatientUtil";
import TreatmentWillCache from "../../services/TreatmentWillCache";
import FSKService from "../../services/FSKService";
import LivingWillCache from "../../services/LivingWillCache";
import {RegistrationState} from "../../model/RegistrationState";
import RegistrationStateUtil from "../../util/RegistrationStateUtil";
import TreatmentWillWishPanel from "./TreatmentWillWishPanel";
import RegistrationDatePanel from "../registration-date-panel/RegistrationDatePanel";
import ButtonPanel from "../button-panel/ButtonPanel";
import TreatmentWillValueType = FSKTypes.TreatmentWillValueType;
import TreatmentWillType = FSKTypes.TreatmentWillType;

@Component ({
    template: require("./treatmentWillPanel.html")
})
export default class TreatmentWillPanel
    extends HasValueWidget<FSKTypes.TreatmentWillType>
    implements Render {
    private lastSavedValue: FSKTypes.TreatmentWillType;
    private emptyValue: TreatmentWillType = {
        noLifeProlongingIfDying: false,
        noLifeProlongingIfSeverelyDegraded: <TreatmentWillValueType>{$: false},
        noLifeProlongingIfSeverePain: <TreatmentWillValueType>{$: false},
        noForcedTreatmentIfIncapable: <TreatmentWillValueType>{$: false}
    };

    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
    private readonly isDentist = FSKUserUtil.isDentistWithoutElevatedRights(this.moduleContext.getUserContext());
    private isReadOnlySet: boolean;

    @WidgetElement private mainPanel: HTMLDivElement;
    @WidgetElement private registrationDatePanel: RegistrationDatePanel;
    @WidgetElement private livingWillExistsWarning: InfoPanel;
    @WidgetElement private lifeProlongingSection: HTMLDivElement;

    @WidgetElement private terminallyIllCheckbox: TypedWCAGCheckbox<string>;
    @WidgetElement private illNoImprovementCheckbox: TypedWCAGCheckbox<string>;
    @WidgetElement private illWithPermanentPainCheckbox: TypedWCAGCheckbox<string>;
    @WidgetElement private treatmentByForceCheckbox: TypedWCAGCheckbox<string>;

    @WidgetElement private illNoImprovementPanel: TreatmentWillWishPanel;
    @WidgetElement private illWithPermanentPainPanel: TreatmentWillWishPanel;
    @WidgetElement private treatmentByForcePanel: TreatmentWillWishPanel;

    @WidgetElement private buttonPanel: ButtonPanel;

    @WidgetElement private noRegistrationPanel: HTMLDivElement;
    @WidgetElement private noRegistrationText: HTMLSpanElement;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency(FSKService) private fskService: FSKService,
        @Dependency(LivingWillCache) private livingWillCache: LivingWillCache,
        @Dependency(TreatmentWillCache) private treatmentWillCache: TreatmentWillCache
    ) {
        super();
    }

    public render(): void | Promise<never> {
        this.setupButtons();

        setElementVisible(this.mainPanel, false);
        setElementVisible(this.noRegistrationPanel, false);

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

        this.terminallyIllCheckbox = new TypedWCAGCheckbox({
            checkedValue: "noLifeProlongingIfDying",
            label: "Hvis patienten ligger for døden (dvs. er uafvendeligt døende)"
        });
        this.addHandlerForCheckboxAndPanel(this.terminallyIllCheckbox);

        this.illNoImprovementCheckbox = new TypedWCAGCheckbox({
            checkedValue: "noLifeProlongingIfSeverelyDegraded",
            label: "Hvis patienten ligger hjælpeløs hen pga. sygdom, ulykke mv, og der ikke er tegn på bedring"
        });
        this.illNoImprovementPanel = this.container.resolve(TreatmentWillWishPanel);
        this.illNoImprovementPanel.render();
        this.illNoImprovementPanel.setVisible(false);
        this.addHandlerForCheckboxAndPanel(this.illNoImprovementCheckbox, this.illNoImprovementPanel);

        this.illWithPermanentPainCheckbox = new TypedWCAGCheckbox({
            checkedValue: "noLifeProlongingIfSeverePain",
            label: "Hvis livsforlængende behandling kan føre til, at patienten overlever, men de fysiske konsekvenser" +
                "af patientens sygdom eller behandling vurderes at være meget alvorlige og lidelsesfulde"
        });
        this.illWithPermanentPainPanel = this.container.resolve(TreatmentWillWishPanel);
        this.illWithPermanentPainPanel.render();
        this.illWithPermanentPainPanel.setVisible(false);
        this.addHandlerForCheckboxAndPanel(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel);

        // hide the section with the fields above for dentists
        setElementVisible(this.lifeProlongingSection, !this.isDentist);

        this.treatmentByForceCheckbox = new TypedWCAGCheckbox({
            checkedValue: "noForcedTreatmentIfIncapable",
            label: "Hvis patienten er umyndiggjort og der er tale om tvang"
        });
        this.treatmentByForcePanel = this.container.resolve(TreatmentWillWishPanel);
        this.treatmentByForcePanel.render();
        this.treatmentByForcePanel.setVisible(false);
        this.addHandlerForCheckboxAndPanel(this.treatmentByForceCheckbox, this.treatmentByForcePanel);
    }

    public override setValue(newValue: TreatmentWillType, fireEvents?: boolean) {
        // Not used
    }

    public getValue(): TreatmentWillType {
        this.updateValue();
        return this.value;
    }

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.treatmentWillCache.registrationState = RegistrationStateUtil.registrationStateMapper(hasRegistration);
        hasRegistration ? this.buttonPanel.setEditMode() : this.buttonPanel.setCreateMode();
        this.treatmentWillCache.treatmentWill.setStale();
        SnackBar.show({headerText: snackbarText, delay: 5000});

        this.buttonPanel.enableButtons();
    }

    public setEnabled(): void {
        if (!this.isAdminUser) {
            this.terminallyIllCheckbox.setEnabled(this.terminallyIllCheckbox.isChecked());
            this.terminallyIllCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.illNoImprovementCheckbox.setEnabled((this.illNoImprovementCheckbox.isChecked()));
            this.illNoImprovementCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.illWithPermanentPainCheckbox.setEnabled((this.illWithPermanentPainCheckbox.isChecked()));
            this.illWithPermanentPainCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.treatmentByForceCheckbox.setEnabled((this.treatmentByForceCheckbox.isChecked()));
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

        this.registrationDatePanel.setDatePreRender(registrationDate);
        if (!!this.lastSavedValue) {
            this.registrationDatePanel.render();
        }

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
                        this.setCheckboxAndFireEvent(this.terminallyIllCheckbox, will);
                        break;
                    case "noLifeProlongingIfSeverelyDegraded":
                        this.illNoImprovementPanel.setValue(will.acceptanceNeeded);
                        this.setCheckboxAndFireEvent(this.illNoImprovementCheckbox, will.$);
                        break;
                    case "noLifeProlongingIfSeverePain":
                        this.illWithPermanentPainPanel.setValue(will.acceptanceNeeded);
                        this.setCheckboxAndFireEvent(this.illWithPermanentPainCheckbox, will.$);
                        break;
                    case "noForcedTreatmentIfIncapable":
                        this.treatmentByForcePanel.setValue(will.acceptanceNeeded);
                        this.setCheckboxAndFireEvent(this.treatmentByForceCheckbox, will.$);
                        break;
                }
            });
        } else {
            this.setCheckboxAndFireEvent(this.terminallyIllCheckbox, false);
            this.illNoImprovementPanel.setValue(null);
            this.setCheckboxAndFireEvent(this.illNoImprovementCheckbox, false);
            this.illWithPermanentPainPanel.setValue(null);
            this.setCheckboxAndFireEvent(this.illWithPermanentPainCheckbox, false);
            this.treatmentByForcePanel.setValue(null);
            this.setCheckboxAndFireEvent(this.treatmentByForceCheckbox, false);
        }
        if (!this.isReadOnlySet) {
            this.setEnabled();
        }
        this.lastSavedValue ? this.buttonPanel.setEditMode() : this.buttonPanel.setCreateMode();
    }

    private setCheckboxAndFireEvent(checkbox: TypedWCAGCheckbox<string>, value: any) {
        checkbox.setChecked(value);
        ValueChangeEvent.fire(checkbox, value);
    }

    private getTreatmentValue(checkBox: TypedWCAGCheckbox<string>, panel?: TreatmentWillWishPanel): TreatmentWillValueType | boolean {
        const isChecked = !!checkBox.isChecked();
        if (!panel) {
            return isChecked;
        }
        const panelValue = panel.getValue();
        if (!isChecked || panelValue === undefined) {
            return <TreatmentWillValueType>{
                $: isChecked
            };
        }
        return <TreatmentWillValueType>{
            acceptanceNeeded: panelValue,
            $: isChecked
        };
    }

    private setupButtons(): void {
        const createHandler = async () => {
            try {
                const hasRegisteredLivingWill: boolean = this.livingWillCache.registrationState === RegistrationState.REGISTERED;
                this.buttonPanel.disableButtons();
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
                this.buttonPanel.disableButtons();
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
                    this.buttonPanel.disableButtons();
                    await this.fskService.deleteTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
                    this.updateCache(false, `Behandlingstestamente slettet`);
                    this.moduleContext.setApplicationContextId(`PATIENT`);
                }
            } catch (error) {
                PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        this.buttonPanel = this.container.resolve(ButtonPanel);
        this.buttonPanel.render();
        this.buttonPanel.addHandlerForCreateButton(createHandler);
        this.buttonPanel.addHandlerForEditButton(updateHandler);
        this.buttonPanel.addHandlerForDeleteButton(deleteHandler);
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

    private async warningIfLivingWillExist(livingWillExist: Promise<RegistrationState>) {
        const hasRegisteredLivingWillAndIsAdmin = await livingWillExist === RegistrationState.REGISTERED && this.isAdminUser;
        this.livingWillExistsWarning.setVisible(hasRegisteredLivingWillAndIsAdmin);
    }

    private addHandlerForCheckboxAndPanel(checkBox: TypedWCAGCheckbox<string>, panel?: TreatmentWillWishPanel) {
        if (this.isAdminUser) {
            checkBox.addValueChangeHandler(() => {
                const isValueChanged = this.isValueChanged();
                this.buttonPanel.updateButton.setEnabled(isValueChanged);
                this.buttonPanel.createButton.setEnabled(isValueChanged);
            });
        } else {
            checkBox.setEnabled(checkBox.isChecked());
            checkBox.addClickHandler((event) => event.preventDefault());
        }

        if (!!panel) {
            checkBox.addValueChangeHandler((event) => {
                const stringvalue = event.getValue();
                const value = !!stringvalue;
                panel.setVisible(value);
                if (!value) {
                    panel.setValue(null);
                }
            });
            panel.addValueChangeHandler(() => {
                const isValueChanged = this.isValueChanged();
                this.buttonPanel.updateButton.setEnabled(isValueChanged);
                this.buttonPanel.createButton.setEnabled(isValueChanged);
            });
        }
    }

    private isValueChanged(): boolean {
        const newValue = this.getValue();
        return !CompareUtil.deepEquals(this.emptyValue, newValue)
            && !CompareUtil.deepEquals(this.lastSavedValue, newValue);
    }
}
