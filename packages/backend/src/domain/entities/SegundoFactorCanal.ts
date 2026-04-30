export const SEGUNDO_FACTOR_CANALES = ["EMAIL", "SMS", "WHATSAPP", "VOICE", "APP"] as const;

export type SegundoFactorCanal = (typeof SEGUNDO_FACTOR_CANALES)[number];

export const SEGUNDO_FACTOR_CANALES_ENTREGA = ["EMAIL", "SMS", "WHATSAPP", "VOICE"] as const;

export type SegundoFactorCanalEntrega = (typeof SEGUNDO_FACTOR_CANALES_ENTREGA)[number];
