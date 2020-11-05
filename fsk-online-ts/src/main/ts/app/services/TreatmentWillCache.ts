import {AsyncValueHolder, ModuleContext} from "fmko-ts-common";
import FSKService from "./FSKService";
import RegistrationStateUtil from "../util/RegistrationStateUtil";
import {RegistrationState} from "../model/RegistrationState";
import {ErrorDisplay} from "fmko-ts-widgets";
import TreatmentWillType = FSKTypes.TreatmentWillType;
import RegistrationTypeWrapper = FSKTypes.RegistrationTypeWrapper;

export default class TreatmentWillCache {
    public registrationState: RegistrationState = RegistrationState.UNCHECKED;

    public readonly treatmentWill = new AsyncValueHolder<RegistrationTypeWrapper<TreatmentWillType>>(async () => {
        if (await this.loadHasRegistration() === RegistrationState.REGISTERED) {
            return this.getRegistration();
        } else {
            return null;
        }
    }, error => {
        ErrorDisplay.showError("Der opstod en fejl", `Der opstod en uventet fejl ved aflæsning af patientens behandlingstestamente.`);
    });

    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public setStale(removeRegistration?: boolean) {
        if (removeRegistration === true) {
            this.registrationState = RegistrationState.UNCHECKED;
        }
        this.treatmentWill.setStale();
    }

    public clear(removeRegistration?: boolean) {
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

    private async getRegistration(): Promise<RegistrationTypeWrapper<TreatmentWillType>> {
        return await this.fskService.getTreatmentWillForPatient(this.getPatientCpr());
    }

    private getPatientCpr(): string {
        return this.moduleContext.getPatient().getCpr();
    }
}
