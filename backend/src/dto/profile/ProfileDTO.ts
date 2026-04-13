export interface UpdateProfileDTO {
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export interface ChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}