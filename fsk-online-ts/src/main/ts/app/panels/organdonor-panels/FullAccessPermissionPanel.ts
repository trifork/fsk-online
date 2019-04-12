import {Widget} from "fmko-typescript-common";
import {Checkbox} from "fmko-ts-widgets";
import SDSButton from "../../elements/SDSButton";

export default class FullAccessPermissionPanel extends Widget {

    public static deps = () => [];

    private requiresRelativeAcceptanceCheckBox: Checkbox;
    private updateButton: SDSButton;

    public constructor() {
        super();
        this.element = document.createElement(`div`);
        this.element.className = `card full-access-panel`;
        this.requiresRelativeAcceptanceCheckBox = new Checkbox(false, `Forudsætter accept fra patientens pårørende`);
        this.requiresRelativeAcceptanceCheckBox.getCssStyle().fontSize = `14px`;
        this.requiresRelativeAcceptanceCheckBox.addValueChangeHandler(() => {
            if(this.updateButton){
                this.updateButton.setEnabled(true);
            }
        });
        this.add(this.requiresRelativeAcceptanceCheckBox);
    }

    public getRequiresRelativeAcceptance(): boolean {
        return this.requiresRelativeAcceptanceCheckBox.getValue();
    }

    public setUpdateButton(updateButton: SDSButton){
        this.updateButton = updateButton;
    }

    public setEnabled() {
        this.requiresRelativeAcceptanceCheckBox.setEnabled(true);
    }

    public setRequiresRelativeAcceptance(value: boolean, isFSKSupporter: boolean) {
        this.requiresRelativeAcceptanceCheckBox.setValue(value);
        if (isFSKSupporter) {
            this.requiresRelativeAcceptanceCheckBox.setEnabled(value);
            this.requiresRelativeAcceptanceCheckBox.getInput().onclick = ( () => false);
        }
    }
}