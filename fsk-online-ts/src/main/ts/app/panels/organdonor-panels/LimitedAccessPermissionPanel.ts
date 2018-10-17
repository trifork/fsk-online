import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {Checkbox, HTML} from "fmko-ts-widgets";
import {IOrganDonor} from "../../model/OrganDonorRegistrationType";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistration;

export default class LimitedAccessPermissionPanel extends TemplateWidget implements IOrganDonor<FSKTypes.OrganDonorRegistration> {

    public static deps = () => [IoC];

    private checkboxes: OrganRegistrationCheckBoxes;

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

        Object.entries(checkboxes).forEach(([key, checkbox]) => {
            if (key !== "requiresRelativeAcceptance") {
                this.appendWidgetOnVarName(this.wrapInRow(checkbox), `limited-access-checkboxes`);
            }
        });

        this.addAndReplaceWidgetByVarName(checkboxes.requiresRelativeAcceptance, `family-consent`);
    }

    public getType(): FSKTypes.OrganDonorPermissionType {
        return "LIMITED";
    }

    public getValue(): FSKTypes.OrganDonorRegistration {
        return <FSKTypes.OrganDonorRegistration>{
            permissionType: this.getType(),
            permissionForHeart: this.checkboxes.permissionForHeart.getValue(),
            permissionForKidneys: this.checkboxes.permissionForKidneys.getValue(),
            permissionForLungs: this.checkboxes.permissionForLungs.getValue(),
            permissionForCornea: this.checkboxes.permissionForCornea.getValue(),
            permissionForLiver: this.checkboxes.permissionForLiver.getValue(),
            permissionForSmallIntestine: this.checkboxes.permissionForSmallIntestine.getValue(),
            permissionForPancreas: this.checkboxes.permissionForPancreas.getValue(),
            permissionForSkin: this.checkboxes.permissionForSkin.getValue(),
            requiresRelativeAcceptance: this.checkboxes.requiresRelativeAcceptance.getValue(),
        };
    }

    public setValue(value: FSKTypes.OrganDonorRegistration): void {
        Object.entries(value).forEach(([key, value]) => {
            if (key !== "permissionType") {
                this.checkboxes[key].setValue(value);
            }
        });
    }

    public tearDownBindings(): any {
        // Unused
    }

    private wrapInRow(checkBox: Checkbox) {
        const row = new HTML();
        const column = new HTML();

        row.addStyleName(`row`);
        column.addStyleName(`col-12`);

        column.add(checkBox);
        row.add(column);

        return row;
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
        const consentCheckBox = new Checkbox(false, `Min begrænsede tilladelse forudsætter mine pårørende accept`);

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

        return this.checkboxes;
    }

}

type OrganRegistrationCheckBoxes = { [K in keyof OrganDonorRegistration]?: Checkbox; }