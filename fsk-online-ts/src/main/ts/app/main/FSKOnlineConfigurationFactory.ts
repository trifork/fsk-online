import {ModuleContext} from "fmko-ts-common";
import FSKConfig from "./FSKConfig";

export default class FSKOnlineConfigurationFactory {
    public static createInstance(moduleContext: ModuleContext): FSKConfig {

        const DEFAULTS: FSKConfig = {
            FSKUrlBase: `/fmk/p/fsk-online/rest`,
            TreatmentWillStartDate: `2018-01-31T23:00:00.000Z`
        };

        const fskConfig = moduleContext.getModuleConfiguration();

        return Object.assign({}, DEFAULTS, fskConfig);
    }
}
