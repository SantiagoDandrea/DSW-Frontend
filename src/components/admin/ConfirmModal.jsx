// Modal de confirmación para pedir seguridad al usuario antes de realizar acciones importantes como borrar o cancelar.
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
  if (!isOpen) return null;

  const btnColors = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  };

  const iconColors = {
    danger: 'bg-rose-100 text-rose-600',
    warning: 'bg-amber-100 text-amber-600',
    primary: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
        <div
          className={`w-12 h-12 rounded-full ${
            iconColors[confirmVariant] || iconColors.danger
          } flex items-center justify-center mx-auto mb-4 text-xl`}
        >
          {confirmVariant === 'danger' ? '⚠️' : 'ℹ️'}
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer ${
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
