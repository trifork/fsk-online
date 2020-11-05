import {Widget} from "fmko-ts-common";

export default class SDSButton extends Widget {
    constructor(title: string, buttonStyle?: sdsButtonType, event?: (MouseEvent) => void) {
        super();
        this.element = document.createElement(`button`);
        this.element.innerText = title;

        this.element.classList.add("sds-button");
        if (buttonStyle) {
            this.element.classList.add(buttonStyle);
        }

        if (event) {
            this.element.addEventListener(`click`, event);
        }
    }

    public setEnabled(enabled: boolean): void {
        if(enabled){
            this.element.removeAttribute(`disabled`);
        } else {
            this.element.setAttribute(`disabled`, ``);
        }

    }

    public addClickEvent(event?: (MouseEvent) => void) {
        this.element.addEventListener(`click`, event);
    }
}

export type sdsButtonType = null | "primary" | "danger" | "print";
