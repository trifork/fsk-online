import FSKConfig from "../main/FSKConfig";

export default class ODRRestUrls {
    private url: string;
    public static deps = () => ["FSKConfig"];

    public constructor(private fskConfig: FSKConfig) {
        this.url = fskConfig.FSKUrlBase;
    }

    public getOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/getOrganDonorRegistration?cpr=${cpr}`;
    }

    public hasOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/hasOrganDonorRegistration?cpr=${cpr}`;
    }

    public createOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/createOrganDonorRegistration?cpr=${cpr}`;
    }

    public updateOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/updateOrganDonorRegistration?cpr=${cpr}`;
    }

    public deleteOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/deleteOrganDonorRegistration?cpr=${cpr}`;
    }
}