export enum OrderStatus {
    AGUARDANDO_PREPARO = 'Aguardando_Preparo',
    EM_PREPARO = 'Em_Preparo',
    PRONTO = 'Pronto',
    FINALIZADO = 'Finalizado',
    CANCELADO = 'Cancelado'
}

export enum ComandaStatus {
    ABERTA = 'Aberta',
    FECHADA = 'Fechada',
    CANCELADA = 'Cancelada'
}

export enum ProductStatus {
    ATIVO ='Ativo',
    ARQUIVADO = 'Arquivado'
}

export enum CategoryStatus {
    ATIVA ='Ativa',
    ARVUIVADA = 'Arquivada'
}

export enum UserStatus {
    ATIVO ='Ativo',
    INATIVO = 'Inativo',
}

export enum SubscriptionStatus {
    PENDENTE = 'Pendente',
    PAGA = 'Paga',
    EXPIRADA = 'Expirada',
    CANCELADA = 'Cancelada'
}

export enum ReceiptStatus {
    AUTORIZADA = 'Autorizada',
    CANCELADA = 'Cancelada',
    ERRO = 'Erro'
}

export enum SubscriptionPaymentStatus {
    APROVADO = 'Aprovado',
    REJEITADO = 'Rejeitado'
}

