import FSKConfig from "../main/FSKConfig";

export default class BTRRestUrls {
    private url: string;
    public static deps = () => ["FSKConfig"];

    constructor(private fskConfig: FSKConfig) {
        this.url = fskConfig.FSKUrlBase;
    }

    public getTreatmentWillForPatient(cpr: string): string {
        return `${this.url}/btr/getTreatmentWill?cpr=${cpr}`;
    }

    public getTreatmentWillWithOnlyForcedTreatmentForPatient(cpr: string): string {
        return `${this.url}/btr/getTreatmentWillWithOnlyForcedTreatment?cpr=${cpr}`;
    }

    public hasTreatmentWillForPatient(cpr: string): string {
        return `${this.url}/btr/hasTreatmentWill?cpr=${cpr}`;
    }

    public createTreatmentWillForPatient(cpr: string): string {
        return `${this.url}/btr/createTreatmentWill?cpr=${cpr}`;
    }

    public upgradeToTreatmentWillForPatient(cpr: string): string {
        return `${this.url}/btr/upgradeToTreatmentWill?cpr=${cpr}`;
    }

    public updateTreatmentWillForPatient(cpr: string): string {
        return `${this.url}/btr/updateTreatmentWill?cpr=${cpr}`;
    }

    public deleteTreatmentWillForPatient(cpr: string): string {
        return `${this.url}/btr/deleteTreatmentWill?cpr=${cpr}`;
    }
}
