import {Component, Render, WidgetElement} from "fmko-ts-mvc";
import {HasValueWidget, TypedWCAGCheckbox} from "fmko-ts-widgets";
import {ValueChangeEvent} from "fmko-ts-common";
import OrganDonorRegistrationType = FSKTypes.OrganDonorRegistrationType;

@Component({
    template: require("./fullAccessPermissionPanel_2.html")
})
export default class FullAccessPermissionPanel_2
    extends HasValueWidget<FSKTypes.OrganDonorRegistrationType>
    implements Render {
    private isFSKSupporter: boolean;

    @WidgetElement private consentCheckbox: TypedWCAGCheckbox<boolean>;

    public render(): void | Promise<never> {
        this.consentCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Forudsætter accept fra patientens pårørende"
        });
        this.consentCheckbox.addValueChangeHandler(() => {
            this.updateValue();
        });
    }

    public setValue(newValue: OrganDonorRegistrationType | null | undefined, fireEvents?: boolean) {
        if (newValue) {
            this.consentCheckbox.setChecked(newValue.requiresRelativeAcceptance);
            this.consentCheckbox.setEnabled(this.isFSKSupporter && newValue.requiresRelativeAcceptance || !this.isFSKSupporter);
            if (this.isFSKSupporter && newValue.requiresRelativeAcceptance) {
                this.consentCheckbox.getFieldElement().onclick = (() => false);
            }
        } else {
            this.consentCheckbox.setChecked(false);
        }
        this.updateValue();
    }

    public getValue(): FSKTypes.OrganDonorRegistrationType {
        this.updateValue();
        return this.value;
    }

    public setEnabled(enabled: boolean): void {
        this.consentCheckbox.setEnabled(enabled);
    }

    public setIsFSKSupporter(value: boolean) {
        this.isFSKSupporter = value;
    }

    private updateValue(): void {
        const oldValue = this.value;
        const newValue = <FSKTypes.OrganDonorRegistrationType>{
            requiresRelativeAcceptance: !!this.consentCheckbox.isChecked()
        };
        this.value = newValue;

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }
}
