namespace FSKTypes {

    export type OrganDonorPermissionType = "FULL" | "LIMITED" | "NONE" | "DONT_KNOW";

    export interface OrganDonorRegistrationType {
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

    export type TreatmentWillAcceptanceType =
        "relativeAcceptanceRequired"
        | "guardianAcceptanceRequired"
        | "trustedAgentAcceptanceRequired" ;

    export interface TreatmentWillValueType {
        acceptanceNeeded: TreatmentWillAcceptanceType;
        $?: boolean;
    }

    export interface TreatmentWillType {
        noLifeProlongingIfDying?: TreatmentWillValueType;
        noLifeProlongingIfSeverelyDegraded?: TreatmentWillValueType;
        noLifeProlongingIfSeverePain?: TreatmentWillValueType;
        noForcedTreatmentIfIncapable?: TreatmentWillValueType;
    }

    export interface LivingWillType {
        noLifeProlongingIfDying: boolean;
        noLifeProlongingIfSeverelyDegraded: boolean;
    }

    export interface HasRegistrationResponse {
        registrationExists: boolean;
    }

    export interface HasWillResponse {
        willExists: boolean;
    }

}