import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {
    ButtonStyle,
    DialogOption,
    HasValueWidget,
    PopupDialog,
    PopupDialogKind,
    SnackBar,
    TypedWCAGCheckbox
} from "fmko-ts-widgets";
import {CompareUtil, ModuleContext, setElementVisible, ValueChangeEvent} from "fmko-ts-common";
import ErrorUtil from "../../util/ErrorUtil";
import FSKUserUtil from "../../util/FSKUserUtil";
import PatientUtil from "../../util/PatientUtil";
import LivingWillCache from "../../services/LivingWillCache";
import FSKService from "../../services/FSKService";
import RegistrationStateUtil from "../../util/RegistrationStateUtil";
import RegistrationDatePanel from "../registration-date-panel/RegistrationDatePanel";
import ButtonPanel from "../button-panel/ButtonPanel";
import TimelineUtil from "../../util/TimelineUtil";
import FSKConfig from "../../main/FSKConfig";
import LivingWillType = FSKTypes.LivingWillType;

@Component({
    template: require("./livingWillPanel.html")
})
export default class LivingWillPanel
    extends HasValueWidget<LivingWillType>
    implements Render {
    private lastSavedValue: LivingWillType;
    private emptyValue: LivingWillType = {
        noLifeProlongingIfDying: false,
        noLifeProlongingIfSeverelyDegraded: false
    };

    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
    private isReadOnlySet: boolean;

    @WidgetElement private mainPanel: HTMLDivElement;
    @WidgetElement private registrationDatePanel: RegistrationDatePanel;

    @WidgetElement private terminallyIllCheckbox: TypedWCAGCheckbox<string>;
    @WidgetElement private severelyHandicappedCheckbox: TypedWCAGCheckbox<string>;

    @WidgetElement private buttonPanel: ButtonPanel;

    @WidgetElement private noRegistrationPanel: HTMLDivElement;
    @WidgetElement private noRegistrationText: HTMLSpanElement;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency(FSKService) private fskService: FSKService,
        @Dependency("FSKConfig") private fskConfig: FSKConfig,
        @Dependency(LivingWillCache) private livingWillCache: LivingWillCache
    ) {
        super();
    }

    public render(): void | Promise<never> {
        this.setupButtons();

        setElementVisible(this.mainPanel, false);
        setElementVisible(this.noRegistrationPanel, false);

        this.registrationDatePanel = this.container.resolve(RegistrationDatePanel);

        this.terminallyIllCheckbox = new TypedWCAGCheckbox({
            checkedValue: "noLifeProlongingIfDying",
            label: "Patienten er i en situation, hvor patienten er uafvendeligt døende"
        });
        this.addHandlerForCheckbox(this.terminallyIllCheckbox);

        this.severelyHandicappedCheckbox = new TypedWCAGCheckbox({
            checkedValue: "noLifeProlongingIfSeverelyDegraded",
            label: "Patienten ønsker ikke livsforlængende behandling i tilfælde af, at sygdom, fremskreden " +
                "alderdomssvækkelse, ulykke, hjertestop el.lign. har medført en så svær invaliditet, at patienten " +
                "varigt vil være ude af stand til at tage vare på sig selv fysisk og mentalt."
        });
        this.addHandlerForCheckbox(this.severelyHandicappedCheckbox);
    }

    public override setValue(newValue: LivingWillType, fireEvents?: boolean) {
        // Not used
    }

    public getValue(): LivingWillType {
        this.updateValue();
        return this.value;
    }

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.livingWillCache.registrationState = RegistrationStateUtil.registrationStateMapper(hasRegistration);
        hasRegistration
            ? this.buttonPanel.setEditMode()
            : this.buttonPanel.setCreateMode(!TimelineUtil.useTreatmentWill(this.fskConfig));
        this.livingWillCache.livingWill.setStale();
        SnackBar.show({headerText: snackbarText, delay: 5000});

        this.buttonPanel.enableButtons();
    }

    public setEnabled(): void {
        if (!this.isAdminUser) {
            this.terminallyIllCheckbox.setEnabled(this.terminallyIllCheckbox.isChecked());
            this.terminallyIllCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.severelyHandicappedCheckbox.setEnabled(this.severelyHandicappedCheckbox.isChecked());
            this.severelyHandicappedCheckbox.getFieldElement().addEventListener("click", event => {
                event.preventDefault();
            }, true);
        }
        this.isReadOnlySet = true;
    }

    public async setData(value: FSKTypes.RegistrationTypeWrapper<FSKTypes.LivingWillType> | null | undefined): Promise<void> {
        this.lastSavedValue = value && value.registrationType;

        this.value = this.lastSavedValue;
        const registrationDate = value && value.datetime;

        this.registrationDatePanel.setValue(registrationDate);
        if (!!this.lastSavedValue) {
            this.registrationDatePanel.render();
        }

        setElementVisible(this.mainPanel, this.isAdminUser || !!this.lastSavedValue);
        setElementVisible(this.noRegistrationPanel, !this.isAdminUser && !this.lastSavedValue);

        const patientNameElement = document.createElement("strong");
        patientNameElement.textContent = PatientUtil.getFullName(this.moduleContext.getPatient());
        this.noRegistrationText.append(
            patientNameElement,
            " har hverken et livs- eller behandlingstestamente"
        );

        if (this.lastSavedValue) {
            this.setCheckboxAndFireEvent(this.terminallyIllCheckbox, this.lastSavedValue.noLifeProlongingIfDying);
            this.setCheckboxAndFireEvent(this.severelyHandicappedCheckbox, this.lastSavedValue.noLifeProlongingIfSeverelyDegraded);
        } else {
            this.setCheckboxAndFireEvent(this.terminallyIllCheckbox, false);
            this.setCheckboxAndFireEvent(this.severelyHandicappedCheckbox, false);
        }
        if (!this.isReadOnlySet) {
            this.setEnabled();
        }

        this.lastSavedValue
            ? this.buttonPanel.setEditMode()
            : this.buttonPanel.setCreateMode(!TimelineUtil.useTreatmentWill(this.fskConfig));
    }

    private setCheckboxAndFireEvent(checkbox: TypedWCAGCheckbox<string>, value: any) {
        checkbox.setChecked(value);
        ValueChangeEvent.fire(checkbox, value);
    }

    private setupButtons(): void {
        const createHandler = async () => {
            try {
                this.buttonPanel.disableButtons();
                await this.fskService.createLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Livstestamente oprettet`);
            } catch (error) {
                PopupDialog.warning("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const updateHandler = async () => {
            try {
                this.buttonPanel.disableButtons();
                await this.fskService.updateLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Livstestamente opdateret`);
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
                    "Er du sikker på du vil slette patientens livstestamenteregistrering?",
                    noOption, yesOption);
                if (yesIsClicked === yesOption) {
                    this.buttonPanel.disableButtons();
                    await this.fskService.deleteLivingWillForPatient(this.moduleContext.getPatient().getCpr());
                    this.updateCache(false, `Livstestamente slettet`);
                    if (TimelineUtil.useTreatmentWill(this.fskConfig)) {
                        this.moduleContext.setApplicationContextId(`PATIENT`);
                    }
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
        this.buttonPanel.updateButton.setEnabled(false);
    }

    private updateValue() {
        const oldValue = this.value;
        const newValue = <LivingWillType>{
            noLifeProlongingIfDying: this.terminallyIllCheckbox.isChecked(),
            noLifeProlongingIfSeverelyDegraded: this.severelyHandicappedCheckbox.isChecked()
        };
        this.value = newValue;

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }

    private addHandlerForCheckbox(checkBox: TypedWCAGCheckbox<string>) {
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
    }

    private isValueChanged(): boolean {
        const newValue = this.getValue();
        return !CompareUtil.deepEquals(this.emptyValue, newValue)
            && !CompareUtil.deepEquals(this.lastSavedValue, newValue);
    }
}
