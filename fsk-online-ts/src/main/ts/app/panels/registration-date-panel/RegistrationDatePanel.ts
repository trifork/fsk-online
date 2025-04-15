import {Component, Render, WidgetElement} from "fmko-ts-mvc";
import {ImageDimensions, InfoPanel, InfoPanelSeverity} from "fmko-ts-widgets";
import moment from "moment";
import {ImageSrc, setElementVisible, Widget} from "fmko-ts-common";

@Component({
    template: require("./registrationDatePanel.html")
})
export default class RegistrationDatePanel
    extends Widget
    implements Render {

    @WidgetElement private registrationDate: InfoPanel;
    private date: string;
    private formattedDate: string;
    private descriptionText = "Registreringen er senest ændret: ";

    public setDatePreRender(date: string) {
        this.date = date;
        setElementVisible(this.element, !!date);
    }

    public renderODR(): void | Promise<never> {
        this.descriptionText = "Registreringen er bekræftet og senest ændret: ";
        this.render();
    }

    public render(): void | Promise<never> {
        this.formattedDate = moment(this.date, "YYYYMMDDHHmmss").format("DD.MM.YYYY");
        this.registrationDate = new InfoPanel({
            description: `${this.descriptionText}${this.formattedDate}`,
            severity: InfoPanelSeverity.INFO,
            imageOptions: {
                alt: "info sign",
                src: ImageSrc.INFO,
                imageSize: ImageDimensions.L
            }
        });
    }
}
