const USERS_KEY = "users";
const USER_KEY = "user";
const TOKEN_KEY = "userToken";

export function initMockUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([
        {
          id: 1,
          name: "Admin",
          email: "admin@email.com",
          password: "123456",
          role: "ADMIN"
        }
      ])
    );
  }
}

export function loginMock(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) throw new Error("Credenciais inválidas");

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, "mock-token");

  return user;
}

export function getSessionMock() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

export function logoutMock() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
