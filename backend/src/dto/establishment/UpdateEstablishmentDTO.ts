export interface UpdateEstablishmentDTO {
    name?: string;
    cnpj?: string;
    phone?: string;
    address?: string;
    paymentMethods?: string; 
    selfServiceEnabled?: boolean;
    selfServiceCode?: string;
    configurations?: {
        logo?: string | null;
        backgroundColor?: string;
        cardsColor?: string;
        buttonsColor?: string;
        comandaLabel?: string;
    };
}