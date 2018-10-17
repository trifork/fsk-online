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
import TreatmentWillWishPanel from "../panels/treatment-will-testament-panels/TreatmentWillWishPanel";
import TreatmentWillTab from "../tabs/TreatmentWillTab";

if (!("remove" in Element.prototype)) {
    Element.prototype[`remove`] = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

export default class FSKOnlineModule extends DefaultModule {
    public static FSK_ONLINE_CTX_ID = "FSK_ONLINE";
    private static MODULE_IDENTIFIER = "fsk";

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
        this.loadLocalStylesheet("fsk-online-ts/css/fsk-online.css");
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
        // this.dummyTab.setPatient(patient);
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
