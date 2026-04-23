const CONFIG_STATUS_KEY = 'configStatus';

export function initMockConfigStatus() {
  if (!localStorage.getItem(CONFIG_STATUS_KEY)) {
    localStorage.setItem(
      CONFIG_STATUS_KEY,
      JSON.stringify({
        establishment: false,
        roles: false,
        menu: false
      })
    );
  }
}

export function getConfigStatusMock() {
  return JSON.parse(localStorage.getItem(CONFIG_STATUS_KEY));
}

export function saveConfigStatusMock(status) {
  localStorage.setItem(
    CONFIG_STATUS_KEY,
    JSON.stringify(status)
  );
}
