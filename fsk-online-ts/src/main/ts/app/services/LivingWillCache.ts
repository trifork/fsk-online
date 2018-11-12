import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import {RegistrationState} from "../model/RegistrationState";
import RegistrationStateUtil from "../util/RegistrationStateUtil";
import LivingWillType = FSKTypes.LivingWillType;
import HasWillResponse = FSKTypes.HasWillResponse;

export default class LivingWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    private loading: Promise<HasWillResponse>;

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public registrationState: RegistrationState = RegistrationState.UNCHECKED;

    public readonly livingWill = new AsyncValueHolder<LivingWillType>(async () => {
        if (await this.loadHasRegistration() === RegistrationState.REGISTERED) {
            return this.getRegistration();
        } else {
            return null;
        }
    }, error => {
        // Ignore
    });

    public setStale(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.registrationState = RegistrationState.UNCHECKED;
        }
        this.livingWill.setStale();
    }

    public clear(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.registrationState = RegistrationState.UNCHECKED;
        }
        this.livingWill.clear();
    }

    public async loadHasRegistration(): Promise<RegistrationState> {
        if(this.loading){
            return RegistrationStateUtil.registrationStateMapper((await this.loading).willExists);
        }

        if (this.registrationState !== RegistrationState.UNCHECKED) {
            return this.registrationState;
        }

        this.loading = this.moduleContext.getPatient()
            ? (this.fskService.hasLivingWillForPatient(this.getPatientCpr()))
            : undefined;

        this.registrationState = RegistrationStateUtil.registrationStateMapper((await this.loading).willExists);
        this.loading.then(() => {
            this.loading = undefined;
        });
        return this.registrationState;
    }

    private async getRegistration(): Promise<LivingWillType> {
        return await this.fskService.getLivingWillForPatient(this.getPatientCpr());
    }

    public async deleteRegistration(): Promise<RegistrationState> {
        if (this.registrationState === RegistrationState.REGISTERED) {
            await this.fskService.deleteLivingWillForPatient(this.getPatientCpr());
            this.registrationState = RegistrationState.NOT_REGISTERED;
        }
        return this.loadHasRegistration();
    }

    private getPatientCpr(): string{
        return this.moduleContext.getPatient().getCpr();
    }
}