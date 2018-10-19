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
        acceptanceNeeded: boolean;
        $?: TreatmentWillAcceptanceType;
    }

    export interface TreatmentWill {
        noLifeProlongingIfDying: TreatmentWillValueType;
        noLifeProlongingIfSeverelyDegraded: TreatmentWillValueType;
        noLifeProlongingIfSeverePain: TreatmentWillValueType;
        noForcedTreatmentIfIncapable: TreatmentWillValueType;
    }

    export interface LivingWill {
        noLifeProlongingIfDying: boolean;
        noLifeProlongingIfSeverelyDegraded: boolean;
    }

}