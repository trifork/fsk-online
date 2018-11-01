import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {Checkbox, HTML} from "fmko-ts-widgets";
import {IOrganDonor} from "../../model/OrganDonorRegistrationType";
import {Widget} from "fmko-typescript-common";
import SDSButton from "../../elements/SDSButton";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistrationType;

export default class LimitedAccessPermissionPanel extends TemplateWidget implements IOrganDonor<FSKTypes.OrganDonorRegistrationType> {

    public static deps = () => [IoC];

    private checkboxes: OrganRegistrationCheckBoxes;
    private updateButton: SDSButton;

    public constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
    }

    public getTemplate(): string {
        return loadTemplate(`panels/organdonor-panels/limitedAccessPermissionPanel.html`);
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
                    row.getCssStyle().paddingLeft = `8px`;
                }

                this.wrapInRow(row, checkbox);
            }
        });
        this.appendWidgetOnVarName(row, `limited-access-checkboxes`);

        this.appendWidgetOnVarName(checkboxes.requiresRelativeAcceptance, `family-consent`, true);
    }

    public getType(): FSKTypes.OrganDonorPermissionType {
        return "LIMITED";
    }

    public setEnabled(enabled: boolean): void {
        Object.values(this.checkboxes).forEach(checkbox => checkbox.setEnabled(enabled));
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
            permissionType: this.getType(),
            permissionForHeart: !!this.checkboxes.permissionForHeart.getValue(),
            permissionForKidneys: !!this.checkboxes.permissionForKidneys.getValue(),
            permissionForLungs: !!this.checkboxes.permissionForLungs.getValue(),
            permissionForCornea: !!this.checkboxes.permissionForCornea.getValue(),
            permissionForLiver: !!this.checkboxes.permissionForLiver.getValue(),
            permissionForSmallIntestine: !!this.checkboxes.permissionForSmallIntestine.getValue(),
            permissionForPancreas: !!this.checkboxes.permissionForPancreas.getValue(),
            permissionForSkin: !!this.checkboxes.permissionForSkin.getValue(),
            requiresRelativeAcceptance: !!this.checkboxes.requiresRelativeAcceptance.getValue(),
        };
    }

    public setValue(value: FSKTypes.OrganDonorRegistrationType): void {
        if (value) {
            Object.entries(value).forEach(([key, value]) => {
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
                    this.checkboxes[key].setValue(value);
                }
            });
        } else {
            Object.values(this.checkboxes).forEach(checkbox => checkbox.setValue(false));
        }
    }

    public tearDownBindings(): any {
        // Unused
    }

    private wrapInRow(row: HTML, checkBox: Checkbox): void {

        const column = new HTML();
        column.addStyleName(`col-3`);

        column.add(checkBox);
        row.add(column);
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
        const kidneyCheckbox = new Checkbox(false, `Nyrer`);
        const lungsCheckbox = new Checkbox(false, `Lunger`);
        const corneasCheckbox = new Checkbox(false, `Hornhinder`);
        const liverCheckbox = new Checkbox(false, `Lever`);
        const intestineCheckbox = new Checkbox(false, `Tyndtarm`);
        const pancreasCheckbox = new Checkbox(false, `Bugspytkirtel`);
        const skinCheckbox = new Checkbox(false, `Hud`);
        const consentCheckBox = new Checkbox(false, `Forudsætter accept fra patientens pårørende`);

        this.checkboxes = <OrganRegistrationCheckBoxes>{
            permissionForHeart: heartCheckbox,
            permissionForKidneys: kidneyCheckbox,
            permissionForLungs: lungsCheckbox,
            permissionForCornea: corneasCheckbox,
            permissionForLiver: liverCheckbox,
            permissionForSmallIntestine: intestineCheckbox,
            permissionForPancreas: pancreasCheckbox,
            permissionForSkin: skinCheckbox,
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

}

type OrganRegistrationCheckBoxes = { [K in keyof OrganDonorRegistration]?: Checkbox; }