import { z } from 'zod';
import { safeString, safeBase64Image } from '../../utils/safeZod';

export const UpdateEstablishmentDTO = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    cnpj: safeString(14, 18).optional(),
    phone: safeString(10, 15).optional(),
    address: safeString(5, 255).optional(),
    paymentMethods: z.any().optional(),
    selfServiceEnabled: z.boolean().optional(),
    selfServiceCode: safeString(0, 20).optional(),
    configurations: z.object({
      logo: safeBase64Image(2).nullable().optional(), 
      backgroundColor: safeString(4, 7).optional(),
      cardsColor: safeString(4, 7).optional(),
      textsColor: safeString(4, 7).optional(),
      buttonsColor: safeString(4, 7).optional(),
      buttonsTextColor: safeString(4, 7).optional(),
      activeCateogryColor: safeString(4, 7).optional(),
      fontFamily: safeString(1, 50).optional(),
      comandaLabel: safeString(1, 30).optional(),
      allowObservations: z.boolean().optional()
    }).strict().optional()
  }).strict()
});