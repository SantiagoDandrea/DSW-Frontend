// Modal de confirmación para pedir seguridad al usuario antes de realizar acciones importantes como borrar o cancelar.
import { useEffect, useId, useRef } from 'react';
import { IconAlert, IconInfo } from '../Icons';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Eliminar',
  confirmVariant = 'danger',
  loading = false,
}) => {
  const tituloId = useId();
  const mensajeId = useId();
  const dialogoRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Se guarda la última función de cierre sin reiniciar el efecto de abajo en cada render
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Al abrir, el foco pasa al diálogo; con Escape se cierra; al cerrar el foco vuelve a donde estaba
  useEffect(() => {
    if (!isOpen) return undefined;

    const elementoPrevio = document.activeElement;
    dialogoRef.current?.focus();

    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') onCloseRef.current?.();
    };

    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      document.removeEventListener('keydown', alPresionarTecla);
      elementoPrevio?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const btnColors = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  const iconColors = {
    danger: 'bg-rose-50 text-rose-600 border border-rose-200',
    warning: 'bg-amber-50 text-amber-600 border border-amber-200',
    primary: 'bg-blue-50 text-blue-600 border border-blue-200',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        ref={dialogoRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensajeId}
        tabIndex={-1}
        className="bg-white rounded-none shadow-xl max-w-md w-full p-6 sm:p-8 border border-slate-200 focus:outline-none"
      >
        <div
          aria-hidden="true"
          className={`w-12 h-12 rounded-none ${
            iconColors[confirmVariant] || iconColors.danger
          } flex items-center justify-center mx-auto mb-4 border`}
        >
          {confirmVariant === 'danger' ? (
            <IconAlert className="w-6 h-6" />
          ) : (
            <IconInfo className="w-6 h-6" />
          )}
        </div>
        <h2 id={tituloId} className="text-lg font-display font-black uppercase tracking-tight text-slate-950 text-center mb-2">
          {title}
        </h2>
        <p id={mensajeId} className="text-xs text-slate-600 text-center mb-6 leading-relaxed font-sans">
          {message}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-sans font-medium uppercase tracking-wider text-slate-700 bg-white border border-slate-300 rounded-none hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-none shadow-xs transition disabled:opacity-50 cursor-pointer ${
              btnColors[confirmVariant] || btnColors.danger
            }`}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
