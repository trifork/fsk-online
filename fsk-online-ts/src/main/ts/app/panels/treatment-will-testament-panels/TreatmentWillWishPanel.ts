import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {RadioButton, RadioGroup} from "fmko-ts-widgets";

export default class TreatmentWillWishPanel extends TemplateWidget {

    public static deps = () => [IoC];

    public static NO_ACCEPT = `Altid`;
    public static FAMILY_ACCEPT = `Hvis mine nærmeste pårørende meddeler sin accept i den konkrete situation`;
    public static GUARDIAN_ACCEPT = `Hvis min værge meddeler sin accept i den konkrete situation`;
    public static TRUSTED_AGENT_ACCEPT = `Hvis mine fremtidsfulmægtige meddeler sin accept i den konkrete situation`;

    public constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
        this.setVisible(false);
    }

    public getTemplate(): string {
        return loadTemplate(`panels/treatment-will-testament-panels/treatmentWillWishPanel.html`);
    }

    public setupBindings(): any {

        const radioButtons = [TreatmentWillWishPanel.NO_ACCEPT,
            TreatmentWillWishPanel.FAMILY_ACCEPT,
            TreatmentWillWishPanel.GUARDIAN_ACCEPT,
            TreatmentWillWishPanel.TRUSTED_AGENT_ACCEPT
        ].map((treatmentWill, index) => new RadioButton<string>(treatmentWill, treatmentWill, index === 0));

        const radioGroup = new RadioGroup<string>(radioButtons, this.idSynthesizer);
        this.addAndReplaceWidgetByVarName(radioGroup, `consent-radio-group`);
    }

    public tearDownBindings(): any {
        // Unused
    }
}