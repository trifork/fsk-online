import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {Checkbox, HTML} from "fmko-ts-widgets";
import SDSButton from "../../elements/SDSButton";
import {ModuleContext, Widget} from "fmko-typescript-common";
import FSKUserUtil from "../../util/FSKUserUtil";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

export default class TreatmentWillWishPanel extends TemplateWidget {

    public static deps = () => [IoC, "ModuleContext"];

    public static FAMILY_ACCEPT = `Hvis patientens nærmeste pårørende meddeler sin accept i den konkrete situation`;
    public static GUARDIAN_ACCEPT = `Hvis patientens værge meddeler sin accept i den konkrete situation`;
    public static TRUSTED_AGENT_ACCEPT = `Hvis patientens fremtidsfulmægtige meddeler sin accept i den konkrete situation`;
    private value: TreatmentWillAcceptanceType;
    private checkboxes: Checkbox[];
    private checkboxToStringMap: WeakMap<Checkbox, TreatmentWillAcceptanceType>;
    private isAdministratorUser: boolean;

    private updateButton: SDSButton;

    public constructor(protected container: IoC,
                       private moduleContext: ModuleContext) {
        super(container);
        this.element = document.createElement(`div`);
        this.isAdministratorUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());
        this.init();
        this.setVisible(false);
    }

    public getTemplate(): string {
        return loadTemplate(`panels/treatment-will-panels/treatmentWillWishPanel.html`);
    }

    public setupBindings(): any {
        const _pipe = (f, g) => args => g(f(args));
        const pipe = (...fns: Function[]) => fns.reduce(_pipe);

        const checkboxes = this.createCheckboxes();
        checkboxes.forEach(checkbox => {
            this.appendWidgetOnVarName(pipe(this.wrapInColumn, this.wrapInRow)(checkbox), `consent-checkboxes`);
        });
    }

    public createCheckboxes(): Checkbox[] {
        this.checkboxToStringMap = new WeakMap<Checkbox, TreatmentWillAcceptanceType>();
        this.checkboxes = Object.entries(this.treatmentType).map(([key, value]) => {
            const currentCheckBox = new Checkbox(false, value);
            currentCheckBox.setEnabled(this.isAdministratorUser);
            this.checkboxToStringMap.set(currentCheckBox, key as TreatmentWillAcceptanceType);
            return currentCheckBox;
        });

        this.checkboxes.forEach(checkbox => {
            checkbox.getInput().addEventListener(`click`,event => {
                this.updateButton.setEnabled(true);
                this.checkboxes.forEach(innerCheckBox => {
                    const target = event.target as HTMLInputElement;
                    const isClicked = target === innerCheckBox.getInput();
                    if (isClicked) {
                        const thisValue = target.checked ? this.checkboxToStringMap.get(checkbox) : null;
                        this.setValue(thisValue);
                    } else {
                        innerCheckBox.setValue(false);
                    }
                });
            });
        });
        return this.checkboxes;
    }

    public getValue(): TreatmentWillAcceptanceType {
        return this.value;
    }

    public setVisible(visible: boolean): void {
        this.element.setAttribute("aria-hidden", `${!visible}`);
    }

    public setUpdateButton(updateButton: SDSButton) {
        this.updateButton = updateButton;
    }

    public setValue(value: TreatmentWillAcceptanceType) {
        this.value = value;
        if (value) {
            this.checkboxes.forEach(checkbox => {
                if (this.checkboxToStringMap.get(checkbox) === value) {
                    checkbox.setValue(true);
                }
                if (!this.isAdministratorUser) {
                    this.setReadOnly();
                    checkbox.setEnabled(checkbox.getValue());
                }
            });
        } else {
            this.checkboxes.forEach(checkbox => {
                checkbox.setValue(null);
            });
        }
    }

    public setReadOnly() {
        this.checkboxes.forEach(checkbox => {
            checkbox.getInput().onclick = () => false;
        });
    }

    public tearDownBindings(): any {
        // Unused
    }

    private wrapInRow(element: Widget): HTML {
        const row = new HTML();
        row.addStyleName(`row`);
        row.getCssStyle().marginBottom = `8px`;
        row.add(element);
        return row;
    }

    private wrapInColumn(element: Widget): HTML {
        const col = new HTML();
        col.addStyleName(`col-12`);
        col.add(element);
        return col;
    }

    private treatmentType: {[K in TreatmentWillAcceptanceType]: string} = {
        guardianAcceptanceRequired: TreatmentWillWishPanel.GUARDIAN_ACCEPT,
        relativeAcceptanceRequired: TreatmentWillWishPanel.FAMILY_ACCEPT,
        trustedAgentAcceptanceRequired: TreatmentWillWishPanel.TRUSTED_AGENT_ACCEPT
    };
}