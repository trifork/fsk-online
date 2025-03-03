import {ModuleContext} from "fmko-ts-common";
import FSKUserUtil from "../../util/FSKUserUtil";
import {ButtonStyle, StyledButton} from "fmko-ts-widgets";
import {Component, Dependency, Render, WidgetElement} from "fmko-ts-mvc";

@Component({
    template: require("./buttonPanel.html")
})
export default class ButtonPanel implements Render {
    element?: HTMLDivElement;

    @WidgetElement public createButton: StyledButton;
    @WidgetElement public updateButton: StyledButton;
    @WidgetElement public deleteButton: StyledButton;
    @WidgetElement public printButton: StyledButton;

    private readonly isAdminUser = FSKUserUtil.isFSKAdmin(this.moduleContext.getUserContext());

    constructor(
        @Dependency("ModuleContext") private moduleContext: ModuleContext
    ) {
    }

    public render(): void | Promise<never> {
        this.createButton = new StyledButton({
            text: "Opret registrering",
            style: ButtonStyle.SECONDARY
        });
        this.updateButton = new StyledButton({
            text: "Opdater registrering",
            style: ButtonStyle.SECONDARY
        });
        this.deleteButton = new StyledButton({
            text: "Slet registrering",
            style: ButtonStyle.DEFAULT
        });
        this.printButton = new StyledButton({
            text: "Print",
            style: ButtonStyle.SECONDARY
        });

        this.hideButtons();
        this.printButton.setVisible(false);
        this.printButton.setEnabled(false);
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
        this.createButton.setVisible(this.isAdminUser && createButtonCondition);
        this.updateButton.setVisible(false);
        this.deleteButton.setVisible(false);
    }

    public setEditMode(updateButtonCondition = true, deleteButtonCondition = true): void {
        this.createButton.setVisible(false);
        this.updateButton.setVisible(this.isAdminUser && updateButtonCondition);
        this.updateButton.setEnabled(false);
        this.deleteButton.setVisible(this.isAdminUser && deleteButtonCondition);
    }

    public enablePrintButton() {
        this.printButton.setEnabled(true);
        this.printButton.setVisible(true);
    }

    public addHandlerForCreateButton(event: (e: MouseEvent) => void): void {
        this.createButton.addClickHandler(event);
    }

    public addHandlerForEditButton(event: (e: MouseEvent) => void): void {
        this.updateButton.addClickHandler(event);
    }

    public addHandlerForDeleteButton(event: (e: MouseEvent) => void): void {
        this.deleteButton.addClickHandler(event);
    }

    public addHandlerForPrintButton(event: (e: MouseEvent) => void): void {
        this.printButton.addClickHandler(event);
    }
}
