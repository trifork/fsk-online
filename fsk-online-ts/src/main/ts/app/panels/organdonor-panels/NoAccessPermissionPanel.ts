import {Widget} from "fmko-typescript-common";
import {IOrganDonor} from "../../model/OrganDonorRegistrationType";

export default class NoAccessPermissionPanel extends Widget implements IOrganDonor<FSKTypes.OrganDonorRegistrationType> {

    public constructor() {
        super();
        this.element = document.createElement(`div`);
    }

    getValue(): FSKTypes.OrganDonorRegistrationType {
        return <FSKTypes.OrganDonorRegistrationType>{
            permissionType: this.getType()
        };
    }

    public setValue(organDonorRegistation: FSKTypes.OrganDonorRegistrationType) {
        // Unused
    }

    public getType(): FSKTypes.OrganDonorPermissionType {
        return "NONE";
    }

}