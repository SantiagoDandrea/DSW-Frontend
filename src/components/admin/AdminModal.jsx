// Ventana modal reutilizable para mostrar formularios y detalles en el panel de administración.
import { useEffect, useId, useRef } from 'react';
import { IconClose } from '../Icons';

export const AdminModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) => {
  const tituloId = useId();
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={`bg-white rounded-none shadow-xl w-full ${maxWidth} my-8 border border-slate-200 overflow-hidden focus:outline-none`}
      >
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 id={tituloId} className="text-base font-display font-black uppercase text-white tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-xs font-sans text-slate-300 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-none transition cursor-pointer"
            aria-label="Cerrar"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
