export interface SnackBarAction {
    text: string;
    action: (event: MouseEvent) => void;
}