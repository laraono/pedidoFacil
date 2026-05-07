import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const UpdateEstablishmentDTO = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    cnpj: safeString(14, 18).optional(),
    phone: safeString(10, 15).optional(),
    address: safeString(5, 255).optional(),
    
    paymentMethods: z.preprocess((val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    }, z.array(z.string()).optional()),
    
    selfServiceEnabled: z.preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }, z.boolean().optional()),
    
    selfServiceCode: safeString(0, 20).optional(),
    
    configurations: z.preprocess((val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return {}; }
      }
      return val;
    }, z.object({
      backgroundColor: safeString(4, 7).optional(),
      cardsColor: safeString(4, 7).optional(),
      textsColor: safeString(4, 7).optional(),
      buttonsColor: safeString(4, 7).optional(),
      buttonsTextColor: safeString(4, 7).optional(),
      activeCateogryColor: safeString(4, 7).optional(),
      fontFamily: safeString(1, 50).optional(),
      comandaLabel: safeString(1, 30).optional(),
      allowObservations: z.preprocess((val) => {
        if (typeof val === 'string') return val === 'true';
        return val;
      }, z.boolean().optional())
    }).optional())
  }) 
});