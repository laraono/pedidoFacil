export interface UpdateEstablishmentDTO {
    name?: string;
    cnpj?: string;
    razaoSocial?: string;
    phone?: string;
    address?: string;
    inscricaoMunicipalPath?: string;
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