import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import OrganDonorRegistrationType = FSKTypes.OrganDonorRegistrationType;

export default class FSKOrganDonorCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public hasRegistration: boolean;

    public readonly organDonorRegister = new AsyncValueHolder<OrganDonorRegistrationType>(async () => {
        if (this.hasRegistration) {
            return this.getRegistration();
        } else {
            if (await this.loadHasRegistration()) {
                return this.getRegistration();
            } else {
                return undefined;
            }
        }
    }, error => {
        // Ignore
    });

    private async loadHasRegistration(): Promise<boolean> {
        this.hasRegistration = this.moduleContext.getPatient()
            ? (await this.fskService.hasOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr())).registrationExists
            : await false;
        return this.hasRegistration;
    }

    private async getRegistration(): Promise<OrganDonorRegistrationType> {
        return await this.fskService.getOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
    }
}