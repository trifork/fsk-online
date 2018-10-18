import FSKConfig from "../main/FSKConfig";

export default class LTRRestUrl {
    private url: string;
    public static deps = () => ["FSKConfig"];

    public constructor(private fskConfig: FSKConfig) {
        this.url = fskConfig.FSKUrlBase;
    }

    public getLivingWillForPatient(cpr: string): string {
        return `${this.url}/ltr/getLivingWill?cpr=${cpr}`;
    }

    public hasLivingWillForPatient(cpr: string): string {
        return `${this.url}/ltr/hasLivingWill?cpr=${cpr}`;
    }

    public createLivingWillForPatient(cpr: string): string {
        return `${this.url}/ltr/createLivingWill?cpr=${cpr}`;
    }

    public updateLivingWillForPatient(cpr: string): string {
        return `${this.url}/ltr/updateLivingWill?cpr=${cpr}`;
    }

    public deleteLivingWillForPatient(cpr: string): string {
        return `${this.url}/ltr/deleteLivingWill?cpr=${cpr}`;
    }
}