import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {Checkbox, HTML} from "fmko-ts-widgets";
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
        const checkboxes = this.createCheckboxes();

        let row: HTML = null;

        Object.entries(checkboxes).forEach(([key, checkbox], index) => {
            if (key !== "requiresRelativeAcceptance") {
                if (index % 4 === 0) {
                    if (row) {
                        this.appendWidgetOnVarName(row, `limited-access-checkboxes`);
                    }
                    row = new HTML();
                    row.addStyleName(`row`);
                    row.getCssStyle().paddingBottom = `8px`;
                }

                this.wrapInRow(row, checkbox);
            }
        });
        this.appendWidgetOnVarName(row, `limited-access-checkboxes`);

        this.appendWidgetOnVarName(checkboxes.requiresRelativeAcceptance, `family-consent`, true);
    }

    public setEnabled(enabled: boolean): void {
        if (!enabled) {
            Object.values(this.checkboxes).forEach(checkbox => checkbox.getInput().onclick = ( () => false));
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
                    this.checkboxes[key].setValue(objValue);
                    this.checkboxes[key].setEnabled(isFSKSupporter && objValue || !isFSKSupporter);
                    if (isFSKSupporter && objValue) {
                        this.checkboxes[key].getInput().onclick = ( () => false);
                    }
                }
            });
        } else {
            Object.values(this.checkboxes).forEach(checkbox => checkbox.setValue(false));
        }
    }

    public tearDownBindings(): any {
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
        const heartCheckbox = new Checkbox(false, `Hjerte`);
        const lungsCheckbox = new Checkbox(false, `Lunger`);
        const liverCheckbox = new Checkbox(false, `Lever`);
        const pancreasCheckbox = new Checkbox(false, `Bugspytkirtel`);
        const kidneyCheckbox = new Checkbox(false, `Nyrer`);
        const corneasCheckbox = new Checkbox(false, `Hornhinder`);
        const intestineCheckbox = new Checkbox(false, `Tyndtarm`);
        const skinCheckbox = new Checkbox(false, `Hud`);
        const consentCheckBox = new Checkbox(false, `Forudsætter accept fra patientens pårørende`);

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
            currentCheckbox.getCssStyle().fontSize = `14px`;
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

    private wrapInRow(row: HTML, checkBox: Checkbox): void {

        const column = new HTML();
        column.addStyleName(`col-3`);

        column.add(checkBox);
        row.add(column);
    }

}

type OrganRegistrationCheckBoxes = { [K in keyof OrganDonorRegistration]?: Checkbox; };
