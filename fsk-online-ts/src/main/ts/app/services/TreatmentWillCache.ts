import {AsyncValueHolder, ModuleContext} from "fmko-ts-common";
import FSKService from "./FSKService";
import RegistrationStateUtil from "../util/RegistrationStateUtil";
import {RegistrationState} from "../model/RegistrationState";
import {PopupDialog} from "fmko-ts-widgets";
import FSKUserUtil from "../util/FSKUserUtil";
import {Dependency, Service} from "fmko-ts-mvc";
import TreatmentWillType = FSKTypes.TreatmentWillType;
import RegistrationTypeWrapper = FSKTypes.RegistrationTypeWrapper;

@Service()
export default class TreatmentWillCache {
    public registrationState: RegistrationState = RegistrationState.UNCHECKED;

    public readonly treatmentWill = new AsyncValueHolder<RegistrationTypeWrapper<TreatmentWillType>>(async () => {
        if (await this.loadHasRegistration() === RegistrationState.REGISTERED) {
            return this.getRegistration();
        } else {
            return null;
        }
    }, () => {
        PopupDialog.warning("Der opstod en fejl", `Der opstod en uventet fejl ved aflæsning af patientens behandlingstestamente.`);
    });

    constructor(
        @Dependency("ModuleContext") private moduleContext: ModuleContext,
        @Dependency(FSKService) private fskService: FSKService) {
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
        if (this.isDentist()) {
            return await this.fskService.getTreatmentWillWithOnlyForcedTreatmentForPatient(this.getPatientCpr());
        } else {
            return await this.fskService.getTreatmentWillForPatient(this.getPatientCpr());
        }
    }

    private getPatientCpr(): string {
        return this.moduleContext.getPatient().getCpr();
    }

    private isDentist(): boolean {
        return FSKUserUtil.isDentistWithoutElevatedRights(this.moduleContext.getUserContext());
    }
}
