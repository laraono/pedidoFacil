export interface CreateEmployeeDTO {
    name: string;
    email: string;
    cpf?: string;
    password: string;
    roleId: number;
}

export interface UpdateEmployeeDTO {
    name?: string;
    email?: string;
    cpf?: string;
    password?: string;
    roleId?: number;
}