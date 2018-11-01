import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public hasRegistration: boolean;

    public readonly livingWill = new AsyncValueHolder<LivingWillType>(async () => {
        if (await this.loadHasRegistration()) {
            return this.getRegistration();
        } else {
            return null;
        }
    }, error => {
        // Ignore
    });

    public setStale(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.hasRegistration = undefined;
        }
        this.livingWill.setStale();
    }

    public clear(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.hasRegistration = undefined;
        }
        this.livingWill.clear();
    }

    public async loadHasRegistration(): Promise<boolean> {
        if (typeof this.hasRegistration === `boolean`) {
            return this.hasRegistration;
        }
        this.hasRegistration = this.moduleContext.getPatient()
            ? (await this.fskService.hasLivingWillForPatient(this.moduleContext.getPatient().getCpr())).willExists
            : await undefined;
        return this.hasRegistration;
    }

    private async getRegistration(): Promise<LivingWillType> {
        return await this.fskService.getLivingWillForPatient(this.moduleContext.getPatient().getCpr());
    }

    public async deleteRegistration(): Promise<boolean> {
        if (this.hasRegistration) {
            await this.fskService.deleteLivingWillForPatient(this.moduleContext.getPatient().getCpr());
            this.hasRegistration = false;
        }
        return this.loadHasRegistration();
    }
}