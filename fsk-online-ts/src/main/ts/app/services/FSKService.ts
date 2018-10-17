import FSKRestUrls from "./FSKRestUrls";
import {RESTClient, Version} from "fmko-typescript-common";
import OrganDonorRegistration = FSKTypes.OrganDonorRegistration;

export default class FSKService {
    public static deps = () => [FSKRestUrls, "Version"];

    public constructor(private restUrls: FSKRestUrls, private version: Version) {
    }

    public async getOrganDonorRegisterForPatient(cpr: string): Promise<OrganDonorRegistration> {
        const url = this.restUrls.getOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<OrganDonorRegistration>(this.version);
        return await restClient.get(url, "Henter Organdonor registeret");
    }

    public async createOrganDonorRegisterForPatient(cpr: string, organDonorRegistration: OrganDonorRegistration): Promise<void> {
        const url = this.restUrls.createOrganDonorRegisterForPatient(cpr);
        const restClient = new RESTClient<void>(this.version);
        return await restClient.post(url, organDonorRegistration, "Henter Organdonor registeret");
    }
}