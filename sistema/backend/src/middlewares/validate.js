import { z } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.errors[0]?.message ?? 'Dados inválidos';
      return res.status(400).json({ error: msg });
    }
    req.body = result.data;
    next();
  };
}

export const servicoSchema = z.object({
  clienteId: z.coerce.number().int().positive(),
  matrizId: z.coerce.number().int().positive(),
  partePecaId: z.coerce.number().int().positive(),
  tipoPeca: z.enum(['aberta', 'fechada']),
  quantidade: z.coerce.number().int().positive(),
  dataServico: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const fechamentoPreviaSchema = z.object({
  clienteId: z.coerce.number().int().positive(),
  periodoInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodoFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  overrides: z.record(z.coerce.number(), z.enum(['producao', 'nao_producao'])).optional(),
  ajustesPreco: z.record(z.coerce.number(), z.coerce.number().positive()).optional(),
});
