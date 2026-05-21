
export type CreateStoreParams = {
    name: string
    establishmentId: number
    address: string;
    city: string;
    state: string;
}

export type CreateStore = {
    name: string
    establishmentId: number
    address: string;
    city: string;
    state: string;
    latitude: string,
    longitude: string
}