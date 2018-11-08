import {AsyncResponse, DefaultModule, getVersionInfo, ModuleRegistryFactory, PersonInfo, VersionImpl} from "fmko-typescript-common";
import FSKOnlineContainer from "./FSKOnlineContainer";
import FSKConfig from "./FSKConfig";
import OrganDonorRegistrationTab from "../tabs/OrganDonorRegistrationTab";
import LivingWillTestamentTab from "../tabs/LivingWillTestamentTab";
import TreatmentWillTab from "../tabs/TreatmentWillTab";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import TreatmentWillCache from "../services/TreatmentWillCache";
import LivingWillCache from "../services/LivingWillCache";
import DoctorOrNurseWillTab from "../tabs/DoctorOrNurseWillTab";
import RemoteLogService from "fmko-typescript-common/target/lib/ts/remotelog/RemoteLogService";

if (!("remove" in Element.prototype)) {
    Element.prototype[`remove`] = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

export default class FSKOnlineModule extends DefaultModule {

    public static SYSTEM_NAME = "FSK";
    private static MODULE_IDENTIFIER = "fsk";

    private organDonorCache: FSKOrganDonorCache;
    private treatmentWillCache: TreatmentWillCache;
    private livingWillCache: LivingWillCache;

    private organDonorRegisterTab: OrganDonorRegistrationTab;
    private livingWillTestamentTab: LivingWillTestamentTab;
    private treatmentWillTestamentTab: TreatmentWillTab;
    private doctorOrNurseWillTab: DoctorOrNurseWillTab;

    public constructor(private container: FSKOnlineContainer) {
        super(FSKOnlineModule.MODULE_IDENTIFIER);
    }

    public register(): void {
        ModuleRegistryFactory.getInstance().setupModuleContext(FSKOnlineModule.MODULE_IDENTIFIER, this);

        this.organDonorCache = <FSKOrganDonorCache>this.container.resolve(FSKOrganDonorCache);
        this.treatmentWillCache = <TreatmentWillCache>this.container.resolve(TreatmentWillCache);
        this.livingWillCache = <LivingWillCache>this.container.resolve(LivingWillCache);
        this.initAfterModuleRegistered();
        ModuleRegistryFactory.getInstance().moduleInitializationCompleted(FSKOnlineModule.MODULE_IDENTIFIER);
    }

    public initAfterModuleRegistered() {
        this.organDonorRegisterTab = <OrganDonorRegistrationTab>this.container.resolve(OrganDonorRegistrationTab);
        this.addTabbedPanel(this.organDonorRegisterTab);
        this.livingWillTestamentTab = <LivingWillTestamentTab>this.container.resolve(LivingWillTestamentTab);
        this.addTabbedPanel(this.livingWillTestamentTab);
        this.treatmentWillTestamentTab = <TreatmentWillTab>this.container.resolve(TreatmentWillTab);
        this.addTabbedPanel(this.treatmentWillTestamentTab);
        this.doctorOrNurseWillTab = <DoctorOrNurseWillTab>this.container.resolve(DoctorOrNurseWillTab);
        this.addTabbedPanel(this.doctorOrNurseWillTab);
        FSKOnlineModule.loadLocalStylesheet("/fsk-online-ts/css/fsk-online.css");
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

    public refreshPatient() {
        const foundVisibleTab = [
            this.organDonorRegisterTab,
            this.livingWillTestamentTab,
            this.treatmentWillTestamentTab,
            this.doctorOrNurseWillTab
        ].find(tab => tab.isVisible());
        if (foundVisibleTab) {
            foundVisibleTab.setVisible(true);
        }
    }

    private static loadLocalStylesheet(pathToCssFile: string) {
        const location = window.location;
        const origin = location.origin || `${location.protocol}//${location.hostname}:${location.port}`;

        const styleSheet = document.createElement("link");
        styleSheet.setAttribute("rel", "stylesheet");
        styleSheet.setAttribute("type", "text/css");
        styleSheet.setAttribute("href", `${origin}${pathToCssFile}`);
        document.getElementsByTagName("head")[0].appendChild(styleSheet);
    }
}
