import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import OrganDonorRegistrationType = FSKTypes.OrganDonorRegistrationType;

export default class FSKOrganDonorCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public hasRegistration: boolean;

    public readonly organDonorRegister = new AsyncValueHolder<OrganDonorRegistrationType>(async () => {
        if (await this.loadHasRegistration()) {
            return this.getRegistration();
        } else {
            return undefined;
        }
    }, error => {
        // Ignore
    });

    public setStale(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.hasRegistration = undefined;
        }
        this.organDonorRegister.setStale();
    }

    public clear(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.hasRegistration = undefined;
        }
        this.organDonorRegister.clear();
    }

    private async loadHasRegistration(): Promise<boolean> {
        if (typeof this.hasRegistration === `boolean`) {
            return this.hasRegistration;
        }
        this.hasRegistration = this.moduleContext.getPatient()
            ? (await this.fskService.hasOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr())).registrationExists
            : await undefined;
        return this.hasRegistration;
    }

    private async getRegistration(): Promise<OrganDonorRegistrationType> {
        return await this.fskService.getOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
    }
}