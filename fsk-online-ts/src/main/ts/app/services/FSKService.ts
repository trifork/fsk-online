import {ModuleContext, RESTClient, Version} from "fmko-ts-common";
import ODRRestUrls from "./ODRRestUrls";
import BTRRestUrls from "./BTRRestUrls";
import LTRRestUrl from "./LTRRestUrl";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistrationType;
import TreatmentWillType = FSKTypes.TreatmentWillType;
import LivingWillType = FSKTypes.LivingWillType;
import HasWillResponse = FSKTypes.HasWillResponse;
import HasRegistrationResponse = FSKTypes.HasRegistrationResponse;
import LivingWillWrapper = FSKTypes.RegistrationTypeWrapper;
import RegistrationTypeWrapper = FSKTypes.RegistrationTypeWrapper;

export default class FSKService {

    private restClient: RESTClient;

    public static deps = () => [ODRRestUrls, BTRRestUrls, LTRRestUrl, "ModuleContext", "Version"];

    constructor(
        private odrRestUrls: ODRRestUrls,
        private btrRestUrls: BTRRestUrls,
        private ltrRestUrls: LTRRestUrl,
        private moduleContext: ModuleContext,
        private version: Version) {
        this.restClient = new RESTClient({moduleContext, version});
    }

    // OrgandonationRegistration

    public async getOrganDonorRegisterForPatient(cpr: string): Promise<RegistrationTypeWrapper<OrganDonorRegistration>> {
        const url = this.odrRestUrls.getOrganDonorRegisterForPatient(cpr);
        return await this.restClient.get<RegistrationTypeWrapper<OrganDonorRegistration>>(url, `Henter organdonor information for cpr: ${cpr}`);
    }

    public async hasOrganDonorRegisterForPatient(cpr: string): Promise<HasRegistrationResponse> {
        const url = this.odrRestUrls.hasOrganDonorRegisterForPatient(cpr);
        return await this.restClient.get<HasRegistrationResponse>(url, `Undersøger om cpr ${cpr} har en organdonor registrering`);
    }

    public async createOrganDonorRegisterForPatient(cpr: string, organDonorRegistration: OrganDonorRegistration): Promise<{}> {
        const url = this.odrRestUrls.createOrganDonorRegisterForPatient(cpr);
        return await this.restClient.post<{}>(url, organDonorRegistration, `Opretter organdonor information for cpr: ${cpr}`);
    }

    public async updateOrganDonorRegisterForPatient(cpr: string, organDonorRegistration: OrganDonorRegistration): Promise<{}> {
        const url = this.odrRestUrls.updateOrganDonorRegisterForPatient(cpr);
        return await this.restClient.put<{}>(url, organDonorRegistration, `Opdaterer organdonor information for cpr: ${cpr}`);
    }

    public async deleteOrganDonorRegisterForPatient(cpr: string): Promise<{}> {
        const url = this.odrRestUrls.deleteOrganDonorRegisterForPatient(cpr);
        return await this.restClient.delete<{}>(url, null, `Sletter organdonor information for cpr: ${cpr}`);
    }

    // TREATMENT WILL

    public async getTreatmentWillForPatient(cpr: string): Promise<RegistrationTypeWrapper<TreatmentWillType>> {
        const url = this.btrRestUrls.getTreatmentWillForPatient(cpr);
        return await this.restClient.get<RegistrationTypeWrapper<TreatmentWillType>>(url, `Henter behandlingstestamente for cpr: ${cpr}`);
    }

    public async getTreatmentWillWithOnlyForcedTreatmentForPatient(cpr: string): Promise<RegistrationTypeWrapper<TreatmentWillType>> {
        const url = this.btrRestUrls.getTreatmentWillWithOnlyForcedTreatmentForPatient(cpr);
        return await this.restClient.get<RegistrationTypeWrapper<TreatmentWillType>>(url, `Henter behandlingstestamente (kun tvang) for cpr: ${cpr}`);
    }

    public async hasTreatmentWillForPatient(cpr: string): Promise<HasWillResponse> {
        const url = this.btrRestUrls.hasTreatmentWillForPatient(cpr);
        return await this.restClient.get<HasWillResponse>(url, `Undersøger om cpr ${cpr} har et behandlingstestamente`);
    }

    public async createTreatmentWillForPatient(cpr: string, treatmentWill: TreatmentWillType): Promise<{}> {
        const url = this.btrRestUrls.createTreatmentWillForPatient(cpr);
        return await this.restClient.post<{}>(url, treatmentWill, `Opretter behandlingstestamente for cpr: ${cpr}`);
    }

    public async upgradeToTreatmentWillForPatient(cpr: string, treatmentWill: TreatmentWillType): Promise<{}> {
        const url = this.btrRestUrls.upgradeToTreatmentWillForPatient(cpr);
        return await this.restClient.post<{}>(url, treatmentWill, `Opgraderer livstestamente til behandlingstestamente for cpr: ${cpr}`);
    }

    public async updateTreatmentWillForPatient(cpr: string, treatmentWill: TreatmentWillType): Promise<{}> {
        const url = this.btrRestUrls.updateTreatmentWillForPatient(cpr);
        return await this.restClient.put<{}>(url, treatmentWill, `Opdaterer behandlingstestamente for cpr: ${cpr}`);
    }

    public async deleteTreatmentWillForPatient(cpr: string): Promise<{}> {
        const url = this.btrRestUrls.deleteTreatmentWillForPatient(cpr);
        return await this.restClient.delete<{}>(url, null, `Sletter behandlingstestamente for cpr: ${cpr}`);
    }

    // LIVING WILL

    public async getLivingWillForPatient(cpr: string): Promise<LivingWillWrapper<LivingWillType>> {
        const url = this.ltrRestUrls.getLivingWillForPatient(cpr);
        return await this.restClient.get<LivingWillWrapper<LivingWillType>>(url, `Henter livstestamente for cpr: ${cpr}`);
    }

    public async hasLivingWillForPatient(cpr: string): Promise<HasWillResponse> {
        const url = this.ltrRestUrls.hasLivingWillForPatient(cpr);
        return await this.restClient.get<HasWillResponse>(url, `Undersøger om cpr ${cpr} har et livstestamente`);
    }

    public async createLivingWillForPatient(cpr: string, livingWill: LivingWillType): Promise<{}> {
        const url = this.ltrRestUrls.createLivingWillForPatient(cpr);
        return await this.restClient.post<{}>(url, livingWill, `Opretter livstestamente for cpr: ${cpr}`);
    }

    public async updateLivingWillForPatient(cpr: string, livingWill: LivingWillType): Promise<{}> {
        const url = this.ltrRestUrls.updateLivingWillForPatient(cpr);
        return await this.restClient.put<{}>(url, livingWill, `Opdaterer livstestamente for cpr: ${cpr}`);
    }

    public async deleteLivingWillForPatient(cpr: string): Promise<{}> {
        const url = this.ltrRestUrls.deleteLivingWillForPatient(cpr);
        return await this.restClient.delete<{}>(url, null, `Sletter livstestamente for cpr: ${cpr}`);
    }
}
