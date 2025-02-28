export interface ButtonStrategy {
    hideButtons(): void;
    enableButtons(): void;
    disableButtons(): void;
    enablePrintButton(): void;
    setCreateMode(createButtonCondition?: boolean): void;
    setEditMode(updateButtonCondition?: boolean, deleteButtonCondition?: boolean): void;
}
