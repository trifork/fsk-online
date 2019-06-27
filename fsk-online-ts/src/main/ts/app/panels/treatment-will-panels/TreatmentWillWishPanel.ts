import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import SDSButton from "../../elements/SDSButton";
import {ModuleContext} from "fmko-typescript-common";
import FSKUserUtil from "../../util/FSKUserUtil";
import {CheckboxWrapper} from "fmko-ts-widgets";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

export default class TreatmentWillWishPanel extends TemplateWidget {

    public static deps = () => [IoC, "ModuleContext"];

    private value: TreatmentWillAcceptanceType | null | undefined;
    private checkboxes: CheckboxWrapper[];
    private checkboxToStringMap: WeakMap<CheckboxWrapper, TreatmentWillAcceptanceType>;
    private isAdministratorUser: boolean;

    private updateButton: SDSButton;

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext) {
        super(container);
        this.element = document.createElement(`div`);
        this.isAdministratorUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        this.init();
        this.setVisible(false);
    }

    public getTemplate(): string {
        return require(`./treatmentWillWishPanel.html`);
    }

    public setupBindings(): any {
        const familyConsentCheckBox = new CheckboxWrapper(this.getElementByVarName(`family-consent-checkboxes`));
        const guardianConsentCheckBox = new CheckboxWrapper(this.getElementByVarName(`guardian-consent-checkboxes`));
        const agentConsentCheckBox = new CheckboxWrapper(this.getElementByVarName(`agent-consent-checkboxes`));

        this.checkboxes = [familyConsentCheckBox, guardianConsentCheckBox, agentConsentCheckBox];
        this.checkboxes.forEach(checkbox => {
            checkbox.setEnabled(this.isAdministratorUser);
        });

        this.checkboxToStringMap = new WeakMap<CheckboxWrapper, TreatmentWillAcceptanceType>();

        this.checkboxToStringMap.set(familyConsentCheckBox, `relativeAcceptanceRequired`);
        this.checkboxToStringMap.set(guardianConsentCheckBox, `guardianAcceptanceRequired`);
        this.checkboxToStringMap.set(agentConsentCheckBox, `trustedAgentAcceptanceRequired`);

        this.addHandlersForCheckbox();
    }

    public addHandlersForCheckbox(): void {
        this.checkboxes.forEach(checkbox => {
            checkbox.getInput().addEventListener(`click`, event => {
                this.updateButton.setEnabled(true);
                this.checkboxes.forEach(innerCheckBox => {
                    const target = event.target as HTMLInputElement;
                    const isClicked = target === innerCheckBox.getInput();
                    if (isClicked) {
                        const thisValue = target.checked ? this.checkboxToStringMap.get(checkbox) : null;
                        this.setValue(thisValue);
                    } else {
                        innerCheckBox.setValue(false);
                    }
                });
            });
        });
    }

    public getValue(): TreatmentWillAcceptanceType | null | undefined {
        return this.value;
    }

    public setVisible(visible: boolean): void {
        this.element.setAttribute("aria-hidden", `${!visible}`);
    }

    public setUpdateButton(updateButton: SDSButton) {
        this.updateButton = updateButton;
    }

    public setValue(value: TreatmentWillAcceptanceType | null | undefined) {
        this.value = value;
        if (value) {
            this.checkboxes.forEach(checkbox => {
                checkbox.setValue(this.checkboxToStringMap.get(checkbox) === value);
                if (!this.isAdministratorUser) {
                    this.setReadOnly();
                    checkbox.setEnabled(checkbox.getValue());
                }
            });
        } else {
            this.checkboxes.forEach(checkbox => {
                checkbox.setValue(null);
            });
        }
    }

    public setReadOnly() {
        this.checkboxes.forEach(checkbox => {
            checkbox.getInput().onclick = () => false;
        });
    }

    public tearDownBindings(): any {
        // Unused
    }
}