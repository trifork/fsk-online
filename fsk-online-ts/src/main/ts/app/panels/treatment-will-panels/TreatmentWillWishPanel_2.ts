import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {ModuleContext, ValueChangeEvent} from "fmko-ts-common";
import FSKUserUtil from "../../util/FSKUserUtil";
import {HasValueWidget, WCAGRadioButton, WCAGRadioGroup} from "fmko-ts-widgets";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

@Component({
    template: require("./treatmentWillWishPanel_2.html")
})
export default class TreatmentWillWishPanel
    extends HasValueWidget<TreatmentWillAcceptanceType>
    implements Render {
    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());

    @WidgetElement private consentRadioGroup: WCAGRadioGroup<TreatmentWillAcceptanceType>;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext
    ) {
        super();
    }

    public render(): void | Promise<never> {
        const relativeAcceptanceRequiredRadioButton = new WCAGRadioButton<TreatmentWillAcceptanceType>({
            checkedValue: "relativeAcceptanceRequired",
            label: "Hvis patientens nærmeste pårørende meddeler sin accept i den konkrete situation"
        });
        const guardianAcceptanceRequiredRadioButton = new WCAGRadioButton<TreatmentWillAcceptanceType>({
            checkedValue: "guardianAcceptanceRequired",
            label: "Hvis patientens værge meddeler sin accept i den konkrete situation"
        });
        const trustedAgentAcceptanceRequiredRadioButton = new WCAGRadioButton<TreatmentWillAcceptanceType>({
            checkedValue: "trustedAgentAcceptanceRequired",
            label: "Hvis patientens fremtidsfuldmægtige meddeler sin accept i den konkrete situation"
        });

        this.consentRadioGroup = new WCAGRadioGroup({
            label: "",
            radioButtons: [
                relativeAcceptanceRequiredRadioButton,
                guardianAcceptanceRequiredRadioButton,
                trustedAgentAcceptanceRequiredRadioButton
            ]
        });
        const strongElement = document.createElement("strong");
        strongElement.textContent = "Patientens ønske skal respekteres";
        this.consentRadioGroup.element.firstChild.appendChild(strongElement);
        this.consentRadioGroup.setEnabled(this.isAdminUser);

        // Run for each radio button
        this.consentRadioGroup.getGroupChildElements().forEach(radioButton => {
            radioButton.addValueChangeHandler(() => {
                this.updateValue();
            });
        });
    }

    public getValue(): TreatmentWillAcceptanceType | null | undefined {
        return this.value;
    }

    public setValue(value: TreatmentWillAcceptanceType | null | undefined) {
        this.consentRadioGroup.setValue(value);
        if (!this.isAdminUser) {
            this.setReadOnly();
            this.consentRadioGroup.setEnabled(false);
        }
        this.updateValue();
    }

    public setReadOnly() {
        this.consentRadioGroup.getGroupChildElements().forEach(radioButton => {
            radioButton.addClickHandler(() => false);
        });
    }

    private updateValue() {
        const oldValue = this.value;
        const newValue = this.consentRadioGroup.getValue();
        this.value = newValue;

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }
}
