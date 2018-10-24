import {UserContext} from "fmko-typescript-common";
import FSKOnlineModule from "../main/FSKOnlineModule";

export default class FSKUserUtil {

    public static isFSKAdmin(userContext: UserContext): boolean {
        const isFSKUser = userContext.hasSupporterOrAdminRoleForSystem(FSKOnlineModule.SYSTEM_NAME);
        return isFSKUser && userContext.isAdministratorLogin();
    }

    public static isFSKSupporter(userContext: UserContext): boolean {
        const isFSKUser = userContext.hasSupporterOrAdminRoleForSystem(FSKOnlineModule.SYSTEM_NAME);
        return isFSKUser && userContext.isSupporterLogin();
    }

    public static userHasAuthorisations(userContext: UserContext): boolean {
        if (!userContext) {
            return false;
        }

        return (userContext.getAuthorisations() || []).length > 0;
    }
}