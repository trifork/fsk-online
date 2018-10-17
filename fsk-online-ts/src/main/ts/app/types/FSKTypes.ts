namespace FSKTypes {

    export type OrganDonorPermissionType = "FULL" | "LIMITED" | "NONE" | "DONT_KNOW";

    export interface OrganDonorRegistration {
        permissionType: OrganDonorPermissionType;
        permissionForHeart?: boolean;
        permissionForLungs?: boolean;
        permissionForLiver?: boolean;
        permissionForPancreas?: boolean;
        permissionForKidneys?: boolean;
        permissionForCornea?: boolean;
        permissionForSmallIntestine?: boolean;
        permissionForSkin?: boolean;
        requiresRelativeAcceptance?: boolean;
    }
}