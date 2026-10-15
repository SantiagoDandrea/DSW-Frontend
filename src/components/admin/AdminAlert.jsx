// Muestra un mensaje flotante de alerta para avisar al usuario si una operación fue exitosa o si hubo un error.
import { IconCheck, IconAlert, IconClose } from '../Icons';

export const AdminAlert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`p-3.5 border rounded-none text-xs sm:text-sm font-sans flex items-center justify-between transition duration-150 shadow-xs ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
          : 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <IconAlert className="w-4 h-4 text-rose-600 shrink-0" />
        )}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-900 p-1 rounded-none transition cursor-pointer ml-3 shrink-0"
          aria-label="Cerrar notificación"
        >
          <IconClose className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
