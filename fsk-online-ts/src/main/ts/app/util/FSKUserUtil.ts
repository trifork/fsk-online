import {UserContext} from "fmko-ts-common";
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

    public static isDoctorOrNurseWithoutElevatedRights(userContext: UserContext): boolean {
        if (!userContext) {
            return false;
        }
        if(userContext.isAdministratorLogin()){
            return false;
        }
        if(userContext.isSupporterLogin()){
            return false;
        }
        const userHasEducation = education => ["læge", "sygeplejerske"].includes(education);
        return (userContext.getEducations() || []).some(userHasEducation);

        /* const userHasEducation = education => ["7170", "5166"].includes(education);
        return (userContext.getAuthorisations().map(x => x.getEducationCode()) || []).some(userHasEducation);*/
    }
}
