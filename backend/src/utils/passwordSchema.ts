import { z } from 'zod';

export const strongPasswordSchema = z.string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .refine(val => /[A-Z]/.test(val), 'A senha deve conter pelo menos uma letra maiúscula.')
  .refine(val => /[0-9]/.test(val), 'A senha deve conter pelo menos um número.')
  .refine(val => /[^A-Za-z0-9]/.test(val), 'A senha deve conter pelo menos um caractere especial.');

export function validarSenhaForte(senha: string): string | null {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/[A-Z]/.test(senha)) return 'A senha deve conter pelo menos uma letra maiúscula.';
  if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos um número.';
  if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha deve conter pelo menos um caractere especial.';
  return null;
}
