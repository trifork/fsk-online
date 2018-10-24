import FSKConfig from "../main/FSKConfig";

export default class TimelineUtil {

    public static useTreatmentWill(fskConfig: FSKConfig): boolean {
        if (!fskConfig.TreatmentWillStartDate) {
            return false;
        }
        const treatmentWillStartDate = new Date(fskConfig.TreatmentWillStartDate);

        if (isNaN(treatmentWillStartDate.valueOf())) {
            return false;
        }

        return new Date().valueOf() > treatmentWillStartDate.valueOf();
    }
}