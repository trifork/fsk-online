import {Component, Dependency, Injector, Render, WidgetElement} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import {ModuleContext, ValueChangeEvent} from "fmko-ts-common";
import FSKUserUtil from "../../util/FSKUserUtil";
import {HasValueWidget, TypedWCAGCheckbox, TypedWCAGCheckboxGroup} from "fmko-ts-widgets";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

@Component({
    template: require("./treatmentWillWishPanel.html")
})
export default class TreatmentWillWishPanel
    extends HasValueWidget<TreatmentWillAcceptanceType>
    implements Render {
    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());

    @WidgetElement private consentCheckboxGroup: TypedWCAGCheckboxGroup<TreatmentWillAcceptanceType>;

    constructor(
        @Injector private container: IoC,
        @Dependency("ModuleContext") private moduleContext: ModuleContext
    ) {
        super();
    }

    public render(): void | Promise<never> {
        const relativeAcceptanceRequiredRadioButton = new TypedWCAGCheckbox<TreatmentWillAcceptanceType>({
            checkedValue: "relativeAcceptanceRequired",
            label: "Hvis patientens nærmeste pårørende meddeler sin accept i den konkrete situation"
        });
        const guardianAcceptanceRequiredRadioButton = new TypedWCAGCheckbox<TreatmentWillAcceptanceType>({
            checkedValue: "guardianAcceptanceRequired",
            label: "Hvis patientens værge meddeler sin accept i den konkrete situation"
        });
        const trustedAgentAcceptanceRequiredRadioButton = new TypedWCAGCheckbox<TreatmentWillAcceptanceType>({
            checkedValue: "trustedAgentAcceptanceRequired",
            label: "Hvis patientens fremtidsfuldmægtige meddeler sin accept i den konkrete situation"
        });

        this.consentCheckboxGroup = new TypedWCAGCheckboxGroup({
            label: "",
            typedCheckboxes: [
                relativeAcceptanceRequiredRadioButton,
                guardianAcceptanceRequiredRadioButton,
                trustedAgentAcceptanceRequiredRadioButton
            ]
        });
        const strongElement = document.createElement("strong");
        strongElement.textContent = "Patientens ønske kun skal respekteres";
        this.consentCheckboxGroup.getLabelElement().appendChild(strongElement);

        this.consentCheckboxGroup.getGroupChildElements().forEach(checkbox => {
            checkbox.addValueChangeHandler(() => {
                this.consentCheckboxGroup.setValue([checkbox.getValue()]);
                this.updateValue();
            });
        });
    }

    public getValue(): TreatmentWillAcceptanceType | null | undefined {
        return this.value;
    }

    public setValue(value: TreatmentWillAcceptanceType | null | undefined) {
        this.consentCheckboxGroup.setValue([value]);
        if (!this.isAdminUser) {
            this.consentCheckboxGroup.getGroupChildElements().forEach(checkbox => {
                const castedCheckbox = checkbox as TypedWCAGCheckbox<TreatmentWillAcceptanceType>;
                const isChecked = castedCheckbox.isChecked();
                castedCheckbox.setEnabled(isChecked);
                checkbox.addClickHandler((event) => event.preventDefault());
            });
        }
        this.updateValue();
    }

    private updateValue() {
        const oldValue = this.value;
        const newValue =
            this.consentCheckboxGroup.getValue().length === 1
                ? this.consentCheckboxGroup.getValue()[0]
                : undefined;
        this.value = newValue;

        ValueChangeEvent.fireIfNotEqual(this, oldValue, newValue);
    }
}
