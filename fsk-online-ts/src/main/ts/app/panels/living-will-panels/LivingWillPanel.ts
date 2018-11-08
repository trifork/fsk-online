import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {ButtonStyle, CheckboxWrapper, DialogOption, ErrorDisplay, PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import {ModuleContext, Widget} from "fmko-typescript-common";
import {ButtonStrategy} from "../../model/ButtonStrategy";
import FSKButtonStrategy from "../../model/FSKButtonStrategy";
import SnackBar from "../../elements/SnackBar";
import ErrorUtil from "../../util/ErrorUtil";
import FSKUserUtil from "../../util/FSKUserUtil";
import PatientUtil from "../../util/PatientUtil";
import TreatmentWillCache from "../../services/TreatmentWillCache";
import FSKService from "../../services/FSKService";
import LivingWillCache from "../../services/LivingWillCache";
import FSKConfig from "../../main/FSKConfig";
import RegistrationStateUtil from "../../util/RegistrationStateUtil";
import TimelineUtil from "../../util/TimelineUtil";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillPanel extends TemplateWidget {

    private terminallyIllCheckbox: CheckboxWrapper;
    private severelyHandicappedCheckbox: CheckboxWrapper;

    private buttonStrategy: ButtonStrategy;
    private isAdministratorUser: boolean;

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
        return loadTemplate("panels/living-will-panels/livingWillPanel.html");
    }

    public setupBindings(): any {
        this.setupButtons();

        this.terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        this.terminallyIllCheckbox.addValueChangeHandler(() => {
            this.buttonStrategy.updateButton.setEnabled(true);
        });
        this.severelyHandicappedCheckbox = new CheckboxWrapper(this.getElementByVarName(`severely-handicapped-checkbox`));
        this.severelyHandicappedCheckbox.addValueChangeHandler(() => {
            this.buttonStrategy.updateButton.setEnabled(true);
        });

        if (!this.isAdministratorUser) {
            this.terminallyIllCheckbox.getInput().onclick = (() => false);
            this.severelyHandicappedCheckbox.getInput().onclick = (() => false);
        }

        this.buttonStrategy.hideButtons();

        this.addAndReplaceWidgetByVarName(this.buttonStrategy.createButton, `create-button`);
        this.addAndReplaceWidgetByVarName(this.buttonStrategy.updateButton, `update-button`);
        this.addAndReplaceWidgetByVarName(this.buttonStrategy.deleteButton, `delete-button`);
    }

    public tearDownBindings(): any {
        // Unused
    }

    public getValue(): LivingWillType {
        return <LivingWillType>{
            noLifeProlongingIfDying: !!this.terminallyIllCheckbox.getValue(),
            noLifeProlongingIfSeverelyDegraded: !!this.severelyHandicappedCheckbox.getValue()
        };
    }

    public setupButtons(): void {
        this.buttonStrategy = new FSKButtonStrategy(this.moduleContext.getUserContext());
        const createHandler = async () => {
            try {
                this.buttonStrategy.disableButtons();
                await this.fskService.createLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Livstestamente oprettet`);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };

        const updateHandler = async () => {
            try {
                this.buttonStrategy.disableButtons();
                await this.fskService.updateLivingWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true, `Livstestamente opdateret`);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };

        const deleteHandler = async () => {
            try {
                const yesOption = <DialogOption>{
                    buttonStyle: ButtonStyle.GREEN,
                    text: `Slet`,
                };

                const noOption = <DialogOption>{
                    buttonStyle: ButtonStyle.RED,
                    text: `Fortryd`,
                };
                const yesIsClicked = await PopupDialog.display(PopupDialogKind.WARNING, "Bekræft sletning",
                    "<p>Er du sikker på du vil slette patientens livstestamenteregistrering?</p>",
                    noOption, yesOption);
                if (yesIsClicked == yesOption) {
                    this.buttonStrategy.disableButtons();
                    await this.fskService.deleteLivingWillForPatient(this.moduleContext.getPatient().getCpr());
                    this.terminallyIllCheckbox.setValue(false);
                    this.severelyHandicappedCheckbox.setValue(false);
                    this.updateCache(false, `Livstestamente slettet`);
                    if (TimelineUtil.useTreatmentWill(this.fskConfig)) {
                        this.moduleContext.setApplicationContextId(`PATIENT`);
                    }
                }
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        };
        this.buttonStrategy.updateButton.setEnabled(false);
        this.buttonStrategy.addHandlerForCreateButton(() => createHandler());
        this.buttonStrategy.addHandlerForEditButton(() => updateHandler());
        this.buttonStrategy.addHandlerForDeleteButton(() => deleteHandler());
    }

    public updateCache(hasRegistration: boolean, snackbarText: string) {
        this.livingWillCache.registrationState = RegistrationStateUtil.registrationStateMapper(hasRegistration);
        hasRegistration
            ? this.buttonStrategy.setEditMode()
            : this.buttonStrategy.setCreateMode(!TimelineUtil.useTreatmentWill(this.fskConfig));
        this.livingWillCache.livingWill.setStale();
        this.buttonStrategy.enableButtons();
        SnackBar.show(snackbarText);
    }

    public setEnabled(illCheckBoxCondition : boolean, handicapCheckBoxCondition: boolean) {
        this.terminallyIllCheckbox.setEnabled(!!illCheckBoxCondition);
        this.severelyHandicappedCheckbox.setEnabled(!!handicapCheckBoxCondition);
    }

    public async setData(livingWill: LivingWillType) {
        if (livingWill) {
            this.terminallyIllCheckbox.setValue(livingWill.noLifeProlongingIfDying);
            this.severelyHandicappedCheckbox.setValue(livingWill.noLifeProlongingIfSeverelyDegraded);
            if (!this.isAdministratorUser) {
                this.handleCheckBoxes(livingWill.noLifeProlongingIfDying, livingWill.noLifeProlongingIfSeverelyDegraded);
            }
        } else {
            this.terminallyIllCheckbox.setValue(false);
            this.severelyHandicappedCheckbox.setValue(false);
        }

        Widget.setVisible(this.getElementByVarName(`main-panel`), this.isAdministratorUser || !!livingWill);
        Widget.setVisible(this.getElementByVarName(`empty-panel`), !this.isAdministratorUser && !livingWill);
        this.getElementByVarName(`empty-state-patient`).innerText = PatientUtil.getFullName(this.moduleContext.getPatient());

        livingWill
            ? this.buttonStrategy.setEditMode()
            : this.buttonStrategy.setCreateMode(!TimelineUtil.useTreatmentWill(this.fskConfig));
    }

    private handleCheckBoxes(noLifeProlongingIfDying: boolean, noLifeProlongingIfSeverelyDegraded: boolean) {
        this.setEnabled(noLifeProlongingIfDying, noLifeProlongingIfSeverelyDegraded);

        /*if (noLifeProlongingIfDying && noLifeProlongingIfSeverelyDegraded) {
            this.setEnabled();
        }  else if (noLifeProlongingIfDying && !noLifeProlongingIfSeverelyDegraded) {
            this.setEnabled(noLifeProlongingIfDying, noLifeProlongingIfSeverelyDegraded);
        } else if (!noLifeProlongingIfDying && noLifeProlongingIfSeverelyDegraded) {
            this.setEnabled(noLifeProlongingIfDying);
        } else if (!noLifeProlongingIfDying && !noLifeProlongingIfSeverelyDegraded) {
            this.setEnabled(noLifeProlongingIfDying, noLifeProlongingIfSeverelyDegraded);
        }*/
    }
}
