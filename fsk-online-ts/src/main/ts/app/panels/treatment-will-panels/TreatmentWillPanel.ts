import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {
    ButtonStyle,
    CheckboxWrapper,
    DialogOption,
    ErrorDisplay,
    PopupDialog,
    PopupDialogKind,
    SnackBar,
    TextBoxField
} from "fmko-ts-widgets";
import TreatmentWillWishPanel from "./TreatmentWillWishPanel";
import {ModuleContext, setElementVisible, Widget} from "fmko-ts-common";
import {ButtonStrategy} from "../../model/ButtonStrategy";
import FSKButtonStrategy from "../../model/FSKButtonStrategy";
import ErrorUtil from "../../util/ErrorUtil";
import FSKUserUtil from "../../util/FSKUserUtil";
import PatientUtil from "../../util/PatientUtil";
import TreatmentWillCache from "../../services/TreatmentWillCache";
import FSKService from "../../services/FSKService";
import LivingWillCache from "../../services/LivingWillCache";
import FSKConfig from "../../main/FSKConfig";
import {RegistrationState} from "../../model/RegistrationState";
import RegistrationStateUtil from "../../util/RegistrationStateUtil";
import moment from "moment";
import TreatmentWillValueType = FSKTypes.TreatmentWillValueType;
import TreatmentWillType = FSKTypes.TreatmentWillType;

export default class TreatmentWillPanel extends TemplateWidget {

    private terminallyIllCheckbox: CheckboxWrapper;
    private illNoImprovementCheckbox: CheckboxWrapper;
    private illWithPermanentPainCheckbox: CheckboxWrapper;
    private treatmentByForceCheckbox: CheckboxWrapper;
    private registrationDateTextBox: TextBoxField;

    private terminallyIllPanel: TreatmentWillWishPanel;
    private illNoImprovementPanel: TreatmentWillWishPanel;
    private illWithPermanentPainPanel: TreatmentWillWishPanel;
    private treatmentByForcePanel: TreatmentWillWishPanel;

    private buttonStrategy: ButtonStrategy;
    private isAdministratorUser: boolean;
    private isReadOnlySet: boolean;

    public static deps = () => [IoC, "ModuleContext", "FSKConfig", LivingWillCache, TreatmentWillCache, FSKService];

    constructor(protected container: IoC,
        private moduleContext: ModuleContext,
        private fskConfig: FSKConfig,
        private livingWillCache: LivingWillCache,
        private treatmentWillCache: TreatmentWillCache,
        private fskService: FSKService) {
        super(container);
        this.isAdministratorUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        this.init();
    }

    public getTemplate(): string {
        return require("./treatmentWillPanel.html");
    }

    public setupBindings(): any {
        this.setupButtons();
        this.warningIfLivingWillExist(this.livingWillCache.loadHasRegistration(), this.isAdministratorUser);

        this.terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        this.terminallyIllPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.terminallyIllPanel.setUpdateButton(this.buttonStrategy.updateButton);
        this.addHandlerForCheckboxAndPanel(this.terminallyIllCheckbox);

        this.addAndReplaceWidgetByVarName(this.terminallyIllPanel, `terminally-ill-panel`);

        this.illNoImprovementCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-no-improvement-checkbox`));
        this.illNoImprovementPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.illNoImprovementPanel.setUpdateButton(this.buttonStrategy.updateButton);
        this.addHandlerForCheckboxAndPanel(this.illNoImprovementCheckbox, this.illNoImprovementPanel);

        this.addAndReplaceWidgetByVarName(this.illNoImprovementPanel, `ill-no-improvement-panel`);

        this.illWithPermanentPainCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-with-permanent-pain-checkbox`));
        this.illWithPermanentPainPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.illWithPermanentPainPanel.setUpdateButton(this.buttonStrategy.updateButton);
        this.addHandlerForCheckboxAndPanel(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel);

        this.addAndReplaceWidgetByVarName(this.illWithPermanentPainPanel, `ill-with-permanent-pain-panel`);

        this.treatmentByForceCheckbox = new CheckboxWrapper(this.getElementByVarName(`treatment-by-force-checkbox`));
        this.treatmentByForcePanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.treatmentByForcePanel.setUpdateButton(this.buttonStrategy.updateButton);
        this.addHandlerForCheckboxAndPanel(this.treatmentByForceCheckbox, this.treatmentByForcePanel);

        this.addAndReplaceWidgetByVarName(this.treatmentByForcePanel, `treatment-by-force-panel`);
        this.registrationDateTextBox = new TextBoxField(this.getElementByVarName("registration-date"));

        this.buttonStrategy.hideButtons();

        this.addAndReplaceWidgetByVarName(this.buttonStrategy.createButton, `create-button`);
        this.addAndReplaceWidgetByVarName(this.buttonStrategy.updateButton, `update-button`);
        this.addAndReplaceWidgetByVarName(this.buttonStrategy.deleteButton, `delete-button`);
    }

    public tearDownBindings(): any {
        // Unused
    }

    public getValue(): TreatmentWillType {
        return <TreatmentWillType>{
            noForcedTreatmentIfIncapable: this.getTreatmentValue(this.treatmentByForceCheckbox, this.treatmentByForcePanel),
            noLifeProlongingIfDying: this.getTreatmentValue(this.terminallyIllCheckbox, this.terminallyIllPanel),
            noLifeProlongingIfSeverePain: this.getTreatmentValue(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel),
            noLifeProlongingIfSeverelyDegraded: this.getTreatmentValue(this.illNoImprovementCheckbox, this.illNoImprovementPanel)
        };
    }

    public getTreatmentValue(checkBox: CheckboxWrapper, panel: TreatmentWillWishPanel) {
        const isChecked = !!checkBox.getValue();

        return <TreatmentWillValueType>{
            acceptanceNeeded: panel.getValue(),
            // tslint:disable-next-line:object-literal-sort-keys
            $: isChecked
        };
    }

    public setupButtons(): void {
        this.buttonStrategy = new FSKButtonStrategy(this.moduleContext.getUserContext());
        const createHandler = async () => {
            try {
                if (this.livingWillCache.registrationState === RegistrationState.REGISTERED
                    && (await this.livingWillCache.deleteRegistration() === RegistrationState.REGISTERED)) {
                    return;
                }
                this.warningIfLivingWillExist(Promise.resolve(RegistrationState.NOT_REGISTERED), false);
                this.buttonStrategy.disableButtons();
                await this.fskService.createTreatmentWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Behandlingstestamente oprettet`);
                this.moduleContext.setApplicationContextId(`PATIENT`);

            } catch (error) {
                ErrorDisplay.showError("Der opstod en fejl", ErrorUtil.getMessage(error));
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
                ErrorDisplay.showError("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        const deleteHandler = async () => {
            try {
                const yesOption = <DialogOption>{
                    buttonStyle: ButtonStyle.GREEN,
                    text: `Slet`
                };

                const noOption = <DialogOption>{
                    buttonStyle: ButtonStyle.RED,
                    text: `Fortryd`
                };
                const yesIsClicked = await PopupDialog.display(PopupDialogKind.WARNING, "Bekræft sletning",
                    "<p>Er du sikker på du vil slette patientens behandlingstestamenteregistrering?</p>",
                    noOption, yesOption);
                if (yesIsClicked === yesOption) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.deleteTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
                    this.updateCache(false, `Behandlingstestamente slettet`);
                    this.moduleContext.setApplicationContextId(`PATIENT`);
                }
            } catch (error) {
                ErrorDisplay.showError("Der opstod en fejl", ErrorUtil.getMessage(error));
            }
        };

        this.buttonStrategy.updateButton.setEnabled(false);
        this.buttonStrategy.addHandlerForCreateButton(() => createHandler());
        this.buttonStrategy.addHandlerForEditButton(() => updateHandler());
        this.buttonStrategy.addHandlerForDeleteButton(() => deleteHandler());
    }

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.treatmentWillCache.registrationState = RegistrationStateUtil.registrationStateMapper(hasRegistration);
        hasRegistration ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
        this.treatmentWillCache.treatmentWill.setStale();
        this.buttonStrategy.enableButtons();
        SnackBar.show(snackbarText);
    }

    public setEnabled(): void {
        if (!this.isAdministratorUser) {
            this.terminallyIllCheckbox.setEnabled(this.terminallyIllCheckbox.getValue());
            this.terminallyIllCheckbox.getInput().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.illNoImprovementCheckbox.setEnabled((this.illNoImprovementCheckbox.getValue()));
            this.illNoImprovementCheckbox.getInput().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.illWithPermanentPainCheckbox.setEnabled((this.illWithPermanentPainCheckbox.getValue()));
            this.illWithPermanentPainCheckbox.getInput().addEventListener("click", event => {
                event.preventDefault();
            }, true);
            this.treatmentByForceCheckbox.setEnabled((this.treatmentByForceCheckbox.getValue()));
            this.treatmentByForceCheckbox.getInput().addEventListener("click", event => {
                event.preventDefault();
            }, true);
        }
        this.isReadOnlySet = true;
    }

    public async setData(value: FSKTypes.RegistrationTypeWrapper<FSKTypes.TreatmentWillType> | null | undefined): Promise<void> {
        const treatmentWill = value && value.registrationType;
        const registrationDate = value && value.datetime;

        if (registrationDate) {
            const dateString = moment(registrationDate, "YYYYMMDDHHmmss").format("DD.MM.YYYY");
            this.registrationDateTextBox.element.innerHTML = `Registreringen er senest ændret: <b>${dateString}</b>`;
        }

        Widget.setVisible(this.getElementByVarName(`main-panel`), this.isAdministratorUser || !!treatmentWill);
        Widget.setVisible(this.getElementByVarName(`empty-panel`), !this.isAdministratorUser && !treatmentWill);
        Widget.setVisible(this.getElementByVarName(`registration-date-row`), !!treatmentWill);

        this.getElementByVarName(`empty-state-patient`).innerText = PatientUtil.getFullName(this.moduleContext.getPatient());
        this.warningIfLivingWillExist(this.livingWillCache.loadHasRegistration(), this.isAdministratorUser);
        if (treatmentWill) {
            Object.entries(treatmentWill).forEach(([property, will]) => {
                switch (property) {
                    case "noLifeProlongingIfDying":
                        this.terminallyIllPanel.setValue(will.acceptanceNeeded);
                        this.terminallyIllCheckbox.setValue(will.$, true);
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
            this.terminallyIllPanel.setValue(null);
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
        treatmentWill ? this.buttonStrategy.setEditMode() : this.buttonStrategy.setCreateMode();
    }

    private async warningIfLivingWillExist(livingWillExist: Promise<RegistrationState>, isAdmin: boolean) {
        const hasRegisteredLivingWillAndIsAdmin = await livingWillExist === RegistrationState.REGISTERED && isAdmin;
        setElementVisible(this.getElementByVarName(`living-will-exists`), hasRegisteredLivingWillAndIsAdmin);
    }

    private addHandlerForCheckboxAndPanel(checkBox: CheckboxWrapper, panel?: TreatmentWillWishPanel) {
        checkBox.addValueChangeHandler(handler => {
            // If you are administrator you can do whatever, otherwise you can only set it to tru, which is in the initial
            if (this.isAdministratorUser || handler.getValue()) {
                const value = handler.getValue();
                this.buttonStrategy.updateButton.setEnabled(true);
                if (panel) {
                    panel.setVisible(value);
                    if (!value) {
                        panel.setValue(null);
                    }
                }
            }
        });
    }
}
