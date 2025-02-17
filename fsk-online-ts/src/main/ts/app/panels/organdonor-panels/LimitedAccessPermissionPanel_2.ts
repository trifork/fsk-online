import {Component, Render, WidgetElement} from "fmko-ts-mvc";
import {HasValueWidget, ImageDimensions, InfoPanel, InfoPanelSeverity, TypedWCAGCheckbox} from "fmko-ts-widgets";
import {ImageSrc, ValueChangeEvent} from "fmko-ts-common";
import OrganDonorRegistrationType = FSKTypes.OrganDonorRegistrationType;

@Component({
    template: require("./limitedAccessPermissionPanel_2.html")
})
export default class LimitedAccessPermissionPanel_2
    extends HasValueWidget<FSKTypes.OrganDonorRegistrationType>
    implements Render {
    private isFSKSupporter: boolean;

    @WidgetElement private noCheckboxSelected: InfoPanel;

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

    public render(): void | Promise<never> {
        this.noCheckboxSelected = new InfoPanel({
            description: `Angiv mindst ét organ`,
            severity: InfoPanelSeverity.WARNING,
            imageOptions: {
                alt: "warning sign",
                src: ImageSrc.ATTENTION,
                imageSize: ImageDimensions.L
            }
        });
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
        this.updateValue();
        return this.value;
    }

    public setEnabled(enabled: boolean): void {
        if (!enabled) {
            this.checkboxes.forEach(checkbox => checkbox.setEnabled(false));
        }
        this.checkboxes.forEach(checkbox => checkbox.setEnabled(true));
    }

    public setIsFSKSupporter(value: boolean) {
        this.isFSKSupporter = value;
    }

    public isACheckboxChosen(): boolean {
        let anyChecked = false;
        this.checkboxes.forEach((checkbox, key) => {
            if (key === `requiresRelativeAcceptance`) {
                return;
            }
            if (checkbox.isChecked() === true) {
                anyChecked = true;
            }
        });
        return anyChecked;
    }

    private updateValue(): void {
        const checkboxChosen = this.isACheckboxChosen();
        this.showCheckboxError(!checkboxChosen);

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

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }

    private showCheckboxError(show: boolean): void {
        this.noCheckboxSelected.setVisible(show);
    }
}
