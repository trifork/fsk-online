import {Widget} from "fmko-typescript-common";

export default class SDSButton extends Widget {
    constructor(title: string, buttonStyle?: sdsButtonType, event?: (MouseEvent) => void) {
        super();
        this.element = document.createElement(`button`);
        this.element.innerText = title;

        this.element.classList.add("sds-outline-button");
        if (buttonStyle) {
            this.element.classList.add(buttonStyle);
        }

        if (event) {
            this.element.addEventListener(`click`, event);
        }
    }

    public addClickEvent(event?: (MouseEvent) => void) {
        this.element.addEventListener(`click`, event);
    }
}

export type sdsButtonType = null | "primary" | "danger";