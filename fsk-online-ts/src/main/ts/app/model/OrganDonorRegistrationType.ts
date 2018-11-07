import OrganDonorPermissionType = FSKTypes.OrganDonorPermissionType;

export interface IOrganDonor<T> {
    getType(): OrganDonorPermissionType

    getValue(): T;

    setValue(value: T, isFSKSupporter: boolean): void;
}