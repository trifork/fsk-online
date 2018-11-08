import {ButtonStrategy} from "./ButtonStrategy";
import SDSButton from "../elements/SDSButton";
import UserContext from "fmko-typescript-common/target/lib/ts/module/UserContext";
import FSKUserUtil from "../util/FSKUserUtil";

export default class FSKButtonStrategy implements ButtonStrategy {

    public readonly createButton: SDSButton;
    public readonly updateButton: SDSButton;
    public readonly deleteButton: SDSButton;

    constructor(private userContext: UserContext) {
        this.createButton = new SDSButton("Opret registrering", "primary");
        this.updateButton = new SDSButton("Opdater registrering", "primary");
        this.deleteButton = new SDSButton("Slet registrering", "danger");
    }

    public hideButtons() {
        this.createButton.setVisible(false);
        this.updateButton.setVisible(false);
        this.deleteButton.setVisible(false);
    }

    public disableButtons() {
        this.createButton.setEnabled(false);
        this.updateButton.setEnabled(false);
        this.deleteButton.setEnabled(false);
    }

    public enableButtons() {
        this.createButton.setEnabled(true);
        this.updateButton.setEnabled(false);
        this.deleteButton.setEnabled(true);
    }

    public setCreateMode(createButtonCondition = true): void {
        const isFSKAdmin = FSKUserUtil.isFSKAdmin(this.userContext);
        this.createButton.setVisible(isFSKAdmin && createButtonCondition);
        this.updateButton.setVisible(false);
        this.deleteButton.setVisible(false);
    }

    public setEditMode(updateButtonCondition = true, deleteButtonCondition = true): void {
        const isFSKAdmin = FSKUserUtil.isFSKAdmin(this.userContext);
        this.createButton.setVisible(false);
        this.updateButton.setVisible(isFSKAdmin && updateButtonCondition);
        this.updateButton.setEnabled(false);
        this.deleteButton.setVisible(isFSKAdmin && deleteButtonCondition);
    }

    public addHandlerForCreateButton(event: (event: MouseEvent) => void): void {
        this.createButton.addClickHandler(event);
    }

    public addHandlerForEditButton(event: (event: MouseEvent) => void): void {
        this.updateButton.addClickHandler(event);
    }

    public addHandlerForDeleteButton(event: (event: MouseEvent) => void): void {
        this.deleteButton.addClickHandler(event);
    }

}