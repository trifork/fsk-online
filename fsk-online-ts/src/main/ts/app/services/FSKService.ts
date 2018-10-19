import {RESTClient, Version} from "fmko-typescript-common";
import ODRRestUrls from "./ODRRestUrls";
import BTRRestUrls from "./BTRRestUrls";
import LTRRestUrl from "./LTRRestUrl";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistrationType;

export default class FSKService {
    public static deps = () => [ODRRestUrls, BTRRestUrls, LTRRestUrl, "Version"];

    public constructor(private odrRestUrls: ODRRestUrls, private btrRestUrls: BTRRestUrls, private ltrRestUrls: LTRRestUrl, private version: Version) {
    }

    // ORGAN DONATION REGISTRATION

    public async getOrganDonorRegisterForPatient(cpr: string): Promise<OrganDonorRegistration> {
        const url = this.odrRestUrls.getOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<OrganDonorRegistration>(this.version);
        return await restClient.get(url, `Henter organdonor information for cpr: ${cpr}`);
    }

    public async hasOrganDonorRegisterForPatient(cpr: string): Promise<boolean> {
        const url = this.odrRestUrls.hasOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<boolean>(this.version);
        return await restClient.get(url, `Undersøger om cpr ${cpr} har en organdonor registering`);
    }

    public async createOrganDonorRegisterForPatient(cpr: string, organDonorRegistration: OrganDonorRegistration): Promise<{}> {
        const url = this.odrRestUrls.createOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.post(url, organDonorRegistration, `Opretter organdonor information for cpr: ${cpr}`);
    }

    public async updateOrganDonorRegisterForPatient(cpr: string, organDonorRegistration: OrganDonorRegistration): Promise<{}> {
        const url = this.odrRestUrls.updateOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.put(url, organDonorRegistration, `Opdaterer organdonor information for cpr: ${cpr}`);
    }

    public async deleteOrganDonorRegisterForPatient(cpr: string): Promise<{}> {
        const url = this.odrRestUrls.deleteOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.delete(url, null, `Sletter organdonor information for cpr: ${cpr}`);
    }

    // TREATMENT WILL

    public async getTreatmentWillForPatient(cpr: string): Promise<OrganDonorRegistration> {
        const url = this.btrRestUrls.getTreatmentWillForPatient(cpr);
        const restClient = new RESTClient<OrganDonorRegistration>(this.version);
        return await restClient.get(url, `Henter organdonor information for cpr: ${cpr}`);
    }

    public async hasTreatmentWillForPatient(cpr: string): Promise<boolean> {
        const url = this.btrRestUrls.hasTreatmentWillForPatient(cpr);
        const restClient = new RESTClient<boolean>(this.version);
        return await restClient.get(url, `Undersøger om cpr ${cpr} har en organdonor registering`);
    }

    public async createTreatmentWillForPatient(cpr: string): Promise<{}> {
        const url = this.btrRestUrls.createTreatmentWillForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.post(url, null, `Opretter organdonor information for cpr: ${cpr}`);
    }

    public async updateTreatmentWillForPatient(cpr: string): Promise<{}> {
        const url = this.btrRestUrls.updateTreatmentWillForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.put(url, null, `Opdaterer organdonor information for cpr: ${cpr}`);
    }

    public async deleteTreatmentWillForPatient(cpr: string): Promise<{}> {
        const url = this.btrRestUrls.deleteTreatmentWillForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.delete(url, null, `Sletter organdonor information for cpr: ${cpr}`);
    }

    // LIVING WILL

    public async getLivingWillForPatient(cpr: string): Promise<OrganDonorRegistration> {
        const url = this.ltrRestUrls.getLivingWillForPatient(cpr);
        const restClient = new RESTClient<OrganDonorRegistration>(this.version);
        return await restClient.get(url, `Henter organdonor information for cpr: ${cpr}`);
    }

    public async hasLivingWillForPatient(cpr: string): Promise<boolean> {
        const url = this.ltrRestUrls.hasLivingWillForPatient(cpr);
        const restClient = new RESTClient<boolean>(this.version);
        return await restClient.get(url, `Undersøger om cpr ${cpr} har en organdonor registering`);
    }

    public async createLivingWillForPatient(cpr: string): Promise<{}> {
        const url = this.ltrRestUrls.createLivingWillForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.post(url, null, `Opretter organdonor information for cpr: ${cpr}`);
    }

    public async updateLivingWillForPatient(cpr: string): Promise<{}> {
        const url = this.ltrRestUrls.updateLivingWillForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.put(url, null, `Opdaterer organdonor information for cpr: ${cpr}`);
    }

    public async deleteLivingWillForPatient(cpr: string): Promise<{}> {
        const url = this.ltrRestUrls.deleteLivingWillForPatient(cpr);
        const restClient = new RESTClient<{}>(this.version);
        return await restClient.delete(url, null, `Sletter organdonor information for cpr: ${cpr}`);
    }
}