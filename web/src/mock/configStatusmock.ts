const CONFIG_STATUS_KEY = 'configStatus';

export interface ConfigStatus {
  establishment: boolean;
  roles: boolean;
  menu: boolean;
}

export function initMockConfigStatus(): void {
  if (!localStorage.getItem(CONFIG_STATUS_KEY)) {
    localStorage.setItem(
      CONFIG_STATUS_KEY,
      JSON.stringify({
        establishment: false,
        roles: false,
        menu: false
      } satisfies ConfigStatus)
    );
  }
}

export function getConfigStatusMock(): ConfigStatus | null {
  return JSON.parse(localStorage.getItem(CONFIG_STATUS_KEY) ?? 'null');
}

export function saveConfigStatusMock(status: ConfigStatus): void {
  localStorage.setItem(
    CONFIG_STATUS_KEY,
    JSON.stringify(status)
  );
}
