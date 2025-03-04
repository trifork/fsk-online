import {Component, Render, WidgetElement} from "fmko-ts-mvc";
import {HasValueWidget, ImageDimensions, InfoPanel, InfoPanelSeverity} from "fmko-ts-widgets";
import moment from "moment";
import {ImageSrc, setElementVisible} from "fmko-ts-common";

@Component({
    template: require("./registrationDatePanel.html")
})
export default class RegistrationDatePanel
    extends HasValueWidget<string>
    implements Render {

    @WidgetElement private registrationDate: InfoPanel;
    private formattedDate: string;

    public override setValue(newValue: string, fireEvents?: boolean) {
        this.value = newValue;
        setElementVisible(this.element, !!newValue);
    }

    public override getValue(): string {
        return this.value;
    }

    public render(): void | Promise<never> {
        this.formattedDate = moment(this.value, "YYYYMMDDHHmmss").format("DD.MM.YYYY");
        this.registrationDate = new InfoPanel({
            description: `Registreringen er bekræftet og senest ændret: ${this.formattedDate}`,
            severity: InfoPanelSeverity.INFO,
            imageOptions: {
                alt: "info sign",
                src: ImageSrc.INFO,
                imageSize: ImageDimensions.L
            }
        });
    }
}
