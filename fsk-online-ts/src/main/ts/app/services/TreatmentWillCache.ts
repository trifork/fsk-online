import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import TreatmentWillType = FSKTypes.TreatmentWillType;
import RegistrationStateUtil from "../util/RegistrationStateUtil";
import {RegistrationState} from "../model/RegistrationState";

export default class TreatmentWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public registrationState: RegistrationState = RegistrationState.UNCHECKED;

    public readonly treatmentWill = new AsyncValueHolder<TreatmentWillType>(async () => {
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
        this.treatmentWill.setStale();
    }

    public clear(removeRegistration: boolean) {
        if (removeRegistration === true) {
            this.registrationState = RegistrationState.UNCHECKED;
        }
        this.treatmentWill.clear();
    }

    public async loadHasRegistration(): Promise<RegistrationState> {
        if (this.registrationState !== RegistrationState.UNCHECKED) {
            return this.registrationState;
        }
        const willValue = this.moduleContext.getPatient()
            ? (await this.fskService.hasTreatmentWillForPatient(this.getPatientCpr())).willExists
            : await undefined;
        this.registrationState = RegistrationStateUtil.registrationStateMapper(willValue);
        return this.registrationState;
    }

    private async getRegistration(): Promise<TreatmentWillType> {
        return await this.fskService.getTreatmentWillForPatient(this.getPatientCpr());
    }

    private getPatientCpr(): string{
        return this.moduleContext.getPatient().getCpr();
    }
}