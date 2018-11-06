import {PersonInfo} from "fmko-typescript-common";

export default class PatientUtil {
    public static getFullName(patient: PersonInfo): string {
        if (!patient) {
            return "";
        }
        const firstName = patient.getFirstName() || ``;
        //If the person has a middle name, then add it and create a space for the last name otherwise leave the space empty
        const middleName = `${patient.getMiddleName()} ` || ``;
        const lastName = patient.getLastName() || ``;

        return `${firstName} ${middleName}${lastName}`;
    }
}