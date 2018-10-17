import FSKConfig from "../main/FSKConfig";

export default class FSKRestUrls {
    private url: string;
    public static deps = () => ["FSKConfig"];

    public constructor(private fskConfig: FSKConfig) {
        this.url = fskConfig.FSKUrlBase;
    }

    public getOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/getaspomsdf?cpr=${cpr}`;
    }

    public createOrganDonorRegisterForPatient(cpr: string): string {
        return `${this.url}/odr/createosdfsd?cpr=${cpr}`;
    }
}