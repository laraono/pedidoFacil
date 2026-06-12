export enum DiscountType {
    VALOR ='Valor',
    PERCENTUAL = 'Percentual'
}

export enum MovimentationType {
    ENTRADA = 'Entrada',
    SAIDA = 'Saida',
    AJUSTE = 'Ajuste'
}

export enum ServiceType {
    GARCOM = 'Garcom',
    CAIXA = 'Caixa',
    AUTOATENDIMENTO = 'Autoatendimento'
}

export enum ProductVariationType {
    ADDON = 'Addon',
    SIZE = 'Tamanho'
}

export enum Permission {
    RELATORIOS = 'RELATORIOS',
    COZINHA = 'COZINHA',
    CARDAPIO = 'CARDAPIO',
    FUNCIONARIOS = 'FUNCIONARIOS',
    CONFIGURACAO = 'CONFIGURACAO',
    ASSINATURA = 'ASSINATURA',
    CRIAR_PEDIDO = 'CRIAR_PEDIDO',
    CAIXA = 'CAIXA',
    COMANDAS_FINALIZADAS = 'COMANDAS_FINALIZADAS',
    CUPONS = 'CUPONS',
    NOTA_FISCAL = 'NOTA_FISCAL',
}

export const allPermissions = Object.values(Permission);