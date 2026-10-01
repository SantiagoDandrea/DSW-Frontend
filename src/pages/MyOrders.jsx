import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkoutService } from '../services/checkoutService';

function mostrarPrecio(valor) {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

export function MyOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    checkoutService
      .getPedidos()
      .then((datos) => {
        if (!ignore) setPedidos(datos);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'No pudimos cargar tus pedidos.');
        }
      })
      .finally(() => {
        if (!ignore) setCargando(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Mis pedidos
      </h1>

      {cargando ? (
        <p role="status">Cargando pedidos...</p>
      ) : error ? (
        <div>
          <p role="alert" className="text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-indigo-600"
          >
            Reintentar
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p>Todavía no tenés pedidos.</p>

          <Link
            to="/"
            className="inline-block mt-4 text-indigo-600"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <article
              key={pedido.id}
              className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h2 className="font-bold text-gray-900">
                  Pedido #{pedido.id}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {new Date(pedido.fecha).toLocaleString('es-AR')}
                </p>

                <p className="mt-2 text-sm text-gray-700">
                  Estado: {pedido.estado.replaceAll('_', ' ')}
                </p>

                <p className="mt-2 font-semibold text-gray-900">
                  {mostrarPrecio(pedido.total)}
                </p>
              </div>

              <Link
                to={`/pedidos/${pedido.id}`}
                className="px-4 py-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Ver detalle
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}