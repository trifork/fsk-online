import {Widget} from "fmko-typescript-common";
import {IOrganDonor} from "../../model/OrganDonorRegistrationType";
import {Checkbox} from "fmko-ts-widgets";

export default class FullAccessPermissionPanel extends Widget implements IOrganDonor<FSKTypes.OrganDonorRegistrationType> {

    public static deps = () => [];

    private fullPermissionCheckBox: Checkbox;

    public constructor() {
        super();
        this.element = document.createElement(`div`);
        this.element.className = `card full-access-panel`;
        this.fullPermissionCheckBox = new Checkbox(false, `Min fulde tilladelse forudsætter mine pårørendes accept`);
        this.add(this.fullPermissionCheckBox);
    }

    getValue(): FSKTypes.OrganDonorRegistrationType {
        return <FSKTypes.OrganDonorRegistrationType>{
            permissionType: this.getType(),
            requiresRelativeAcceptance: this.fullPermissionCheckBox.getValue()
        };
    }

    public setVisible(visible: boolean): void{
        super.setVisible(visible);
        if(!visible){
            this.element.style.display = `block`;
        }
    }

    public setValue(organDonorRegistation: FSKTypes.OrganDonorRegistrationType) {
        this.fullPermissionCheckBox.setValue(!!organDonorRegistation.requiresRelativeAcceptance);
    }

    public getType(): FSKTypes.OrganDonorPermissionType {
        return "FULL";
    }
}