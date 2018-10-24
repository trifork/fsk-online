import {ModuleContext} from "fmko-typescript-common";
import FSKConfig from "./FSKConfig";

export default class FSKOnlineConfigurationFactory {
    public static createInstance(moduleContext: ModuleContext): FSKConfig {

        const DEFAULTS: FSKConfig = {
            RemoteExceptionLoggingEnabled: true,
            FSKUrlBase: `/fmk/fsk-online/rest`,
            TreatmentWillStartDate: `2018-01-31T23:00:00.000Z`
        };
        return DEFAULTS;
    }
}
