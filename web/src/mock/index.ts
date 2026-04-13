import { initMockUsers } from "./authmock";
import { initMockEstablishment } from "./stablishmentmock";
import { initMockMenu } from "./menumock";
import { initMockConfigStatus } from "./configStatusmock";

export function initMocks(): void {
  initMockUsers();
  initMockEstablishment();
  initMockMenu();
  initMockConfigStatus();
}
