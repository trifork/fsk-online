import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistration;

export default class FSKOrganDonorCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public organDonorRegister = new AsyncValueHolder<OrganDonorRegistration>(async () => {
       /* return this.moduleContext.getPatient()
            ? await this.fskService.getOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr())
            : await null;*/
       return <OrganDonorRegistration>{
           permissionType: "LIMITED",
           requiresRelativeAcceptance: true,
           permissionForKidneys: true,
           permissionForLungs: true
       }
    }, error => {
        console.log("Det skete en fejl");
    });
}