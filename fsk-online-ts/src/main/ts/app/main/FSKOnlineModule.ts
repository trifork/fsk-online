// Polyfill for element.remove()
import {
    AsyncResponse,
    DefaultModule,
    getVersionInfo,
    ModuleContext,
    ModuleRegistryFactory,
    PersonInfo,
    VersionImpl
} from "fmko-typescript-common";
import FSKOnlineContainer from "./FSKOnlineContainer";
import FSKConfig from "./FSKConfig";
import OrganDonorRegistrationTab from "../tabs/OrganDonorRegistrationTab";
import LivingWillTestamentTab from "../tabs/LivingWillTestamentTab";
import TreatmentWillTab from "../tabs/TreatmentWillTab";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import TreatmentWillCache from "../services/TreatmentWillCache";
import LivingWillCache from "../services/LivingWillCache";

if (!("remove" in Element.prototype)) {
    Element.prototype[`remove`] = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

export default class FSKOnlineModule extends DefaultModule {

    public static SYSTEM_NAME = "FSK";
    public static FSK_ONLINE_CTX_ID = "FSK_ONLINE";
    private static MODULE_IDENTIFIER = "fsk";

    private organDonorCache: FSKOrganDonorCache;
    private treatmentWillCache: TreatmentWillCache;
    private livingWillCache: LivingWillCache;

    public constructor(private container: FSKOnlineContainer) {
        super(FSKOnlineModule.MODULE_IDENTIFIER);
    }


    public register(): void {
        ModuleRegistryFactory.getInstance().setupModuleContext(FSKOnlineModule.MODULE_IDENTIFIER, this);

        // Setup remote exception logging if enabled
        const configuration = this.container.resolve("FSKConfig") as FSKConfig;
        /*        if (configuration.RemoteExceptionLoggingEnabled) {
                    const remoteLogService = this.container.resolve(RemoteLogService) as RemoteLogService;
                    remoteLogService.setupErrorHandler(false);
                }
        */
        this.organDonorCache = <FSKOrganDonorCache>this.container.resolve(FSKOrganDonorCache);
        this.treatmentWillCache = <TreatmentWillCache>this.container.resolve(TreatmentWillCache);
        this.livingWillCache = <LivingWillCache>this.container.resolve(LivingWillCache);
        this.initAfterModuleRegistered();
        ModuleRegistryFactory.getInstance().moduleInitializationCompleted(FSKOnlineModule.MODULE_IDENTIFIER);
    }

    public initAfterModuleRegistered() {
        const organDonorRegister = <OrganDonorRegistrationTab>this.container.resolve(OrganDonorRegistrationTab);
        this.addTabbedPanel(organDonorRegister);
        const livingWillTestament = <LivingWillTestamentTab>this.container.resolve(LivingWillTestamentTab);
        this.addTabbedPanel(livingWillTestament);
        const treatmentWillTestamentTab = <TreatmentWillTab>this.container.resolve(TreatmentWillTab);
        this.addTabbedPanel(treatmentWillTestamentTab);
//       this.loadLocalStylesheet("fsk-online/css/pikaday.css");
        this.loadLocalStylesheet("/fsk-online-ts/css/fsk-online.css");
    }

    public setModuleContext(moduleContext: ModuleContext) {
        super.setModuleContext(moduleContext);
//        this.initAfterModuleRegistered();
    }

    public applicationContextIdChanged(applicationContextId: String) {
        //
    }

    public getVersionInfo(): string {
        const version = new VersionImpl(SCM_VERSION, SCM_BRANCH, BUILD_TIME, POM_VERSION);
        return getVersionInfo(version);
    }

    public setPatient(patient: PersonInfo, asyncResponse: AsyncResponse): boolean {
        const result = super.setPatient(patient, asyncResponse);
        if (patient) {
            this.organDonorCache.organDonorRegister.setStale();
            this.livingWillCache.livingWill.setStale();
            this.treatmentWillCache.treatmentWill.setStale();

        } else if (!patient) {
            this.organDonorCache.clear(true);
            this.livingWillCache.clear(true);
            this.treatmentWillCache.clear(true);
        }
        return result;
    }

    private loadLocalStylesheet(cssFile: string) {
        const fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", cssFile);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}
