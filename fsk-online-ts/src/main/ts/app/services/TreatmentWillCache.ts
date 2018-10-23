import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import TreatmentWillType = FSKTypes.TreatmentWillType;

export default class TreatmentWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public hasRegistration: boolean;

    public readonly treatmentWill = new AsyncValueHolder<TreatmentWillType>(async () => {
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
            ? (await this.fskService.hasTreatmentWillForPatient(this.moduleContext.getPatient().getCpr())).willExists
            : await false;
        return this.hasRegistration;
    }

    private async getRegistration(): Promise<TreatmentWillType> {
        return await this.fskService.getTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
    }
}