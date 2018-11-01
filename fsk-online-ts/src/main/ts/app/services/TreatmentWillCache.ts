import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import TreatmentWillType = FSKTypes.TreatmentWillType;

export default class TreatmentWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public hasRegistration: boolean;

    public readonly treatmentWill = new AsyncValueHolder<TreatmentWillType>(async () => {
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
        this.treatmentWill.setStale();
    }

    public clear(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.hasRegistration = undefined;
        }
        this.treatmentWill.clear();
    }

    public async loadHasRegistration(): Promise<boolean> {
        if (typeof this.hasRegistration === `boolean`) {
            return this.hasRegistration;
        }
        this.hasRegistration = this.moduleContext.getPatient()
            ? (await this.fskService.hasTreatmentWillForPatient(this.moduleContext.getPatient().getCpr())).willExists
            : await undefined;
        return this.hasRegistration;
    }

    private async getRegistration(): Promise<TreatmentWillType> {
        return await this.fskService.getTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
    }
}