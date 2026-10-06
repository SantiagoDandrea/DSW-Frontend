// Funciones de utilidad para formatear valores y entradas de texto en formularios.
export function formatearCuit(valor) {
  const digitos = String(valor ?? '').replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 10) return `${digitos.slice(0, 2)}-${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
}
