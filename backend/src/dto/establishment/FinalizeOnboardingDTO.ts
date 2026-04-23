export interface FinalizeOnboardingDTO {
    roles: Array<{
        label: string;
        permissions: string[];
    }>;
    hasTotem: boolean;
}