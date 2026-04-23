import { initMockUsers } from "./authmock";
import { initMockEstablishment } from "./establishmentmock";
import { initMockRoles } from "./rolesmock";
import { initMockMenu } from "./menumock";
import { initMockConfigStatus } from "./configStatusmock";

export function initMocks() {
  initMockUsers();
  initMockEstablishment();
  initMockRoles();
  initMockMenu();
  initMockConfigStatus();
}
