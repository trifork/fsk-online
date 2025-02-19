import {AsyncResponse, DefaultModule, getVersionInfo, ModuleRegistryFactory, PersonInfo, Version, VersionImpl} from "fmko-ts-common";
import FSKOnlineContainer from "./FSKOnlineContainer";
import OrganDonorRegistrationTab from "../tabs/OrganDonorRegistrationTab";
import LivingWillTestamentTab from "../tabs/LivingWillTestamentTab";
import TreatmentWillTab from "../tabs/TreatmentWillTab";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import TreatmentWillCache from "../services/TreatmentWillCache";
import LivingWillCache from "../services/LivingWillCache";
import DoctorOrNurseOrDentistWillTab from "../tabs/DoctorOrNurseOrDentistWillTab";
import {RegistrationState} from "../model/RegistrationState";

export default class FSKOnlineModule extends DefaultModule {

    public static SYSTEM_NAME = "FSK";
    private static MODULE_IDENTIFIER = "fsk";

    private organDonorCache: FSKOrganDonorCache;
    private treatmentWillCache: TreatmentWillCache;
    private livingWillCache: LivingWillCache;

    private organDonorRegisterTab: OrganDonorRegistrationTab;
    private livingWillTestamentTab: LivingWillTestamentTab;
    private treatmentWillTestamentTab: TreatmentWillTab;
    private doctorOrNurseOrDentistWillTab: DoctorOrNurseOrDentistWillTab;

    constructor(private container: FSKOnlineContainer) {
        super(FSKOnlineModule.MODULE_IDENTIFIER);
    }

    public override register(): void {
        ModuleRegistryFactory.getInstance().setupModuleContextByReference(this);
        this.organDonorCache = this.container.resolve<FSKOrganDonorCache>(FSKOrganDonorCache);
        this.treatmentWillCache = this.container.resolve<TreatmentWillCache>(TreatmentWillCache);
        this.livingWillCache = this.container.resolve<LivingWillCache>(LivingWillCache);

        this.initAfterModuleRegistered();
        ModuleRegistryFactory.getInstance().moduleInitializationCompletedByReference(this);

    }

    public initAfterModuleRegistered(): void {
        this.organDonorRegisterTab = this.container.resolve<OrganDonorRegistrationTab>(OrganDonorRegistrationTab);
        this.addTabbedPanel(this.organDonorRegisterTab);
        this.livingWillTestamentTab = this.container.resolve<LivingWillTestamentTab>(LivingWillTestamentTab);
        this.addTabbedPanel(this.livingWillTestamentTab);
        this.treatmentWillTestamentTab = this.container.resolve<TreatmentWillTab>(TreatmentWillTab);
        this.addTabbedPanel(this.treatmentWillTestamentTab);
        this.doctorOrNurseOrDentistWillTab = this.container.resolve<DoctorOrNurseOrDentistWillTab>(DoctorOrNurseOrDentistWillTab);
        this.addTabbedPanel(this.doctorOrNurseOrDentistWillTab);
        this.loadLocalStylesheet("/fmk/u/fsk-online-ts/css/fsk-online-temporary.css");
        this.loadLocalStylesheet("/fmk/u/fsk-online-ts/css/fsk-online.css");
    }

    public override getVersion(): Version | undefined {
        return this.container.resolve<Version>("Version");
    }

    public override getVersionInfo(): string {
        const version = new VersionImpl(SCM_VERSION, SCM_BRANCH, BUILD_TIME, POM_VERSION);
        return getVersionInfo(version);
    }

    public override setPatient(patient: PersonInfo, asyncResponse: AsyncResponse): boolean {
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

    public override refreshPatient(): void {
        if (this.doctorOrNurseOrDentistWillTab.isVisible()) {
            this.livingWillCache.registrationState = RegistrationState.UNCHECKED;
            this.treatmentWillCache.registrationState = RegistrationState.UNCHECKED;
            this.doctorOrNurseOrDentistWillTab.setVisible(true);
        } else {
            this.organDonorCache.setStale(true);
            this.treatmentWillCache.setStale(true);
            this.livingWillCache.setStale(true);
        }
    }

    private loadLocalStylesheet(pathToCssFile: string): void {
        const styleSheet = document.createElement("link");
        styleSheet.setAttribute("rel", "stylesheet");
        styleSheet.setAttribute("type", "text/css");
        styleSheet.setAttribute("href", pathToCssFile);
        document.head.appendChild(styleSheet);
    }
}
