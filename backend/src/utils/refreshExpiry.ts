export function calcRefreshMaxAgeMs(): number {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([dhm]?)$/);
  const value = match ? parseInt(match[1]) : 7;
  const unit = match?.[2] || 'd';
  if (unit === 'h') return value * 60 * 60 * 1000;
  if (unit === 'm') return value * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
}
