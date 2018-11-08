import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {Checkbox, HTML} from "fmko-ts-widgets";
import SDSButton from "../../elements/SDSButton";
import {Widget} from "fmko-typescript-common";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

export default class TreatmentWillWishPanel extends TemplateWidget {

    public static deps = () => [IoC];

    public static FAMILY_ACCEPT = `Hvis patientens nærmeste pårørende meddeler sin accept i den konkrete situation`;
    public static GUARDIAN_ACCEPT = `Hvis patientens værge meddeler sin accept i den konkrete situation`;
    public static TRUSTED_AGENT_ACCEPT = `Hvis patientens fremtidsfulmægtige meddeler sin accept i den konkrete situation`;
    private value: TreatmentWillAcceptanceType;
    private checkboxes: Checkbox[];

    public static NO_ACCEPT_PROPERTY = `noAccept`;

    private updateButton: SDSButton;

    public constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
        this.setVisible(false);
    }

    public getTemplate(): string {
        return loadTemplate(`panels/treatment-will-panels/treatmentWillWishPanel.html`);
    }

    public setupBindings(): any {
        const _pipe = (f, g) => args => g(f(args));
        const pipe = (...fns: Function[]) => fns.reduce(_pipe);
        const addInRowAndCol = pipe(this.wrapInColumn, this.wrapInRow);

        const checkboxes = this.createCheckboxes();
        checkboxes.forEach(checkbox => {
            this.appendWidgetOnVarName(addInRowAndCol(checkbox), `consent-checkboxes`);
        });
    }

    public createCheckboxes(): Checkbox[] {
        const weakMap = new WeakMap<Checkbox, TreatmentWillAcceptanceType>();
        this.checkboxes = Object.entries(this.treatmentType).map(([key, value]) => {
            const currentCheckBox = new Checkbox(false, value);
            weakMap.set(currentCheckBox, key as TreatmentWillAcceptanceType);
            return currentCheckBox;
        });

        this.checkboxes.forEach(checkbox => {
            checkbox.addClickHandler(event => {
                this.updateButton.setEnabled(true);
                this.checkboxes.forEach(innerCheckBox => {
                    const isClicked = event.target === innerCheckBox.getInput();
                    if (isClicked) {
                        const thisValue = checkbox.getValue() ? weakMap.get(checkbox) : null;
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
    }

    public setEnabled(enabled: boolean) {
        this.checkboxes.forEach(checkbox => {
            checkbox.setEnabled(enabled);
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