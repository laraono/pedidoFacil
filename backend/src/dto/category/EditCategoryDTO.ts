export type EditCategory = {
    name: string,
    establishmentId: number,
    ativo: boolean
    image?: Buffer
}

export type EditCategoryParams = {
    name: string,
    ativo: boolean,
    image: string
}