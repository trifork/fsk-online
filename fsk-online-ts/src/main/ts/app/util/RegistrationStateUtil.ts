import {RegistrationState} from "../model/RegistrationState";

export default class RegistrationStateUtil {
    public static registrationStateMapper(state: boolean) {
        switch (state) {
            case true:
                return RegistrationState.REGISTERED;
            case false:
                return RegistrationState.NOT_REGISTERED;
            default:
                return RegistrationState.UNCHECKED;
        }
    }
}