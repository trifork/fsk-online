import { ModuleContext } from "fmko-typescript-common";
import FSKConfig from "./FSKConfig";

export default class FSKOnlineConfigurationFactory {
    public static createInstance(moduleContext: ModuleContext): FSKConfig {

        const DEFAULTS: FSKConfig = {
            RemoteExceptionLoggingEnabled: true,
            VaccinationsregisterStamdataUrlBase: "/fmk/ddv-sdm/rest"
        };

        return DEFAULTS;
    }
}
