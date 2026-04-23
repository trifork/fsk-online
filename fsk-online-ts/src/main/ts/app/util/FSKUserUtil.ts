import {RoleHelper, UserContext} from "fmko-ts-common";
import FSKOnlineModule from "../main/FSKOnlineModule";

export default class FSKUserUtil {

    public static isFSKAdmin(userContext: UserContext): boolean {
        const isFSKUser = userContext.hasSupporterOrAdminRoleForSystem(FSKOnlineModule.SYSTEM_NAME);
        const isAdminLogin = RoleHelper.WebAdmin.equals(userContext.getSelectedRole());

        return isFSKUser && isAdminLogin;
    }

    public static isFSKSupporter(userContext: UserContext): boolean {
        const isFSKUser = userContext.hasSupporterOrAdminRoleForSystem(FSKOnlineModule.SYSTEM_NAME);
        const isSupporterLogin = RoleHelper.Supporter.equals(userContext.getSelectedRole());

        return isFSKUser && isSupporterLogin;

    }

    public static userHasAuthorisations(userContext: UserContext): boolean {
        if (!userContext) {
            return false;
        }

        return (userContext.getAuthorisations() || []).length > 0;
    }

    public static isDoctorOrNurseOrDentistWithoutElevatedRights(userContext: UserContext): boolean {
        return FSKUserUtil.hasEducationWithoutElevatedRights(userContext, ["læge", "sygeplejerske", "tandlæge"]);
    }

    public static isDentistWithoutElevatedRights(userContext: UserContext): boolean {
        return FSKUserUtil.hasEducationWithoutElevatedRights(userContext, ["tandlæge"]);
    }

    private static hasEducationWithoutElevatedRights(userContext: UserContext, educations: string[]) {
        if (!userContext) {
            return false;
        }
        if (RoleHelper.WebAdmin.equals(userContext.getSelectedRole())) {
            return false;
        }
        if (RoleHelper.Supporter.equals(userContext.getSelectedRole())) {
            return false;
        }
        const userHasEducation = (education: string) => educations.includes(education);
        return (userContext.getEducations() || []).some(userHasEducation);
    }
}
