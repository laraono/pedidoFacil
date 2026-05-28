import { initMockEstablishment } from './stablishmentmock';
import { initMockMenu } from './menumock';
import { initMockConfigStatus } from './configStatusmock';

export function initMocks(): void {
  initMockEstablishment();
  initMockMenu();
  initMockConfigStatus();
}
