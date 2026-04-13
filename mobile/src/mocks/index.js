export const CATEGORIES = [
  { id: 1, name: "Lanches", image: require("../../assets/food.jpg") },
  { id: 2, name: "Bebidas", image: require("../../assets/food.jpg") },
  { id: 3, name: "Sobremesas", image: require("../../assets/food.jpg") },
];

export const PRODUCTS = [
  {
    id: 1,
    name: "X-Bacon Defumado",
    description: "Hambúrguer artesanal 160g, muito bacon crocante, queijo cheddar derretido e maionese da casa.",
    image: require("../../assets/hamburguer.png"),
    categoryId: 1,
    sizes: [
      { name: "Simples (1 Carne)", price: 28.0 },
      { name: "Duplo (2 Carnes)", price: 36.0 },
      { name: "Monstro (3 Carnes)", price: 45.0 },
    ],
  },
  {
    id: 2,
    name: "Smash Burguer",
    description: "Pão brioche, blend de 90g prensado na chapa, queijo prato e molho especial.",
    image: require("../../assets/hamburguer.png"),
    categoryId: 1,
    sizes: [{ name: "Padrão", price: 19.9 }],
  },
  {
    id: 3,
    name: "X-Salada Tradicional",
    description: "Hambúrguer 160g, alface americana, tomate fresco, queijo prato e maionese verde.",
    image: require("../../assets/hamburguer.png"),
    categoryId: 1,
    sizes: [
      { name: "Simples", price: 24.0 },
      { name: "Duplo", price: 32.0 },
    ],
  },
  {
    id: 4,
    name: "Batata Frita Rústica",
    description: "Porção de batatas selecionadas, cortadas à mão e fritas com casca. Acompanha molho.",
    image: require("../../assets/food.jpg"),
    categoryId: 1,
    sizes: [
      { name: "Individual", price: 12.0 },
      { name: "Para Dividir", price: 22.0 },
    ],
  },
  {
    id: 5,
    name: "Onion Rings",
    description: "Anéis de cebola empanados e super crocantes.",
    image: require("../../assets/food.jpg"),
    categoryId: 1,
    sizes: [{ name: "Porção Única", price: 18.5 }],
  },
  {
    id: 6,
    name: "Refrigerante Cola",
    description: "Bebida gelada e refrescante.",
    image: require("../../assets/food.jpg"),
    categoryId: 2,
    sizes: [
      { name: "Lata 350ml", price: 6.0 },
      { name: "Garrafa 600ml", price: 9.0 },
      { name: "Garrafa 2L", price: 14.0 },
    ],
  },
  {
    id: 7,
    name: "Refrigerante Guaraná",
    description: "O sabor original do Brasil, servido trincando.",
    image: require("../../assets/food.jpg"),
    categoryId: 2,
    sizes: [
      { name: "Lata 350ml", price: 6.0 },
      { name: "Garrafa 600ml", price: 9.0 },
    ],
  },
  {
    id: 8,
    name: "Suco Natural de Laranja",
    description: "Suco espremido na hora, sem adição de açúcar.",
    image: require("../../assets/food.jpg"),
    categoryId: 2,
    sizes: [
      { name: "Copo 300ml", price: 8.0 },
      { name: "Copo 500ml", price: 12.0 },
    ],
  },
  {
    id: 9,
    name: "Água Mineral",
    description: "Água mineral natural, com ou sem gás.",
    image: require("../../assets/food.jpg"),
    categoryId: 2,
    sizes: [
      { name: "Sem Gás 500ml", price: 4.0 },
      { name: "Com Gás 500ml", price: 4.5 },
    ],
  },
  {
    id: 10,
    name: "Brownie com Sorvete",
    description: "Brownie de chocolate quente com uma bola de sorvete de creme e calda de chocolate.",
    image: require("../../assets/food.jpg"),
    categoryId: 3,
    sizes: [{ name: "Padrão", price: 18.9 }],
  },
  {
    id: 11,
    name: "Milkshake de Morango",
    description: "Sorvete batido com morangos frescos e chantilly.",
    image: require("../../assets/food.jpg"),
    categoryId: 3,
    sizes: [
      { name: "Pequeno 300ml", price: 15.0 },
      { name: "Grande 500ml", price: 20.0 },
    ],
  },
  {
    id: 12,
    name: "Pudim de Leite",
    description: "O clássico pudim de leite condensado com calda de caramelo perfeita.",
    image: require("../../assets/food.jpg"),
    categoryId: 3,
    sizes: [{ name: "Fatia", price: 12.0 }],
  },
];

export const COUPONS = [
  { code: "BORA10", type: "percentage", value: 10 },
  { code: "DESCONTO5", type: "fixed", value: 5.0 },
];

export const PAYMENT_METHODS = [
  { id: "credito", label: "Crédito", icon: "credit-card", color: "#E85D5D" },
  { id: "debito", label: "Débito", icon: "credit-card-outline", color: "#4A90E2" },
  { id: "pix", label: "Pix", icon: "qrcode", color: "#48B8A6" },
  { id: "dinheiro", label: "Dinheiro", icon: "cash", color: "#4CAF50" },
  { id: "misto", label: "Misto", icon: "swap-horizontal", color: "#829356" },
];