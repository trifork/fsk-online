import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public hasRegistration: boolean;

    public livingWill = new AsyncValueHolder<LivingWillType>(async () => {
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
        this.hasRegistration = (await this.fskService.hasLivingWillForPatient(this.moduleContext.getPatient().getCpr())).willExists;
        return this.hasRegistration;
    }

    private async getRegistration(): Promise<LivingWillType> {
        return await this.fskService.getLivingWillForPatient(this.moduleContext.getPatient().getCpr());
    }
}