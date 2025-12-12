import {
    AsyncResponse,
    DefaultModule,
    getVersionInfo,
    isElementVisible,
    Level,
    ModuleRegistryFactory,
    PersonInfo,
    RemoteLogService,
    Version,
    VersionImpl
} from "fmko-ts-common";
import FSKOnlineContainer from "./FSKOnlineContainer";
import OrganDonorRegistrationTab from "../tabs/OrganDonorRegistrationTab";
import LivingWillTab from "../tabs/LivingWillTab";
import TreatmentWillTab from "../tabs/TreatmentWillTab";
import FSKOrganDonorCache from "../services/FSKOrganDonorCache";
import TreatmentWillCache from "../services/TreatmentWillCache";
import LivingWillCache from "../services/LivingWillCache";
import DoctorOrNurseOrDentistWillTab from "../tabs/DoctorOrNurseOrDentistWillTab";
import {RegistrationState} from "../model/RegistrationState";
import { PopupDialog } from "fmko-ts-widgets";

export default class FSKOnlineModule extends DefaultModule {

    public static SYSTEM_NAME = "FSK";
    private static MODULE_IDENTIFIER = "fsk";

    private organDonorCache: FSKOrganDonorCache;
    private treatmentWillCache: TreatmentWillCache;
    private livingWillCache: LivingWillCache;

    private organDonorRegisterTab: OrganDonorRegistrationTab;
    private livingWillTab: LivingWillTab;
    private treatmentWillTab: TreatmentWillTab;
    private doctorOrNurseOrDentistWillTab: DoctorOrNurseOrDentistWillTab;

    constructor(private container: FSKOnlineContainer) {
        super(FSKOnlineModule.MODULE_IDENTIFIER);
    }

    public override register(): void {
        ModuleRegistryFactory.getInstance().setupModuleContextByReference(this);

        const remoteLogService = this.container.resolve(RemoteLogService);

        remoteLogService.setupErrorHandler(false);

        ModuleRegistryFactory.getModuleContext().setUncaughtExceptionHandler(error => {
            PopupDialog.warning("Uventet fejl", error.message);
            remoteLogService.log(Level.ERROR, error.message, error);
            return true;
        });

        this.organDonorCache = this.container.resolve(FSKOrganDonorCache);
        this.treatmentWillCache = this.container.resolve(TreatmentWillCache);
        this.livingWillCache = this.container.resolve(LivingWillCache);

        this.initAfterModuleRegistered();
        ModuleRegistryFactory.getInstance().moduleInitializationCompletedByReference(this);
    }

    public initAfterModuleRegistered(): void {
        this.organDonorRegisterTab = this.container.resolve(OrganDonorRegistrationTab);
        this.addTabbedPanel(this.organDonorRegisterTab);
        this.livingWillTab = this.container.resolve(LivingWillTab);
        this.addTabbedPanel(this.livingWillTab);
        this.treatmentWillTab = this.container.resolve(TreatmentWillTab);
        this.addTabbedPanel(this.treatmentWillTab);
        this.doctorOrNurseOrDentistWillTab = this.container.resolve(DoctorOrNurseOrDentistWillTab);
        this.addTabbedPanel(this.doctorOrNurseOrDentistWillTab);
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
        if (isElementVisible(this.doctorOrNurseOrDentistWillTab.element)) {
            this.livingWillCache.registrationState = RegistrationState.UNCHECKED;
            this.treatmentWillCache.registrationState = RegistrationState.UNCHECKED;
            this.doctorOrNurseOrDentistWillTab.setVisible(true);
        } else {
            this.organDonorCache.setStale(true);
            this.treatmentWillCache.setStale(true);
            this.livingWillCache.setStale(true);
        }
    }
}
