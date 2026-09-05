export const Header = ({ cartCount = 0, userName = "Usuario" }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-indigo-600">
        MiTienda
      </div>

      {/* Usuario y Carrito */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">{userName}</span>
        <button className="relative p-2 text-gray-600 hover:text-indigo-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};