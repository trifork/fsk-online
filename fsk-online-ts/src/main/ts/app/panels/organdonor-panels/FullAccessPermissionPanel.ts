import {CheckboxWrapper} from "fmko-ts-widgets";
import SDSButton from "../../elements/SDSButton";
import {IoC} from "fmko-ts-ioc";
import {TemplateWidget} from "fmko-ts-mvc";

export default class FullAccessPermissionPanel extends TemplateWidget {
    private requiresRelativeAcceptanceCheckBox: CheckboxWrapper;
    private updateButton: SDSButton;

    public static deps = () => [IoC];

    constructor(protected container: IoC) {
        super(container);
        this.element = document.createElement(`div`);
        this.init();
    }

    public getTemplate(): string {
        return require(`./fullAccessPermissionPanel.html`);
    }

    public setupBindings(): any {
        this.requiresRelativeAcceptanceCheckBox = new CheckboxWrapper(this.getElementByVarName(`consent-checkbox`));
        this.requiresRelativeAcceptanceCheckBox.addValueChangeHandler(() => {
            if (this.updateButton) {
                this.updateButton.setEnabled(true);
            }
        });
    }

    public getRequiresRelativeAcceptance(): boolean {
        return this.requiresRelativeAcceptanceCheckBox.getValue();
    }

    public setUpdateButton(updateButton: SDSButton) {
        this.updateButton = updateButton;
    }

    public setEnabled() {
        this.requiresRelativeAcceptanceCheckBox.setEnabled(true);
    }

    public setRequiresRelativeAcceptance(value: boolean, isFSKSupporter: boolean) {
        this.requiresRelativeAcceptanceCheckBox.setValue(value);
        if (isFSKSupporter) {
            this.requiresRelativeAcceptanceCheckBox.setEnabled(value);
            this.requiresRelativeAcceptanceCheckBox.getInput().onclick = (() => false);
        }
    }
}
