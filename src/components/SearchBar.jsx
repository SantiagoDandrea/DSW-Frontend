export const SearchBar = ({ onSearch }) => {
  return (
    <div className="w-full px-4 py-3 bg-gray-50">
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="Buscar productos..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg className="absolute w-5 h-5 text-gray-400 left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
  );
};