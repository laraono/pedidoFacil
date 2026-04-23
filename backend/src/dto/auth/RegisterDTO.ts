export interface CargoDTO {
    nome: string
    permissoes: string[]
}

export interface RegisterDTO {
    nome_estabelecimento: string
    cnpj: string
    nome_usuario: string
    email: string
    senha: string
    cargos?: CargoDTO[]
}
