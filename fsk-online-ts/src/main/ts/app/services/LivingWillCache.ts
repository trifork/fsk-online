import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import {RegistrationState} from "../model/RegistrationState";
import RegistrationStateUtil from "../util/RegistrationStateUtil";
import LivingWillType = FSKTypes.LivingWillType;

export default class LivingWillCache {
    public static deps = () => ["ModuleContext", FSKService];

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
        if (this.registrationState !== RegistrationState.UNCHECKED) {
            return this.registrationState;
        }
        const willValue = this.moduleContext.getPatient()
            ? (await this.fskService.hasLivingWillForPatient(this.getPatientCpr())).willExists
            : await undefined;
        this.registrationState = RegistrationStateUtil.registrationStateMapper(willValue);
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