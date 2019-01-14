import {AsyncValueHolder, ModuleContext} from "fmko-typescript-common";
import FSKService from "./FSKService";
import {RegistrationState} from "../model/RegistrationState";
import RegistrationStateUtil from "../util/RegistrationStateUtil";
import {ErrorDisplay} from "fmko-ts-widgets";
import LivingWillType = FSKTypes.LivingWillType;
import LivingWillWrapper = FSKTypes.RegistrationTypeWrapper;

export default class LivingWillCache {
    public static deps = () => ["ModuleContext", FSKService];

    constructor(private moduleContext: ModuleContext, private fskService: FSKService) {

    }

    public registrationState: RegistrationState = RegistrationState.UNCHECKED;

    public readonly livingWill = new AsyncValueHolder<LivingWillWrapper<LivingWillType>>(async () => {
        if (await this.loadHasRegistration() === RegistrationState.REGISTERED) {
            return this.getRegistration();
        } else {
            return null;
        }
    }, error => {
        ErrorDisplay.showError("Der skete en fejl", `Der skete en uventet fejl ved aflæsning af patientens livstestamente.`);
    });

    public setStale(removeRegistration?: boolean) {
        if (removeRegistration === true) {
            this.registrationState = RegistrationState.UNCHECKED;
        }
        this.livingWill.setStale();
    }

    public clear(removeRegistration?: boolean) {
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

    private async getRegistration(): Promise<LivingWillWrapper<LivingWillType>> {
        return await this.fskService.getLivingWillForPatient(this.getPatientCpr());
    }

    public async deleteRegistration(): Promise<RegistrationState> {
        if (this.registrationState === RegistrationState.REGISTERED) {
            try {
                await this.fskService.deleteLivingWillForPatient(this.getPatientCpr());
                this.registrationState = RegistrationState.NOT_REGISTERED;
            } catch (error) {
                // Ignore error, living will is still registered
            }
        }
        return this.registrationState;
    }

    private getPatientCpr(): string {
        return this.moduleContext.getPatient().getCpr();
    }
}