// Ventana modal reutilizable para mostrar formularios y detalles en el panel de administración.
import { useEffect, useId, useRef } from 'react';

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} my-8 border border-gray-100 overflow-hidden focus:outline-none`}
      >
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 id={tituloId} className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-lg p-1 transition cursor-pointer text-xl font-bold leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
