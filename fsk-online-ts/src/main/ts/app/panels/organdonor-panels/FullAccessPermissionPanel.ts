import {Widget} from "fmko-typescript-common";
import {IOrganDonor} from "../../model/OrganDonorRegistrationType";
import {Checkbox} from "fmko-ts-widgets";
import {Tag} from "fmko-ts-widgets";
import SDSButton from "../../elements/SDSButton";

export default class FullAccessPermissionPanel extends Widget implements IOrganDonor<FSKTypes.OrganDonorRegistrationType> {

    public static deps = () => [];

    private fullPermissionCheckBox: Checkbox;
    private updateButton: SDSButton;

    public constructor() {
        super();
        this.element = document.createElement(`div`);
        this.element.className = `card full-access-panel`;
        this.fullPermissionCheckBox = new Checkbox(false, `Forudsætter accept fra patientens pårørende`);
        this.fullPermissionCheckBox.getCssStyle().fontSize = `14px`;
        this.fullPermissionCheckBox.addValueChangeHandler(() => {
            if(this.updateButton){
                this.updateButton.setEnabled(true);
            }
        });
        const pTag = new Tag(`p`,`Detaljer for <b>fuld tilladelse</b>`);
        pTag.getCssStyle().fontSize = `16px`;
        this.add(pTag);
        this.add(this.fullPermissionCheckBox);
    }

    getValue(): FSKTypes.OrganDonorRegistrationType {
        return <FSKTypes.OrganDonorRegistrationType>{
            permissionType: this.getType(),
            requiresRelativeAcceptance: this.fullPermissionCheckBox.getValue()
        };
    }

    public setUpdateButton(updateButton: SDSButton){
        this.updateButton = updateButton;
    }

    public setEnabled(enabled: boolean) {
        this.fullPermissionCheckBox.setEnabled(enabled);
    }

    public setValue(organDonorRegistation: FSKTypes.OrganDonorRegistrationType) {
        this.fullPermissionCheckBox.setValue(!!organDonorRegistation && !!organDonorRegistation.requiresRelativeAcceptance);
    }

    public getType(): FSKTypes.OrganDonorPermissionType {
        return "FULL";
    }
}