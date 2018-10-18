import {Widget} from "fmko-typescript-common";
import {IOrganDonor} from "../../model/OrganDonorRegistrationType";

export default class NoAccessPermissionPanel extends Widget implements IOrganDonor<FSKTypes.OrganDonorRegistration> {

    public constructor() {
        super();
        this.element = document.createElement(`div`);
    }

    getValue(): FSKTypes.OrganDonorRegistration {
        return <FSKTypes.OrganDonorRegistration>{
            permissionType: this.getType()
        };
    }

    public setValue(organDonorRegistation: FSKTypes.OrganDonorRegistration) {
        // Unused
    }

    public getType(): FSKTypes.OrganDonorPermissionType {
        return "NONE";
    }
}