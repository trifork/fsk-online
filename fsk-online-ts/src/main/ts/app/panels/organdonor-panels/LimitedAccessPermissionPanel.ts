import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {CheckboxWrapper} from "fmko-ts-widgets";
import {Widget} from "fmko-ts-common";
import SDSButton from "../../elements/SDSButton";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistrationType;

export default class LimitedAccessPermissionPanel extends TemplateWidget {

    private checkboxes: OrganRegistrationCheckBoxes;
    private updateButton: SDSButton;

    public static deps = () => [IoC];

    constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
    }

    public getTemplate(): string {
        return require(`./limitedAccessPermissionPanel.html`);
    }

    public setupBindings(): any {
        this.checkboxes = this.createCheckboxes();
    }

    public setEnabled(enabled: boolean): void {
        if (!enabled) {
            Object.values(this.checkboxes).forEach(checkbox => checkbox.getInput().onclick = (() => false));
        }
        Object.values(this.checkboxes).forEach(checkbox => checkbox.setEnabled(true));
    }

    public setUpdateButton(updateButton: SDSButton) {
        this.updateButton = updateButton;
    }

    public getValue(): FSKTypes.OrganDonorRegistrationType {
        const isCheckboxChosen = this.isACheckboxChosen();
        if (!isCheckboxChosen) {
            this.showCheckboxError(!isCheckboxChosen);
            return null;
        }
        return <FSKTypes.OrganDonorRegistrationType>{
            permissionForCornea: !!this.checkboxes.permissionForCornea.getValue(),
            permissionForHeart: !!this.checkboxes.permissionForHeart.getValue(),
            permissionForKidneys: !!this.checkboxes.permissionForKidneys.getValue(),
            permissionForLiver: !!this.checkboxes.permissionForLiver.getValue(),
            permissionForLungs: !!this.checkboxes.permissionForLungs.getValue(),
            permissionForPancreas: !!this.checkboxes.permissionForPancreas.getValue(),
            permissionForSkin: !!this.checkboxes.permissionForSkin.getValue(),
            permissionForSmallIntestine: !!this.checkboxes.permissionForSmallIntestine.getValue(),
            requiresRelativeAcceptance: !!this.checkboxes.requiresRelativeAcceptance.getValue()
        };
    }


    public setValue(value: FSKTypes.OrganDonorRegistrationType, isFSKSupporter: boolean): void {
        if (value) {
            Object.entries(value).forEach(([key, objValue]) => {
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
                ].includes(key)) {
                    // @ts-ignore
                    const checkBox = this.checkboxes[key];
                    checkBox.setValue(objValue);
                    checkBox.setEnabled(isFSKSupporter && objValue || !isFSKSupporter);
                    if (isFSKSupporter && objValue) {
                        checkBox.getInput().onclick = (() => false);
                    }
                }
            });
        } else {
            Object.values(this.checkboxes).forEach(checkbox => checkbox.setValue(false));
        }
    }

    public override tearDownBindings(): any {
        // Unused
    }

    public isACheckboxChosen(): boolean {
        return Object.entries(this.checkboxes)
            .some(([key, checkbox]) => key !== `requiresRelativeAcceptance`
                ? !!checkbox.getValue()
                : false
            );
    }

    public showCheckboxError(show: boolean): void {
        if (show) {
            this.getElementByVarName(`checkbox-container`).classList.add(`fsk-warning`);
        } else {
            this.getElementByVarName(`checkbox-container`).classList.remove(`fsk-warning`);
        }
        Widget.setVisible(this.getElementByVarName(`no-checkbox-selected`), show);
    }

    public createCheckboxes(): OrganRegistrationCheckBoxes {
        const heartCheckbox = new CheckboxWrapper(this.getElementByVarName(`heart-checkbox`));
        const lungsCheckbox = new CheckboxWrapper(this.getElementByVarName(`lungs-checkbox`));
        const liverCheckbox = new CheckboxWrapper(this.getElementByVarName(`liver-checkbox`));
        const pancreasCheckbox = new CheckboxWrapper(this.getElementByVarName(`pancreas-checkbox`));
        const kidneyCheckbox = new CheckboxWrapper(this.getElementByVarName(`kidney-checkbox`));
        const corneasCheckbox = new CheckboxWrapper(this.getElementByVarName(`corneas-checkbox`));
        const intestineCheckbox = new CheckboxWrapper(this.getElementByVarName(`intestine-checkbox`));
        const skinCheckbox = new CheckboxWrapper(this.getElementByVarName(`skin-checkbox`));
        const consentCheckBox = new CheckboxWrapper(this.getElementByVarName(`consent-checkbox`));

        this.checkboxes = <OrganRegistrationCheckBoxes>{
            permissionForCornea: corneasCheckbox,
            permissionForHeart: heartCheckbox,
            permissionForKidneys: kidneyCheckbox,
            permissionForLiver: liverCheckbox,
            permissionForLungs: lungsCheckbox,
            permissionForPancreas: pancreasCheckbox,
            permissionForSkin: skinCheckbox,
            permissionForSmallIntestine: intestineCheckbox,
            requiresRelativeAcceptance: consentCheckBox
        };

        Object.values(this.checkboxes).forEach(currentCheckbox => {
            currentCheckbox.addValueChangeHandler(handler => {
                if (currentCheckbox !== consentCheckBox) {
                    const value = handler.getValue();
                    if (value) {
                        this.showCheckboxError(false);
                    }
                }

                if (this.updateButton) {
                    this.updateButton.setEnabled(true);
                }
            });
        });

        return this.checkboxes;
    }
}

type OrganRegistrationCheckBoxes = { [K in keyof OrganDonorRegistration]?: CheckboxWrapper; };
