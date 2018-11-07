import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {Checkbox, HTML} from "fmko-ts-widgets";
import SDSButton from "../../elements/SDSButton";
import {Widget} from "fmko-typescript-common";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

export default class TreatmentWillWishPanel extends TemplateWidget {

    public static deps = () => [IoC];

    //public static NO_ACCEPT = `Altid`;
    public static FAMILY_ACCEPT = `Hvis patientens nærmeste pårørende meddeler sin accept i den konkrete situation`;
    public static GUARDIAN_ACCEPT = `Hvis patientens værge meddeler sin accept i den konkrete situation`;
    public static TRUSTED_AGENT_ACCEPT = `Hvis patientens fremtidsfulmægtige meddeler sin accept i den konkrete situation`;
    private noCheckBoxClicked: boolean = false;
    private checkboxes: TreatmentWillCheckBoxes;
    private value: TreatmentWillAcceptanceType;

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
        const _pipe = (f, g) => args => f(g(args));
        const pipe = (fns: Function[]) => fns.reduce(_pipe);
        const addInRowAndCol = pipe([this.wrapInColumn, this.wrapInRow]);

        const checkboxes = this.createCheckboxes();
        checkboxes.forEach(checkbox => {
            this.appendWidgetOnVarName(addInRowAndCol(checkbox), `consent-checkboxes`);
        });
    }

    public createCheckboxes(): Checkbox[] {
        const weakMap = new WeakMap<Checkbox, TreatmentWillAcceptanceType>();
        const checkboxArray = Object.entries(this.treatmentType).map(([key, value]) => {
            const currentCheckBox = new Checkbox(false, value);
            weakMap.set(currentCheckBox, key as TreatmentWillAcceptanceType);
            return currentCheckBox;
        });

        checkboxArray.forEach(checkbox => {
            checkbox.addClickHandler(event => {
                checkboxArray.forEach(innerCheckBox => {
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
        return checkboxArray;
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
    }


    public tearDownBindings(): any {
        // Unused
    }

    private wrapInColumn(element: Widget): HTML {
        const col = new HTML();
        col.addStyleName(`col-12`);
        col.add(element);
        return col;
    }

    private wrapInRow(element: Widget): HTML {
        const row = new HTML();
        row.addStyleName(`row`);
        row.add(element);
        return row;
    }

    private treatmentType: {[K in TreatmentWillAcceptanceType]: string} = {
        guardianAcceptanceRequired: TreatmentWillWishPanel.GUARDIAN_ACCEPT,
        relativeAcceptanceRequired: TreatmentWillWishPanel.FAMILY_ACCEPT,
        trustedAgentAcceptanceRequired: TreatmentWillWishPanel.TRUSTED_AGENT_ACCEPT
    };
}

type TreatmentWillCheckBoxes = {[K in keyof TreatmentWillAcceptanceType]: Checkbox};