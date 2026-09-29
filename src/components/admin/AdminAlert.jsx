/**
 * Cartel de alerta para retroalimentación al usuario (éxito o error).
 */
export const AdminAlert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`p-4 border rounded-xl text-sm flex items-center justify-between transition ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border-rose-200 text-rose-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{isSuccess ? '✓' : '⚠️'}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-lg font-bold leading-none hover:opacity-75 cursor-pointer ml-3"
          aria-label="Cerrar notificación"
        >
          &times;
        </button>
      )}
    </div>
  );
};
