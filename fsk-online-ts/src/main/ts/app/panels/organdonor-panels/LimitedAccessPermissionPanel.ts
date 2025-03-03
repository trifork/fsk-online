import {Component, Render, WidgetElement} from "fmko-ts-mvc";
import {HasValueWidget, TypedWCAGCheckbox} from "fmko-ts-widgets";
import {ValueChangeEvent} from "fmko-ts-common";
import {HasValidator, ValidationBuilder, ValidationContext} from "fmko-ts-validation";
import OrganDonorRegistrationType = FSKTypes.OrganDonorRegistrationType;

@Component({
    template: require("./limitedAccessPermissionPanel.html")
})
export default class LimitedAccessPermissionPanel
    extends HasValueWidget<FSKTypes.OrganDonorRegistrationType>
    implements Render, HasValidator {

    private validator: ValidationContext;

    private isFSKSupporter: boolean;
    private anyChecked = false;

    @WidgetElement private noCheckboxSelected: HTMLDivElement;

    @WidgetElement private corneasCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private heartCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private kidneysCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private liverCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private lungsCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private pancreasCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private skinCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private smallIntestineCheckbox: TypedWCAGCheckbox<boolean>;
    @WidgetElement private consentCheckbox: TypedWCAGCheckbox<boolean>;
    private checkboxes: Map<string, TypedWCAGCheckbox<boolean>>;

    public getValidator(): ValidationContext {
        return this.validator;
    }

    public render(): void | Promise<never> {
        this.corneasCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Hornhinder"
        });
        this.heartCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Hjerte"
        });
        this.kidneysCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Nyrer"
        });
        this.liverCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Lever"
        });
        this.lungsCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Lunger"
        });
        this.pancreasCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Bugspytkirtler"
        });
        this.skinCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Hud"
        });
        this.smallIntestineCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Tyndtarm"
        });
        this.consentCheckbox = new TypedWCAGCheckbox({
            checkedValue: undefined, label: "Forudsætter accept fra patientens pårørende"
        });
        this.checkboxes = new Map<string, TypedWCAGCheckbox<boolean>>([
            ["permissionForCornea", this.corneasCheckbox],
            ["permissionForHeart", this.heartCheckbox],
            ["permissionForKidneys", this.kidneysCheckbox],
            ["permissionForLiver", this.liverCheckbox],
            ["permissionForLungs", this.lungsCheckbox],
            ["permissionForPancreas", this.pancreasCheckbox],
            ["permissionForSkin", this.skinCheckbox],
            ["permissionForSmallIntestine", this.smallIntestineCheckbox],
            ["requiresRelativeAcceptance", this.consentCheckbox]
        ]);
        this.checkboxes.forEach(checkbox => {
            checkbox.addValueChangeHandler(() => {
                this.updateValue();
            });
        });
        this.setupValidation();
    }

    public setValue(newValue: OrganDonorRegistrationType | null | undefined, fireEvents?: boolean) {
        if (newValue) {
            Object.entries(newValue).forEach(([yesNoPermissionType, permission]) => {
                if ([
                    `permissionForHeart`,
                    `permissionForKidneys`,
                    `permissionForLungs`,
                    `permissionForCornea`,
                    `permissionForLiver`,
                    `permissionForSmallIntestine`,
                    `permissionForPancreas`,
                    `permissionForSkin`,
                    `requiresRelativeAcceptance`
                ].includes(yesNoPermissionType)) {
                    const checkBox: TypedWCAGCheckbox<boolean> = this.checkboxes.get(yesNoPermissionType);
                    checkBox.setChecked(permission);
                    checkBox.setEnabled(this.isFSKSupporter && permission || !this.isFSKSupporter);
                    if (this.isFSKSupporter && permission) {
                        checkBox.getFieldElement().onclick = (() => false);
                    }
                }
            });
        } else {
            this.checkboxes.forEach(checkbox => checkbox.setChecked(false));
        }
        this.updateValue();
    }

    public getValue(): FSKTypes.OrganDonorRegistrationType {
        return this.value;
    }

    public setEnabled(enabled: boolean): void {
        this.checkboxes.forEach(checkbox => checkbox.setEnabled(enabled));
    }

    public setIsFSKSupporter(value: boolean) {
        this.isFSKSupporter = value;
    }

    public isAnyCheckboxChosen(): boolean {
        return this.anyChecked;
    }

    private updateValue(): void {
        const oldValue = this.value;
        const newValue = <FSKTypes.OrganDonorRegistrationType>{
            permissionForCornea: !!this.corneasCheckbox.isChecked(),
            permissionForHeart: !!this.heartCheckbox.isChecked(),
            permissionForKidneys: !!this.kidneysCheckbox.isChecked(),
            permissionForLiver: !!this.liverCheckbox.isChecked(),
            permissionForLungs: !!this.lungsCheckbox.isChecked(),
            permissionForPancreas: !!this.pancreasCheckbox.isChecked(),
            permissionForSkin: !!this.skinCheckbox.isChecked(),
            permissionForSmallIntestine: !!this.smallIntestineCheckbox.isChecked(),
            requiresRelativeAcceptance: !!this.consentCheckbox.isChecked()
        };
        this.value = newValue;

        this.anyChecked = Object.entries(newValue)
            .filter(([key, value]) => key !== `requiresRelativeAcceptance` && value)
            .some(([, value]) => value === true);

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }

    private setupValidation(): void {
        this.validator = new ValidationBuilder()
            .addCustomValidator({
                widgets: Array.from(this.checkboxes.values()),
                validate: () => {
                    if (!this.anyChecked) {
                        return {
                            validationMessage: "Vælg mindst ét organ"
                        };
                    }
                },
                errorDisplayContainer: this.noCheckboxSelected,
                active: () => this.isVisible()
            })
            .build();
    }
}
