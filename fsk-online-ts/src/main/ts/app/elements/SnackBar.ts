import {SnackBarOptions} from "./SnackBarOptions";
import {SnackBarAction} from "./SnackBarAction";

export default class SnackBar {
    public static show(text: string, options?: SnackBarOptions) {
        const {delay, action} = options || <SnackBarOptions>{};

        const mainDiv = document.createElement(`div`);
        mainDiv.classList.add(`snack-bar`);

        const snackbarSpan = document.createElement(`span`);
        snackbarSpan.classList.add(`snack-bar-span`);

        snackbarSpan.innerText = text;

        mainDiv.appendChild(snackbarSpan);

        let bodyEvent;

        if (action) {
            const actionElement = SnackBar.getActionElement(action);
            mainDiv.appendChild(actionElement);
        } else {
            bodyEvent = event => {
                if (event.target === mainDiv || event.target.parentElement === mainDiv) {
                    SnackBar.removeSnackBar(mainDiv, event);
                }
            };
        }

        document.body.appendChild(mainDiv);
        if (bodyEvent) {
            document.body.addEventListener(`click`, bodyEvent, true);
        }

        // Ensures the element has been loaded
        window.getComputedStyle(mainDiv).opacity;

        mainDiv.classList.add(`visible`);

        window.setTimeout(() => {
            SnackBar.removeSnackBar(mainDiv, bodyEvent);
        }, delay || 6000);
    }

    private static removeSnackBar(mainDiv: HTMLElement, event: (event) => void) {
        if (mainDiv) {
            mainDiv.classList.remove(`visible`);
            window.setTimeout(() => {
                if (mainDiv.parentElement === document.body) {
                    document.body.removeChild(mainDiv);
                    if (event) {
                        document.body.removeEventListener(`click`, event, true);
                    }
                }
            }, 500);

        }
    }

    private static getActionElement(snackBarAction: SnackBarAction): HTMLButtonElement {
        const snackBarActionButton = document.createElement(`button`);
        snackBarActionButton.classList.add(`snackbar-action`);
        snackBarActionButton.innerText = snackBarAction.text;
        snackBarActionButton.addEventListener(`click`, snackBarAction.action);
        return snackBarActionButton;
    }
}