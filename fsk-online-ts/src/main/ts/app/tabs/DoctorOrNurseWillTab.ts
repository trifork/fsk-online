import {ModuleContext, TabbedPanel, UserContext, ValueChangeHandler} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {ButtonStyle, DialogOption, PopupDialog, PopupDialogKind} from "fmko-ts-widgets";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKService from "../services/FSKService";
import FSKConfig from "../main/FSKConfig";
import LivingWillCache from "../services/LivingWillCache";
import FSKUserUtil from "../util/FSKUserUtil";
import TreatmentWillPanel from "../panels/treatment-will-panels/TreatmentWillPanel";
import {RegistrationState} from "../model/RegistrationState";
import LivingWillPanel from "../panels/living-will-panels/LivingWillPanel";
import LivingWillType = FSKTypes.LivingWillType;
import TreatmentWillType = FSKTypes.TreatmentWillType;

export default class DoctorOrNurseWillTab extends TemplateWidget implements TabbedPanel {
    private ID = "DoctorOrNurseWillTab_TS";
    private TITLE = "Livs/Behandlingstestamente";
    private shown: boolean;
    private initialized: boolean;
    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<TreatmentWillType>>;
    private livingWillChangeHandler: ValueChangeHandler<FSKTypes.RegistrationTypeWrapper<LivingWillType>>;
    private treatmentWillPanel: TreatmentWillPanel;


    public static deps = () => [IoC, "ModuleContext", "FSKConfig", LivingWillCache, TreatmentWillCache, FSKService, "RootElement"];

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext,
                       private fskConfig: FSKConfig,
                       private livingWillCache: LivingWillCache,
                       private treatmentWillCache: TreatmentWillCache,
                       private fskService: FSKService,
                       private rootElement: HTMLElement) {
        super(container);
        this.element = document.createElement(`div`);
    }

    public init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        super.init();
    }

    public getTemplate(): string {
        return loadTemplate("tabs/doctorOrNurseWillTab.html");
    }

    public setupBindings(): any {
        this.rootElement.appendChild(this.element);
    }

    public tearDownBindings(): void {
        // unused
    }

    public getId(): string {
        return this.ID;
    }

    public getTitle(): string {
        return this.TITLE;
    }

    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (this.moduleContext.getPatient()) {
            // Check if we the user has clicked accept on the dialog
            if (visible && this.livingWillCache.registrationState === RegistrationState.UNCHECKED) {
                if (this.initialized) {
                    this.cleanChildrenOnVarName(`will-container`);
                }
                this.showLogDialog();

            }
        }
        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            this.init();
        } else {
            this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return FSKUserUtil.isDoctorOrNurseWithoutElevatedRights(userContext);
    }

    public applicationContextIdChanged(applicationContextId: string): void {
        if (this.isApplicable(false, this.moduleContext.getUserContext())) {
            if (applicationContextId === "PATIENT") {
                this.moduleContext.showTab(this.ID);
            } else {
                this.moduleContext.hideTab(this.ID);
            }
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 205;
    }

    public async showLogDialog(): Promise<void> {
        const yesOption = <DialogOption>{
            buttonStyle: ButtonStyle.GREEN,
            text: `Videre`,
        };

        const noOption = <DialogOption>{
            buttonStyle: ButtonStyle.RED,
            text: `Fortryd`,
        };

        const yesClicked = await PopupDialog.display(
            PopupDialogKind.WARNING,
            "Bekræft",
            "<h4 style='font-size:18px'>Visning af testamente</h4><br>" +
            "Testamente bør kun fremsøges såfremt<br><br>" +
            "<ul style='list-style: inherit; padding-left:32px'>" +
            "<li>Patienten ligger for døden (dvs. er uafvendeligt døende)</li>" +
            "<li>Patienten er hjælpeløs pga. sygdom, ulykke mv., og der ikke er tegn på bedring</li>" +
            "</ul>" +
            "<br>Bemærk: Tilgang til data for testamentet vil blive logget, givet at der er data. Tilgang vil fremgå af patientens minlog.</li>",
            noOption,
            yesOption);
        if (yesClicked === yesOption) {
            this.addListeners();
        }
    }

    public renderTreatmentWill() {
        this.treatmentWillPanel = this.container.resolve<TreatmentWillPanel>(TreatmentWillPanel);

        const value = this.treatmentWillCache.treatmentWill.getValue();
        const loading = this.treatmentWillCache.treatmentWill.isLoading();
        const failed = this.treatmentWillCache.treatmentWill.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {
            this.treatmentWillPanel.setData(value);
        } else {
            this.treatmentWillPanel.setData(value);
        }
        this.appendWidgetOnVarName(this.treatmentWillPanel, `will-container`, true);
    }

    public renderLivingWill() {
        const livingPanel = this.container.resolve<LivingWillPanel>(LivingWillPanel);

        const value = this.livingWillCache.livingWill.getValue();
        const loading = this.livingWillCache.livingWill.isLoading();
        const failed = this.livingWillCache.livingWill.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {
            livingPanel.setData(value);
        } else {
            livingPanel.setData(value);
        }
        this.appendWidgetOnVarName(livingPanel, `will-container`);
    }

    private async addListeners() {
        if (await this.livingWillCache.loadHasRegistration() === RegistrationState.REGISTERED) {
            if (!this.livingWillChangeHandler) {
                this.livingWillChangeHandler = (() => {
                    if (this.isVisible()) {
                        this.renderLivingWill();
                    }
                });
                this.livingWillCache.livingWill.addValueChangeHandler(this.livingWillChangeHandler);
            } else {
                this.livingWillCache.setStale();
            }
        } else {
            if (!this.treatmentWillChangeHandler) {
                this.treatmentWillChangeHandler = (() => {
                    if (this.isVisible()) {
                        this.renderTreatmentWill();
                    }
                });
                this.treatmentWillCache.treatmentWill.addValueChangeHandler(this.treatmentWillChangeHandler);
            } else {
                this.treatmentWillCache.setStale();
            }
        }
    }

    private removeListeners() {
        if (this.treatmentWillChangeHandler) {
            this.treatmentWillCache.treatmentWill.removeValueChangeHandler(this.treatmentWillChangeHandler);
            this.treatmentWillChangeHandler = undefined;
        }
        if (this.livingWillChangeHandler) {
            this.livingWillCache.livingWill.removeValueChangeHandler(this.livingWillChangeHandler);
            this.livingWillChangeHandler = undefined;
        }
    }

}