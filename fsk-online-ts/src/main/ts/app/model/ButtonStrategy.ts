import SDSButton from "../elements/SDSButton";

export interface ButtonStrategy {
    readonly createButton: SDSButton;
    readonly updateButton: SDSButton;
    readonly deleteButton: SDSButton;
    readonly printButton: SDSButton;

    hideButtons(): void;

    enableButtons(): void;

    disableButtons(): void;

    enablePrintButton(): void;

    setCreateMode(createButtonCondition?: boolean): void;

    setEditMode(updateButtonCondition?: boolean, deleteButtonCondition?: boolean): void;

    addHandlerForCreateButton(event: (event: MouseEvent) => void): void;

    addHandlerForEditButton(event: (event: MouseEvent) => void): void;

    addHandlerForDeleteButton(event: (event: MouseEvent) => void): void;

    addHandlerForPrintButton(event: (event: MouseEvent) => void): void;

}
