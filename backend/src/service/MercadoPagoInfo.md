
# Criar Loja

## Obrigatório 
- **userId** 

    Identificador da conta do Mercado Pago que recebe o dinheiro pelas vendas realizadas na loja. Durante o desenvolvimento, utilize o user_id da conta de teste

- **location**

    É importante preencher tudo corretamente, especialmente latitude e longitude, usando o formato decimal simples e os dados reais do local

- **name**

curl -X POST \\\
    'https://api.mercadopago.com/users/USER_ID/stores'\\\
    -H 'Content-Type: application/json' \\\
       -H 'Authorization: Bearer ACCESS_TOKEN' \\\
    -d '{\
    "name": "Loja Instore",\
    "business_hours": {\
        "monday": [\
            {\
                "open": "08:00",\
                "close": "12:00"\
            }\
        ],
        "tuesday": [\
            {\
                "open": "09:00",\
                "close": "18:00"\
            }   \
        ]\
    },\
    "external_id": "LOJ001",\
    "location": {\
        "street_number": "0123",\
        "street_name": "Nome da Rua de Exemplo.",\
        "city_name": "Nome da cidade.",\
        "state_name": "Nome do estado.",\
        "latitude": 27.175193925922862,\
        "longitude": 78.04213533235064,\
        "reference": "Próximo ao Mercado Pago"\
    }\
}'\

## Resposta

{\
    "id": 1234567,\
    "name": "Loja Instore",\
    "date_created": "2019-08-08T19:29:45.019Z",\
    "business_hours": {\
        "monday": [\
        {\
            "open": "08:00",\
            "close": "12:00"\
        }\
        ],\
        "tuesday": [\
            {\
                "open": "09:00",\
                "close": "18:00"\
            }\
        ]\
    },\
    "location": {
        "address_line": "Nome da Rua de Exemplo, 0123, Nome da cidade, Nome do estado.",\
        "latitude": 27.175193925922862,\
        "longitude": 78.04213533235064,\
        "reference": "Próximo ao Mercado Pago"\
    },\
    "external_id": "LOJ001"\
}\

# Criar Caixa

## Obrigatório 

- **name**

- **external_id**

    Identificador externo do caixa, definido para o sistema integrador. Deve ser um valor único para cada caixa e tem um limite de 40 caracteres.

- **store_id**

    Identificador da loja à qual pertence o caixa, atribuído a essa loja pelo Mercado Pago. É retornado na resposta à criação da loja sob o parâmetro id.

- **category**

    Código MCC que indica o ramo ao qual pertence o ponto de venda. Você pode consultar a lista completa de opções em nossa Referência de API.

curl -X POST \\\
    'https://api.mercadopago.com/pos'\\\
    -H 'Content-Type: application/json' \\\
       -H 'Authorization: Bearer ACCESS_TOKEN' \\\
    -d '{\
        "name": "Primeiro POS",\
        "store_id": "12354567",\
        "external_store_id": "LOJ001",\
        "external_id": "LOJ001POS001",\
        "category": 621102\
    }'\

## Resposta 
{\
    "id": 2711382,\
    "qr": {\
        "image": "https://www.mercadopago.com/instore/merchant/qr/2711382/0977011a027c4b4387e52069da4264deae2946af4dcc44ee98a8f1dbb376c8a1.png",\
        "template_document": "https://www.mercadopago.com/instore/merchant/qr/2711382/template_0977011a027c4b4387e52069da4264deae2946af4dcc44ee98a8f1dbb376c8a1.pdf",\
        "template_image": "https://www.mercadopago.com/instore/merchant/qr/2711382/template_0977011a027c4b4387e52069da4264deae2946af4dcc44ee98a8f1dbb376c8a1.png"\
    },\
    "status": "active",\
    "date_created": "2019-08-22T14:11:12.000Z",\
    "date_last_updated": "2019-08-25T15:16:12.000Z",\
    "uuid": "0977011a027c4b4387e52069da4264deae2946af4dcc44ee98a8f1dbb376c8a1",\
    "user_id": 446566691,\
    "name": "Primeiro POS",\
    "fixed_amount": false,\
    "category": 621102,\
    "store_id": "12354567",\
    "external_store_id": "LOJ001",\
    "external_id": "LOJ001POS001"\
}