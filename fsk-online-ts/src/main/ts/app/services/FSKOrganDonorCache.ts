import {AsyncValueHolder, ModuleContext} from "fmko-ts-common";
import FSKService from "./FSKService";
import {PopupDialog} from "fmko-ts-widgets";
import {Dependency, Service} from "fmko-ts-mvc";
import OrganDonorRegistrationType = FSKTypes.OrganDonorRegistrationType;
import RegistrationTypeWrapper = FSKTypes.RegistrationTypeWrapper;

@Service()
export default class FSKOrganDonorCache {
    public hasRegistration: boolean;

    public readonly organDonorRegister = new AsyncValueHolder<RegistrationTypeWrapper<OrganDonorRegistrationType>>(async () => {
        if (await this.loadHasRegistration()) {
            return this.getRegistration();
        } else {
            return null;
        }
    }, () => {
        PopupDialog.warning("Der opstod en fejl", `Der opstod en uventet fejl ved aflæsning af patientens organdonorregistrering.`);
    });

    constructor(
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency(FSKService) private fskService: FSKService) {
    }

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

    private async getRegistration(): Promise<RegistrationTypeWrapper<OrganDonorRegistrationType>> {
        return await this.fskService.getOrganDonorRegisterForPatient(this.moduleContext.getPatient().getCpr());
    }
}
