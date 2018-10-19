import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {RadioButton, RadioGroup} from "fmko-ts-widgets";
import TreatmentWillAcceptanceType = FSKTypes.TreatmentWillAcceptanceType;

export default class TreatmentWillWishPanel extends TemplateWidget {

    public static deps = () => [IoC];

    public static NO_ACCEPT = `Altid`;
    public static FAMILY_ACCEPT = `Hvis mine nærmeste pårørende meddeler sin accept i den konkrete situation`;
    public static GUARDIAN_ACCEPT = `Hvis min værge meddeler sin accept i den konkrete situation`;
    public static TRUSTED_AGENT_ACCEPT = `Hvis mine fremtidsfulmægtige meddeler sin accept i den konkrete situation`;

    private radioGroup: RadioGroup<TreatmentWillAcceptanceTypeAndNoAccept>;

    public static NO_ACCEPT_PROPERTY = `noAccept`;

    public constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
        this.setVisible(false);
    }

    public getTemplate(): string {
        return loadTemplate(`panels/treatment-will-testament-panels/treatmentWillWishPanel.html`);
    }

    public getValue(): TreatmentWillAcceptanceTypeAndNoAccept {
        return this.radioGroup.getValue();
    }

    public setVisible(visible: boolean): void {
        super.setVisible(visible);
        if (!visible) {
            this.element.style.display = `block`;
        }
    }

    public setValue(value: TreatmentWillAcceptanceType) {
        this.radioGroup.setValue(value);

        this.radioGroup.getRadioButtons().forEach(button => {
            if (!value && button.getValue() === TreatmentWillWishPanel.NO_ACCEPT_PROPERTY) {
                button.getInput().checked = true;
            } else {
                button.getInput().checked = button.getValue() === value;
            }
        });
    }

    public setupBindings(): any {
        const radioButtons =
            Object.entries(this.treatmentType)
                .map(([type, text], index) => new RadioButton<TreatmentWillAcceptanceTypeAndNoAccept>(type, text, index === 0));

        this.radioGroup = new RadioGroup<TreatmentWillAcceptanceTypeAndNoAccept>(radioButtons, this.idSynthesizer);
        this.addAndReplaceWidgetByVarName(this.radioGroup, `consent-radio-group`);
    }

    public tearDownBindings(): any {
        // Unused
    }

    private treatmentType: {[K in TreatmentWillAcceptanceTypeAndNoAccept]: string} = {
        noAccept: TreatmentWillWishPanel.NO_ACCEPT,
        guardianAcceptanceRequired: TreatmentWillWishPanel.GUARDIAN_ACCEPT,
        relativeAcceptanceRequired: TreatmentWillWishPanel.FAMILY_ACCEPT,
        trustedAgentAcceptanceRequired: TreatmentWillWishPanel.TRUSTED_AGENT_ACCEPT
    };
}

type TreatmentWillAcceptanceTypeAndNoAccept = FSKTypes.TreatmentWillAcceptanceType | string;