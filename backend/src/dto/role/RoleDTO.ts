export interface CreateRoleDTO {
    name: string;
    permissions: string[];
}

export interface UpdateRoleDTO {
    name?: string;
    permissions?: string[];
}