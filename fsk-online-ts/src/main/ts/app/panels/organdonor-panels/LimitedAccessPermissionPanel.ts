import {TemplateWidget} from "fmko-ts-mvc";
import {IoC} from "fmko-ts-ioc";
import loadTemplate from "../../main/TemplateLoader";
import {Checkbox, HTML} from "fmko-ts-widgets";

export default class LimitedAccessPermissionPanel extends TemplateWidget {

    public static deps = () => [IoC];


    public constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
    }

    public getTemplate(): string {
        return loadTemplate(`panels/organdonor-panels/limitedAccessPermissionPanel.html`);
    }

    public setupBindings(): any {
        const organCheckBoxes = [
            `Hjerte`,
            `Nyrer`,
            `Lunger`,
            `Hornhinder`,
            `Lever`,
            `Tyndtarm`,
            `Bugspytkirtel`,
            `Hud`
        ].forEach(organ => {
            const checkBox = new Checkbox(false, organ);
            this.appendWidgetOnVarName(this.wrapInRow(checkBox), `limited-access-checkboxes`);
        });


        const familyConsentCheckBox = new Checkbox(false, `Min begrænsede tilladelse forudsætter mine pårørende accept`);
        this.addAndReplaceWidgetByVarName(familyConsentCheckBox, `family-consent`);
    }

    public tearDownBindings(): any {
        // Unused
    }

    private wrapInRow(checkBox: Checkbox) {
        const row = new HTML();
        const column = new HTML();

        row.addStyleName(`row`);
        column.addStyleName(`col-12`);

        column.add(checkBox);
        row.add(column);

        return row;
    }

}