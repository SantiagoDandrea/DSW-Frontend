// Servicio unificado: re-exporta pedidoService para mantener compatibilidad y centralizar la lógica de órdenes de compra.
import { pedidoService } from './pedidoService';

export const checkoutService = pedidoService;