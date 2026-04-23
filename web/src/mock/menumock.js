const MENU_KEY = "menu";

export function initMockMenu() {
  if (!localStorage.getItem(MENU_KEY)) {
    localStorage.setItem(
      MENU_KEY,
      JSON.stringify([
        {
          id: 1,
          name: "Hambúrguer",
          price: "25.00",
          category: "Lanches"
        },
        {
          id: 2,
          name: "Refrigerante",
          price: "7.00",
          category: "Bebidas"
        }
      ])
    );
  }
}

export function getMenuMock() {
  return JSON.parse(localStorage.getItem(MENU_KEY)) || [];
}

export function saveMenuMock(menu) {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}
