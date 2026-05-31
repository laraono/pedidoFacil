const RULES = [
  { test: (p: string) => p.length >= 8,          msg: 'A senha deve ter pelo menos 8 caracteres.' },
  { test: (p: string) => /[A-Z]/.test(p),         msg: 'A senha deve conter pelo menos uma letra maiúscula.' },
  { test: (p: string) => /[0-9]/.test(p),         msg: 'A senha deve conter pelo menos um número.' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), msg: 'A senha deve conter pelo menos um caractere especial.' },
];

export function validatePasswordStrength(password: string): string | null {
  for (const rule of RULES) {
    if (!rule.test(password)) return rule.msg;
  }
  return null;
}

export function isPasswordStrong(password: string): boolean {
  return RULES.every(r => r.test(password));
}
