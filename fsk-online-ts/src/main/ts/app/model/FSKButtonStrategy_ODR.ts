import {ButtonStrategy_ODR} from "./ButtonStrategy_ODR";
import {UserContext} from "fmko-ts-common";
import FSKUserUtil from "../util/FSKUserUtil";
import {StyledButton} from "fmko-ts-widgets";

export default class FSKButtonStrategy_ODR implements ButtonStrategy_ODR {

    constructor(
        private userContext: UserContext,
        private createButton: StyledButton,
        private updateButton: StyledButton,
        private deleteButton: StyledButton,
        private printButton: StyledButton
    ) {}

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

    public enablePrintButton() {
        this.printButton.setEnabled(true);
        this.printButton.setVisible(true);
    }
}
