'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, DollarSign, Pencil, Trash2, ChevronsUpDown, Camera, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  CATEGORIAS,
  formatearPrecio,
  TASA_CAMBIO,
  type Producto,
  type CategoriaProducto,
  type TallaStock,
} from '@/compartido/datos-demo';
import { AdaptadorProductos } from '@/infraestructura/api/adaptador-productos';
import { ObtenerProductos } from '@/aplicacion/casos-uso/obtener-productos';
import { GuardarProducto } from '@/aplicacion/casos-uso/guardar-producto';
import { EliminarProducto } from '@/aplicacion/casos-uso/eliminar-producto';
import estilos from './inventario.module.css';

/** Componente para animar números con efecto de conteo */
function CountUpAnimation({ value, duration = 1000, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = value * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return <span>{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}</span>;
}

const UMBRAL_STOCK_BAJO = 3;
const PRODUCTO_VACIO: Omit<Producto, 'id' | 'stock'> = {
  nombre: '',
  categoria: 'Blusas',
  precioCompra: 0,
  precio: 0,
  moneda: 'USD',
  tallas: [],
};

// Instancias de los casos de uso (se crean fuera del componente para evitar recreaciones)
const repositorio = new AdaptadorProductos();
const casoObtener = new ObtenerProductos(repositorio);
const casoGuardar = new GuardarProducto(repositorio);
const casoEliminar = new EliminarProducto(repositorio);

export default function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Carga inicial desde Supabase
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const datos = await casoObtener.ejecutar();
      setProductos(datos);
    } catch {
      setErrorCarga('No se pudo cargar el inventario. Verifica tu conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);
  const [busqueda, setBusqueda] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  // Estado de búsqueda
  const [busquedaInput, setBusquedaInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusquedaInput(val);
    setIsSearching(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setBusqueda(val);
      setIsSearching(false);
    }, 400);
  };

  // Estado de filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('Todos'); // 'Todos', 'En stock', 'Stock bajo', 'Sin stock'

  // Estado del formulario
  const [form, setForm] = useState<Omit<Producto, 'id' | 'stock'>>(PRODUCTO_VACIO);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);

  // Estado temporal para agregar tallas
  const [tallaInput, setTallaInput] = useState('');
  const [cantidadInput, setCantidadInput] = useState<number | ''>('');

  const [pestaña, setPestaña] = useState('inventario');

  // Métricas
  const valorTotalInventario = productos.reduce((sum, p) => {
    const precioUnitario = p.moneda === 'VES' ? p.precio / TASA_CAMBIO : p.precio;
    return sum + (precioUnitario * p.stock);
  }, 0);

  const valorTotalInventarioVES = valorTotalInventario * TASA_CAMBIO;

  const totalProductos = productos.length;
  const enStock = productos.filter(p => p.stock > UMBRAL_STOCK_BAJO).length;
  const bajoStock = productos.filter(p => p.stock > 0 && p.stock <= UMBRAL_STOCK_BAJO).length;
  const sinStock = productos.filter(p => p.stock === 0).length;

  const abrirModalNuevo = () => {
    setProductoEditando(null);
    setForm(PRODUCTO_VACIO);
    setMostrarDescripcion(false);
    setTallaInput('');
    setCantidadInput('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditando(producto);
    const { id: _id, stock: _stock, ...datos } = producto;
    setForm(datos);
    setMostrarDescripcion(!!datos.descripcion);
    setTallaInput('');
    setCantidadInput('');
    setModalAbierto(true);
  };

  const agregarTalla = () => {
    if (!tallaInput.trim() || cantidadInput === '' || cantidadInput <= 0) return;

    setForm(prev => {
      const existe = prev.tallas.find(t => t.nombre.toUpperCase() === tallaInput.trim().toUpperCase());
      if (existe) {
        return {
          ...prev,
          tallas: prev.tallas.map(t =>
            t.nombre === existe.nombre ? { ...t, cantidad: t.cantidad + Number(cantidadInput) } : t
          )
        };
      }
      return {
        ...prev,
        tallas: [...prev.tallas, { nombre: tallaInput.trim().toUpperCase(), cantidad: Number(cantidadInput) }]
      };
    });
    setTallaInput('');
    setCantidadInput('');
  };

  const removerTalla = (nombreTalla: string) => {
    setForm(prev => ({
      ...prev,
      tallas: prev.tallas.filter(t => t.nombre !== nombreTalla)
    }));
  };

  const guardarProducto = async () => {
    const descripcionFinal = mostrarDescripcion ? form.descripcion : undefined;

    const productoAGuardar = {
      ...form,
      descripcion: descripcionFinal,
      ...(productoEditando ? { id: productoEditando.id } : {}),
    };

    const accion = productoEditando ? 'actualizar' : 'crear';
    const titulo = productoEditando ? '¿Actualizar producto?' : '¿Crear producto?';
    const mensaje = productoEditando 
      ? `¿Estás seguro de que deseas actualizar "${form.nombre}"?`
      : `¿Estás seguro de que deseas crear el producto "${form.nombre}"?`;

    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#770dee',
      cancelButtonColor: '#5f6368',
      confirmButtonText: productoEditando ? 'Sí, actualizar' : 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await casoGuardar.ejecutar(productoAGuardar);
          await cargarProductos();
          setModalAbierto(false);
          Swal.fire({
            title: productoEditando ? '¡Actualizado!' : '¡Creado!',
            text: productoEditando ? 'El producto ha sido actualizado.' : 'El producto ha sido creado.',
            icon: 'success',
            confirmButtonColor: '#770dee'
          });
        } catch {
          Swal.fire('Error', 'No se pudo guardar el producto.', 'error');
        }
      }
    });
  };

  const borrarSeleccionados = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminarán ${seleccionados.size} productos. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b3261e',
      cancelButtonColor: '#5f6368',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all([...seleccionados].map(id => casoEliminar.ejecutar(id)));
          setSeleccionados(new Set());
          await cargarProductos();
          Swal.fire({ title: '¡Eliminados!', text: 'Los productos han sido eliminados.', icon: 'success', confirmButtonColor: '#770dee' });
        } catch {
          Swal.fire('Error', 'No se pudo eliminar uno o más productos.', 'error');
        }
      }
    });
  };

  const borrarProducto = (id: string, nombre: string) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que deseas eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b3261e',
      cancelButtonColor: '#5f6368',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await casoEliminar.ejecutar(id);
          setSeleccionados(prev => { const n = new Set(prev); n.delete(id); return n; });
          await cargarProductos();
          Swal.fire({ title: '¡Eliminado!', text: 'El producto ha sido eliminado.', icon: 'success', confirmButtonColor: '#770dee' });
        } catch {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
    });
  };

  const actualizarCampo = <K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const manejarClickFoto = () => {
    if (subiendoFoto) return;
    inputArchivoRef.current?.click();
  };

  const manejarArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoFoto(true);

    const lector = new FileReader();
    lector.onload = (evento) => {
      // Usamos un ligero setTimeout solo para que se pueda apreciar 
      // la animación de carga que solicitaste, haciéndolo sentir más suave.
      setTimeout(() => {
        actualizarCampo('foto', evento.target?.result as string);
        setSubiendoFoto(false);
      }, 600);
    };
    lector.readAsDataURL(archivo);
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.id.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;

    let coincideEstado = true;
    if (estadoFiltro === 'En stock') coincideEstado = p.stock > UMBRAL_STOCK_BAJO;
    else if (estadoFiltro === 'Stock bajo') coincideEstado = p.stock > 0 && p.stock <= UMBRAL_STOCK_BAJO;
    else if (estadoFiltro === 'Sin stock') coincideEstado = p.stock === 0;

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  const valorEquivalente = form.moneda === 'USD'
    ? (form.precio * TASA_CAMBIO).toFixed(2) + ' VES'
    : (form.precio / TASA_CAMBIO).toFixed(2) + ' USD';

  return (
    <main className={estilos.pagina}>

      {/* Estado de carga inicial */}
      {cargando && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', color: 'var(--color-texto-secundario)' }}>
          <Loader2 size={28} className={estilos.iconoGirando} />
        </div>
      )}

      {/* Error de carga */}
      {!cargando && errorCarga && (
        <div role="alert" style={{ padding: '16px', color: 'var(--color-error)', textAlign: 'center' }}>
          {errorCarga}
        </div>
      )}

      {/* Contenido principal */}
      {!cargando && !errorCarga && (
      <>
      {/* Bloque de Métricas */}
      <div className={estilos.bloqueMetricas}>
        <div className={estilos.metricaGigante}>
          <span className={estilos.etiquetaMetrica}>
            <div className={estilos.iconoMetrica}><DollarSign size={14} /></div>
            Valor del inventario
          </span>
          <h2 className={estilos.valorMetrica}>
            ${<CountUpAnimation value={valorTotalInventario} duration={1500} decimals={2} />}
          </h2>
          <span className={estilos.subtextoMetrica}>
            ≈ Bs <CountUpAnimation value={valorTotalInventarioVES} duration={1500} decimals={2} />
          </span>
        </div>

        <div className={estilos.bloqueBarras}>
          <h3 className={estilos.tituloBarras}>
            <CountUpAnimation value={totalProductos} duration={1000} /> <span>productos</span>
          </h3>
          <div className={estilos.barrasProgreso}>
            <div 
              className={estilos.barraAzul} 
              style={{ 
                '--target-width': `${(enStock / totalProductos) * 100}%`,
                width: '0%',
                animation: 'slideIn 1.5s ease-out forwards'
              } as React.CSSProperties}
            ></div>
            <div 
              className={estilos.barraAmarilla} 
              style={{ 
                '--target-width': `${(bajoStock / totalProductos) * 100}%`,
                width: '0%',
                animation: 'slideIn 1.5s ease-out forwards'
              } as React.CSSProperties}
            ></div>
            <div 
              className={estilos.barraRoja} 
              style={{ 
                '--target-width': `${(sinStock / totalProductos) * 100}%`,
                width: '0%',
                animation: 'slideIn 1.5s ease-out forwards'
              } as React.CSSProperties}
            ></div>
          </div>
          <div className={estilos.leyendaBarras}>
            <div className={estilos.leyendaItem}>
              <div className={estilos.punto} style={{ backgroundColor: '#0ea5e9' }}></div> En stock: <CountUpAnimation value={enStock} duration={1000} />
            </div>
            <div className={estilos.leyendaItem}>
              <div className={estilos.punto} style={{ backgroundColor: 'var(--color-alerta)' }}></div> Bajo stock: <CountUpAnimation value={bajoStock} duration={1000} />
            </div>
            <div className={estilos.leyendaItem}>
              <div className={estilos.punto} style={{ backgroundColor: 'var(--color-error)' }}></div> Sin stock: <CountUpAnimation value={sinStock} duration={1000} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={estilos.tabs}>
        <button
          className={`${estilos.tab} ${pestaña === 'inventario' ? estilos.tabActivo : ''}`}
          onClick={() => setPestaña('inventario')}
        >
          Inventario
        </button>
        <button
          className={`${estilos.tab} ${pestaña === 'pedidos' ? estilos.tabActivo : ''}`}
          onClick={() => setPestaña('pedidos')}
        >
          Pedidos
        </button>
      </div>

      {/* Tabla */}
      <div className={estilos.contenedorPrincipal}>
        <div className={estilos.barraHerramientas}>
          <div className={estilos.buscadorTabla}>
            <div className={estilos.iconoBuscador}>
              {isSearching ? <Loader2 size={16} className={estilos.iconoGirando} /> : <Search size={16} />}
            </div>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busquedaInput}
              onChange={handleSearchChange}
            />
          </div>
          <div className={estilos.accionesHerramientas}>
            <div className={estilos.contenedorFiltro}>
              <button
                className={`${estilos.botonFiltro} ${mostrarFiltros ? estilos.botonFiltroActivo : ''}`}
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter size={16} /> Filtros
                {(categoriaFiltro !== 'Todas' || estadoFiltro !== 'Todos') && (
                  <span className={estilos.indicadorFiltroActivo}></span>
                )}
              </button>

              {mostrarFiltros && (
                <div className={estilos.menuFiltros}>
                  <div className={estilos.grupoFiltro}>
                    <label>Categoría</label>
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className={estilos.selectFiltro}
                    >
                      <option value="Todas">Todas</option>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className={estilos.grupoFiltro}>
                    <label>Estado</label>
                    <select
                      value={estadoFiltro}
                      onChange={(e) => setEstadoFiltro(e.target.value)}
                      className={estilos.selectFiltro}
                    >
                      <option value="Todos">Todos</option>
                      <option value="En stock">En stock</option>
                      <option value="Stock bajo">Stock bajo</option>
                      <option value="Sin stock">Sin stock</option>
                    </select>
                  </div>

                  <div className={estilos.accionesFiltro}>
                    <button
                      className={estilos.botonLimpiarFiltros}
                      onClick={() => {
                        setCategoriaFiltro('Todas');
                        setEstadoFiltro('Todos');
                        setMostrarFiltros(false);
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
            {seleccionados.size > 0 && (
              <button
                className={estilos.botonEliminarSeleccionados}
                onClick={borrarSeleccionados}
              >
                <Trash2 size={16} /> Borrar seleccionados ({seleccionados.size})
              </button>
            )}
            <button className={estilos.botonPrimario} onClick={abrirModalNuevo}>
              <Plus size={16} /> Nuevo producto
            </button>
          </div>
        </div>

        <div className={estilos.tablaContenedor}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th className={estilos.celdaCheckbox}>
                  <input
                    type="checkbox"
                    className={estilos.checkboxPersonalizado}
                    checked={productosFiltrados.length > 0 && seleccionados.size === productosFiltrados.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSeleccionados(new Set(productosFiltrados.map(p => p.id)));
                      } else {
                        setSeleccionados(new Set());
                      }
                    }}
                  />
                </th>
                <th><div className={estilos.thConOrden}>ID <ChevronsUpDown size={12} /></div></th>
                <th><div className={estilos.thConOrden}>CATEGORÍA <ChevronsUpDown size={12} /></div></th>
                <th><div className={estilos.thConOrden}>TALLAS <ChevronsUpDown size={12} /></div></th>
                <th><div className={estilos.thConOrden}>ESTADO <ChevronsUpDown size={12} /></div></th>
                <th><div className={estilos.thConOrden}>NIVEL STOCK <ChevronsUpDown size={12} /></div></th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => {
                let claseEstado = estilos.estadoCompleto;
                let textoEstado = 'EN STOCK';
                if (producto.stock === 0) {
                  claseEstado = estilos.estadoAlerta;
                  textoEstado = 'SIN STOCK';
                } else if (producto.stock <= UMBRAL_STOCK_BAJO) {
                  claseEstado = estilos.estadoPendiente;
                  textoEstado = 'STOCK BAJO';
                }

                const maxStockReferencia = 20;
                const porcentajeStock = Math.min((producto.stock / maxStockReferencia) * 100, 100);

                return (
                  <tr key={producto.id} className={seleccionados.has(producto.id) ? estilos.filaSeleccionada : ''}>
                    <td className={estilos.celdaCheckbox}>
                      <input
                        type="checkbox"
                        className={estilos.checkboxPersonalizado}
                        checked={seleccionados.has(producto.id)}
                        onChange={(e) => {
                          const nuevosSeleccionados = new Set(seleccionados);
                          if (e.target.checked) nuevosSeleccionados.add(producto.id);
                          else nuevosSeleccionados.delete(producto.id);
                          setSeleccionados(nuevosSeleccionados);
                        }}
                      />
                    </td>
                    <td>
                      <span className={estilos.celdaPrincipal}>#{producto.id}</span>
                      <span className={estilos.subtexto}>{producto.nombre}</span>
                    </td>
                    <td>{producto.categoria}</td>
                    <td>
                      <div className={estilos.celdaTallasPreview}>
                        {producto.tallas.length > 0 ? (
                          producto.tallas.map((t, i) => (
                            <span key={i} className={estilos.tallaBadgePequeno}>{t.nombre}</span>
                          ))
                        ) : (
                          <span className={estilos.subtexto}>N/A</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${estilos.badgeEstado} ${claseEstado}`}>
                        {textoEstado}
                      </span>
                    </td>
                    <td>
                      <div className={estilos.celdaBarra}>
                        <div className={estilos.barraExterna}>
                          <div className={estilos.barraInterna} style={{ width: `${porcentajeStock}%`, backgroundColor: textoEstado === 'EN STOCK' ? 'var(--color-primario)' : 'var(--color-alerta)' }}></div>
                        </div>
                        <span className={estilos.textoBarra}>{producto.stock}</span>
                      </div>
                    </td>
                    <td>
                      <div className={estilos.celdaAcciones}>
                        <button
                          className={estilos.botonIconoAccion}
                          onClick={() => abrirModalEditar(producto)}
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className={`${estilos.botonIconoAccion} ${estilos.botonIconoEliminar}`}
                          title="Eliminar"
                          onClick={() => borrarProducto(producto.id, producto.nombre)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nuevo Modal Rediseñado y Estructurado */}
      {modalAbierto && (
        <div className={estilos.overlayModal}>
          <div className={`${estilos.modal} ${estilos.modalAnimacionPop} ${estilos.modalGrande}`}>

            {/* Header del Modal */}
            <div className={estilos.modalHeader}>
              <h2 className={estilos.tituloModal}>
                {productoEditando ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button className={estilos.botonCerrarModal} onClick={() => setModalAbierto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={estilos.contenidoModalDosColumnas}>

              {/* Columna Izquierda: Foto y Detalles Básicos */}
              <div className={estilos.columnaModal}>

                <div className={estilos.seccionModal}>
                  <h3 className={estilos.tituloSeccion}>Imagen del producto</h3>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={inputArchivoRef}
                    onChange={manejarArchivoSeleccionado}
                  />

                  <div className={`${estilos.fotoContenedor} ${form.foto && !subiendoFoto ? estilos.conFoto : ''}`} onClick={manejarClickFoto}>
                    {subiendoFoto ? (
                      <div className={estilos.fotoCargando}>
                        <div className={estilos.spinner}></div>
                        <span className={estilos.fotoTexto}>Procesando...</span>
                      </div>
                    ) : form.foto ? (
                      <img src={form.foto} alt="Vista previa" className={estilos.fotoPrevia} />
                    ) : (
                      <>
                        <Camera size={28} />
                        <span className={estilos.fotoTexto}>Click para subir foto</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={estilos.seccionModal}>
                  <h3 className={estilos.tituloSeccion}>Información básica</h3>

                  <div className={estilos.campoFlotante}>
                    <input
                      className={estilos.inputFlotante}
                      placeholder=" "
                      value={form.nombre}
                      onChange={(e) => actualizarCampo('nombre', e.target.value)}
                    />
                    <label className={estilos.etiquetaFlotante}>Nombre</label>
                  </div>

                  <div className={estilos.campoFlotante}>
                    <select
                      className={estilos.selectFlotante}
                      value={form.categoria}
                      onChange={(e) => actualizarCampo('categoria', e.target.value as CategoriaProducto)}
                    >
                      {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <label className={estilos.etiquetaSelect}>Categoría</label>
                  </div>

                  <div className={estilos.grupoCheckbox}>
                    <input
                      type="checkbox"
                      id="check-desc"
                      checked={mostrarDescripcion}
                      onChange={(e) => setMostrarDescripcion(e.target.checked)}
                      className={estilos.checkboxModerno}
                    />
                    <label htmlFor="check-desc" className={estilos.etiquetaCampo}>Añadir descripción detallada</label>
                  </div>

                  {mostrarDescripcion && (
                    <div className={estilos.campoFlotante}>
                      <textarea
                        className={estilos.textareaFlotante}
                        placeholder=" "
                        value={form.descripcion || ''}
                        onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                      />
                      <label className={estilos.etiquetaFlotante}>Descripción detallada</label>
                    </div>
                  )}
                </div>

              </div>

              {/* Columna Derecha: Precio y Tallas */}
              <div className={estilos.columnaModal}>

                <div className={estilos.seccionModal}>
                  <h3 className={estilos.tituloSeccion}>Precio y Moneda</h3>

                  <div className={estilos.grupoMoneda}>
                    <div className={estilos.campoFlotante} style={{ width: '90px', marginBottom: 0 }}>
                      <select
                        className={estilos.selectFlotante}
                        value={form.moneda}
                        onChange={(e) => actualizarCampo('moneda', e.target.value as 'USD' | 'VES')}
                      >
                        <option value="USD">USD</option>
                        <option value="VES">VES</option>
                      </select>
                      <label className={estilos.etiquetaSelect}>Moneda</label>
                    </div>

                    <div className={estilos.campoFlotante} style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        className={estilos.inputFlotante}
                        type="number"
                        min={0}
                        value={form.precioCompra || ''}
                        onChange={(e) => actualizarCampo('precioCompra', Number(e.target.value))}
                        placeholder=" "
                      />
                      <label className={estilos.etiquetaFlotante}>P. Compra</label>
                    </div>

                    <div className={estilos.campoFlotante} style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        className={estilos.inputFlotante}
                        type="number"
                        min={0}
                        value={form.precio || ''}
                        onChange={(e) => actualizarCampo('precio', Number(e.target.value))}
                        placeholder=" "
                      />
                      <label className={estilos.etiquetaFlotante}>P. Venta</label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <small className={estilos.textoConversion}>
                      ≈ {valorEquivalente}
                    </small>
                    {(form.precio > 0 || form.precioCompra > 0) && (
                      <small className={estilos.textoConversion} style={{ color: form.precio >= form.precioCompra ? 'var(--color-exito, #16a34a)' : 'var(--color-error)' }}>
                        Ganancia: {formatearPrecio(form.precio - form.precioCompra, form.moneda)}
                      </small>
                    )}
                  </div>
                </div>

                <div className={`${estilos.seccionModal} ${estilos.seccionTallas}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={estilos.tituloSeccion} style={{ margin: 0 }}>Inventario por Tallas</h3>
                    <span className={estilos.stockTotalBadge}>Total: {form.tallas.reduce((s, t) => s + t.cantidad, 0)}</span>
                  </div>

                  <div className={estilos.grupoAgregarTalla}>
                    <div className={estilos.campoFlotante} style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        type="text"
                        placeholder=" "
                        className={estilos.inputFlotante}
                        value={tallaInput}
                        onChange={e => setTallaInput(e.target.value)}
                      />
                      <label className={estilos.etiquetaFlotante}>Talla (S)</label>
                    </div>

                    <div className={estilos.campoFlotante} style={{ width: '80px', marginBottom: 0 }}>
                      <input
                        type="number"
                        placeholder=" "
                        min={1}
                        className={estilos.inputFlotante}
                        value={cantidadInput}
                        onChange={e => setCantidadInput(e.target.value ? Number(e.target.value) : '')}
                      />
                      <label className={estilos.etiquetaFlotante}>Cant.</label>
                    </div>

                    <button type="button" className={estilos.botonAgregarSecundario} onClick={agregarTalla} style={{ height: '40px' }}>
                      Agregar
                    </button>
                  </div>

                  {form.tallas.length > 0 && (
                    <div className={estilos.listaEtiquetasTalla}>
                      {form.tallas.map((t, idx) => (
                        <div key={idx} className={estilos.etiquetaTalla}>
                          <span>{t.nombre}</span>
                          <span className={estilos.etiquetaTallaCantidad}>{t.cantidad}</span>
                          <button
                            type="button"
                            className={estilos.botonRemoverTalla}
                            onClick={() => removerTalla(t.nombre)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

            <div className={estilos.modalFooter}>
              <button className={estilos.botonCancelar} onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className={estilos.botonModalGuardar} onClick={guardarProducto}>Guardar producto</button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </main>
  );
}
