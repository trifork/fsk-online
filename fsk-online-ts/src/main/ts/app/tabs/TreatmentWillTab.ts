import {ModuleContext, TabbedPanel, UserContext, Widget} from "fmko-typescript-common";
import {TemplateWidget} from "fmko-ts-mvc";
import loadTemplate from "../main/TemplateLoader";
import {IoC} from "fmko-ts-ioc";
import {CheckboxWrapper, ErrorDisplay} from "fmko-ts-widgets";
import TreatmentWillWishPanel from "../panels/treatment-will-testament-panels/TreatmentWillWishPanel";
import SDSButton from "../elements/SDSButton";
import ValueChangeHandler from "fmko-typescript-common/target/lib/ts/core/ValueChangeHandler";
import TreatmentWillCache from "../services/TreatmentWillCache";
import FSKService from "../services/FSKService";
import TreatmentWillType = FSKTypes.TreatmentWillType;
import TreatmentWillValueType = FSKTypes.TreatmentWillValueType;
import ErrorUtil from "../util/ErrorUtil";

export default class TreatmentWillTab extends TemplateWidget implements TabbedPanel {
    private ID = "TreatmentWillTab_TS";
    private TITLE = "Behandlingstestamente";
    private shown;
    private initialized: boolean;

    private treatmentWillChangeHandler: ValueChangeHandler<FSKTypes.TreatmentWillType>;

    private createButton: SDSButton;
    private updateButton: SDSButton;
    private deleteButton: SDSButton;

    private terminallyIllCheckbox: CheckboxWrapper;
    private illNoImprovementCheckbox: CheckboxWrapper;
    private illWithPermanentPainCheckbox: CheckboxWrapper;
    private treatmentByForceCheckbox: CheckboxWrapper;

    private terminallyIllPanel: TreatmentWillWishPanel;
    private illNoImprovementPanel: TreatmentWillWishPanel;
    private illWithPermanentPainPanel: TreatmentWillWishPanel;
    private treatmentByForcePanel: TreatmentWillWishPanel;

    public static deps = () => [IoC, "ModuleContext", TreatmentWillCache, FSKService, "RootElement"];

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext,
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
        return loadTemplate("tabs/treatmentWillTab.html");
    }

    public getValue(): TreatmentWillType {
        return <TreatmentWillType>{
            noLifeProlongingIfDying: this.getTreatmentValue(this.terminallyIllCheckbox, this.terminallyIllPanel),
            noLifeProlongingIfSeverelyDegraded: this.getTreatmentValue(this.illNoImprovementCheckbox, this.illNoImprovementPanel),
            noLifeProlongingIfSeverePain: this.getTreatmentValue(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel),
            noForcedTreatmentIfIncapable: this.getTreatmentValue(this.treatmentByForceCheckbox, this.treatmentByForcePanel)
        };
    }

    public getTreatmentValue(checkBox: CheckboxWrapper, panel: TreatmentWillWishPanel) {
        const isChecked = !!checkBox.getValue();

        return <TreatmentWillValueType>{
            acceptanceNeeded: isChecked ? this.getWishPanelValue(panel) : null,
            $: isChecked
        };
    }

    public getWishPanelValue(wishPanel: TreatmentWillWishPanel) {
        return wishPanel.getValue() === TreatmentWillWishPanel.NO_ACCEPT_PROPERTY
            ? null
            : wishPanel.getValue();
    }

    public setupBindings(): void {
        this.terminallyIllCheckbox = new CheckboxWrapper(this.getElementByVarName(`terminally-ill-checkbox`));
        this.terminallyIllPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckandPanel(this.terminallyIllCheckbox, this.terminallyIllPanel);

        this.addAndReplaceWidgetByVarName(this.terminallyIllPanel, `terminally-ill-panel`);

        this.illNoImprovementCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-no-improvement-checkbox`));
        this.illNoImprovementPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckandPanel(this.illNoImprovementCheckbox, this.illNoImprovementPanel);

        this.addAndReplaceWidgetByVarName(this.illNoImprovementPanel, `ill-no-improvement-panel`);

        this.illWithPermanentPainCheckbox = new CheckboxWrapper(this.getElementByVarName(`ill-with-permanent-pain-checkbox`));
        this.illWithPermanentPainPanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckandPanel(this.illWithPermanentPainCheckbox, this.illWithPermanentPainPanel);

        this.addAndReplaceWidgetByVarName(this.illWithPermanentPainPanel, `ill-with-permanent-pain-panel`);

        this.treatmentByForceCheckbox = new CheckboxWrapper(this.getElementByVarName(`treatment-by-force-checkbox`));
        this.treatmentByForcePanel = this.container.resolve<TreatmentWillWishPanel>(TreatmentWillWishPanel);
        this.addHandlerForCheckandPanel(this.treatmentByForceCheckbox, this.treatmentByForcePanel);

        this.addAndReplaceWidgetByVarName(this.treatmentByForcePanel, `treatment-by-force-panel`);

        this.createButton = new SDSButton("Opret registering", "primary", async () => {
            try {
                await this.fskService.createTreatmentWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.updateButton = new SDSButton("Opdatér", "primary", async () => {
            try {
                await this.fskService.updateTreatmentWillForPatient(
                    this.moduleContext.getPatient().getCpr(),
                    this.getValue());
                this.updateCache(true);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.deleteButton = new SDSButton("Slet registering", "danger", async () => {
            try {
                await this.fskService.deleteTreatmentWillForPatient(this.moduleContext.getPatient().getCpr());
                this.updateCache(false);
            } catch (error) {
                ErrorDisplay.showError("Det skete en fejl", ErrorUtil.getMessage(error));
            }
        });

        this.addAndReplaceWidgetByVarName(this.createButton, `create-button`);
        this.addAndReplaceWidgetByVarName(this.updateButton, `update-button`);
        this.addAndReplaceWidgetByVarName(this.deleteButton, `delete-button`);

        this.rootElement.appendChild(this.element);
    }

    private addHandlerForCheckandPanel(checkBox: CheckboxWrapper, panel: Widget) {
        checkBox.addValueChangeHandler(handler => {
            const value = handler.getValue();
            panel.setVisible(value);
        });
    }

    public updateCache(hasRegistration: boolean) {
        this.treatmentWillCache.hasRegistration = hasRegistration;
        this.setCreateMode(!hasRegistration);
        this.treatmentWillCache.treatmentWill.setStale();
    };

    public tearDownBindings(): void {
        // unused
    }

    public getId(): string {
        return this.ID;
    }

    public getTitle(): string {
        return this.TITLE;
    }

    setVisible(visible: boolean): any {
        super.setVisible(visible);

        if (this.shown === visible) {
            // Debounce..
            return;
        }

        if (visible) {
            this.addListeners();
            this.init();
            this.render();
        } else {
            this.removeListeners();
        }

        this.shown = visible;
    }

    public isApplicable(readOnly: boolean, userContext: UserContext): boolean {
        return true;
    }

    public applicationContextIdChanged(applicationContextId: string): any {
        if (applicationContextId === "PATIENT") {
            this.moduleContext.showTab(this.ID);
        } else {
            this.moduleContext.hideTab(this.ID);
        }
    }

    public showInitially(): boolean {
        return false;
    }

    public getLeftToRightPriority(): number {
        return 203;
    }

    public setCreateMode(isCreateMode: boolean) {
        this.createButton.setVisible(isCreateMode);
        this.updateButton.setVisible(!isCreateMode);
        this.deleteButton.setVisible(!isCreateMode);
    }

    public setData(treatmentWill: FSKTypes.TreatmentWillType): void {
        if (treatmentWill) {
            Object.entries(treatmentWill).forEach(([property, will]) => {
                switch (property) {
                    case "noLifeProlongingIfDying":
                        this.terminallyIllPanel.setValue(will.acceptanceNeeded);
                        this.terminallyIllCheckbox.setValue(will.$, true);
                        break;
                    case "noLifeProlongingIfSeverelyDegraded":
                        this.illNoImprovementPanel.setValue(will.acceptanceNeeded);
                        this.illNoImprovementCheckbox.setValue(will.$, true);
                        break;
                    case "noLifeProlongingIfSeverePain":
                        this.illWithPermanentPainPanel.setValue(will.acceptanceNeeded);
                        this.illWithPermanentPainCheckbox.setValue(will.$, true);
                        break;
                    case "noForcedTreatmentIfIncapable":
                        this.treatmentByForcePanel.setValue(will.acceptanceNeeded);
                        this.treatmentByForceCheckbox.setValue(will.$, true);
                        break;
                }
            });
        } else {
            this.terminallyIllPanel.setValue(null);
            this.terminallyIllCheckbox.setValue(null, true);
            this.illNoImprovementPanel.setValue(null);
            this.illNoImprovementCheckbox.setValue(null, true);
            this.illWithPermanentPainPanel.setValue(null);
            this.illWithPermanentPainCheckbox.setValue(null, true);
            this.treatmentByForcePanel.setValue(null);
            this.treatmentByForceCheckbox.setValue(null, true);
        }
        this.setCreateMode(!treatmentWill);
    }

    public render() {
        const value = this.treatmentWillCache.treatmentWill.getValue();
        const loading = this.treatmentWillCache.treatmentWill.isLoading();
        const failed = this.treatmentWillCache.treatmentWill.isFailed();

        if (loading) {
            if (this.initialized) {

            }
        } else if (failed) {

        } else {
            this.setData(value);
        }
    }

    private addListeners() {
        if (!this.treatmentWillChangeHandler) {
            this.treatmentWillChangeHandler = (() => {
                if (this.isVisible()) {
                    this.render();
                }
            });
            this.treatmentWillCache.treatmentWill.addValueChangeHandler(this.treatmentWillChangeHandler);
        }
    }

    private removeListeners() {
        if (this.treatmentWillChangeHandler) {
            this.treatmentWillCache.treatmentWill.removeValueChangeHandler(this.treatmentWillChangeHandler);
            this.treatmentWillChangeHandler = undefined;
        }
    }

}