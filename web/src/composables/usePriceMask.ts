export function applyPriceMask(raw: string): string {
  let val = String(raw).replace(/[^\d,]/g, '');
  const commaIdx = val.indexOf(',');
  if (commaIdx !== -1) {
    val = val.slice(0, commaIdx + 1) + val.slice(commaIdx + 1).replace(/,/g, '');
    val = val.slice(0, commaIdx + 3);
  }
  const parts = val.split(',');
  parts[0] = parts[0].replace(/^0+(\d)/, '$1');
  return parts.join(',');
}

export function applyPercentMask(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const num = Math.min(100, parseInt(digits, 10) || 0);
  return num === 0 ? '' : String(num);
}