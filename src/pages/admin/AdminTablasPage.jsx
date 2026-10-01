import { useState, useMemo } from 'react';
import { SimpleCrudTable } from '../../components/admin/SimpleCrudTable';
import { categoriaService } from '../../services/categoriaService';
import { marcaService } from '../../services/marcaService';
import { medioPagoService } from '../../services/medioPagoService';
import { localidadService } from '../../services/localidadService';
import { almacenService } from '../../services/almacenService';
import { proveedorService } from '../../services/proveedorService';

const PROVINCIAS_ARGENTINA = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

export const AdminTablasPage = () => {
  const [tabActiva, setTabActiva] = useState('categorias');

  const tabs = [
    { id: 'categorias', label: 'Categorías', icon: '🗂️' },
    { id: 'marcas', label: 'Marcas', icon: '🏷️' },
    { id: 'medios-pago', label: 'Medios de Pago', icon: '💳' },
    { id: 'localidades', label: 'Localidades', icon: '📍' },
    { id: 'almacenes', label: 'Almacenes', icon: '🏭' },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚' },
  ];

  // Servicios encapsulados con la interfaz estándar requerida por SimpleCrudTable
  const servicios = useMemo(() => ({
    categorias: {
      getAll: () => categoriaService.getCategorias(),
      create: (data) => categoriaService.crearCategoria(data),
      update: (id, data) => categoriaService.actualizarCategoria(id, data),
      delete: (id) => categoriaService.eliminarCategoria(id),
    },
    marcas: {
      getAll: () => marcaService.getMarcas(),
      create: (data) => marcaService.crearMarca(data),
      update: (id, data) => marcaService.actualizarMarca(id, data),
      delete: (id) => marcaService.eliminarMarca(id),
    },
    'medios-pago': {
      getAll: () => medioPagoService.getMediosPago(),
      create: (data) => medioPagoService.crearMedioPago(data),
      update: (id, data) => medioPagoService.actualizarMedioPago(id, data),
      delete: (id) => medioPagoService.eliminarMedioPago(id),
    },
    localidades: {
      getAll: () => localidadService.getLocalidades(),
      create: (data) => localidadService.crearLocalidad(data),
      update: (id, data) => localidadService.actualizarLocalidad(id, data),
      delete: (id) => localidadService.eliminarLocalidad(id),
    },
    almacenes: {
      getAll: () => almacenService.getAlmacenes(),
      create: (data) => almacenService.crearAlmacen(data),
      update: (id, data) => almacenService.actualizarAlmacen(id, data),
      delete: (id) => almacenService.eliminarAlmacen(id),
    },
    proveedores: {
      getAll: () => proveedorService.getProveedores(),
      create: (data) => proveedorService.crearProveedor(data),
      update: (id, data) => proveedorService.actualizarProveedor(id, data),
      delete: (id) => proveedorService.eliminarProveedor(id),
    },
  }), []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-2 rounded-xl shadow-xs border border-gray-200 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                tabActiva === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {tabActiva === 'categorias' && (
        <SimpleCrudTable
          key="crud-categorias"
          title="Categorías de Productos"
          description="Gestión de las categorías maestras para clasificar el catálogo comercial."
          itemName="Categoría"
          service={servicios.categorias}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre de la Categoría' },
          ]}
          fields={[
            {
              name: 'nombre',
              label: 'Nombre',
              required: true,
              placeholder: 'Ej: Colchones, Tecnología, Electro',
            },
          ]}
        />
      )}

      {tabActiva === 'marcas' && (
        <SimpleCrudTable
          key="crud-marcas"
          title="Marcas Comerciales"
          description="Fabricantes y marcas vinculadas a los productos del inventario."
          itemName="Marca"
          service={servicios.marcas}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre de la Marca' },
          ]}
          fields={[
            {
              name: 'nombre',
              label: 'Nombre',
              required: true,
              placeholder: 'Ej: Samsung, Piero, Bosch, Phillips',
            },
          ]}
        />
      )}

      {tabActiva === 'medios-pago' && (
        <SimpleCrudTable
          key="crud-medios-pago"
          title="Medios de Pago Habilitados"
          description="Opciones de cobro disponibles para que los clientes completen sus pedidos."
          itemName="Medio de Pago"
          service={servicios['medios-pago']}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'descripcion', label: 'Descripción' },
          ]}
          fields={[
            {
              name: 'descripcion',
              label: 'Descripción',
              required: true,
              placeholder: 'Ej: Transferencia Bancaria, Tarjeta de Débito, Efectivo',
            },
          ]}
        />
      )}

      {tabActiva === 'localidades' && (
        <SimpleCrudTable
          key="crud-localidades"
          title="Localidades y Zonas de Entrega"
          description="Ciudades disponibles para el registro de clientes y cálculo logístico."
          itemName="Localidad"
          service={servicios.localidades}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'codigoPostal', label: 'C.P.' },
            { key: 'provincia', label: 'Provincia' },
          ]}
          fields={[
            {
              name: 'nombre',
              label: 'Nombre de Localidad',
              required: true,
              placeholder: 'Ej: Rosario',
            },
            {
              name: 'codigoPostal',
              label: 'Código Postal',
              required: true,
              placeholder: 'Ej: 2000',
            },
            {
              name: 'provincia',
              label: 'Provincia',
              type: 'select',
              required: true,
              options: PROVINCIAS_ARGENTINA.map((p) => ({ value: p, label: p })),
            },
          ]}
        />
      )}

      {tabActiva === 'almacenes' && (
        <SimpleCrudTable
          key="crud-almacenes"
          title="Almacenes y Sucursales Físicas"
          description="Puntos de distribución y depósitos donde se fracciona y almacena el stock."
          itemName="Almacén"
          service={servicios.almacenes}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'descripcion', label: 'Descripción / Nombre' },
            { key: 'direccion', label: 'Dirección Física' },
          ]}
          fields={[
            {
              name: 'descripcion',
              label: 'Descripción o Nombre',
              required: true,
              placeholder: 'Ej: Depósito Central Rosario, Local Físico',
            },
            {
              name: 'direccion',
              label: 'Dirección',
              required: true,
              placeholder: 'Ej: Av. Pellegrini 1234, Rosario',
            },
          ]}
        />
      )}

      {tabActiva === 'proveedores' && (
        <SimpleCrudTable
          key="crud-proveedores"
          title="Proveedores Mayoristas"
          description="Empresas proveedoras que abastecen de productos a la tienda."
          itemName="Proveedor"
          service={servicios.proveedores}
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre / Razón Social' },
            { key: 'cuit', label: 'CUIT' },
            { key: 'telefono', label: 'Teléfono' },
          ]}
          fields={[
            {
              name: 'nombre',
              label: 'Nombre o Razón Social',
              required: true,
              placeholder: 'Ej: Logística & Distribución SRL',
            },
            {
              name: 'cuit',
              label: 'CUIT (con guiones)',
              required: true,
              placeholder: 'Ej: 30-12345678-9',
              helperText: 'Debe respetar el formato oficial: XX-XXXXXXXX-X',
            },
            {
              name: 'telefono',
              label: 'Teléfono de Contacto',
              type: 'tel',
              required: true,
              placeholder: 'Ej: 341-5551234',
            },
          ]}
        />
      )}
    </div>
  );
};
