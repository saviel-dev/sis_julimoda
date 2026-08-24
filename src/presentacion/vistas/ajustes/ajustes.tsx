'use client';

import { useState, useRef, useEffect } from 'react';
import { Store, Receipt, Save, Tags, Plus, Trash2, Pencil, FolderOpen, X, Check, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import estilos from './ajustes.module.css';

/**
 * Vista de Ajustes del emprendimiento.
 * Incluye informacion basica y CRUD simulado de categorias.
 */
export default function Ajustes() {
  const [categorias, setCategorias] = useState([
    { id: 1, nombre: 'Pantalones' },
    { id: 2, nombre: 'Blusas' },
    { id: 3, nombre: 'Zapatos' },
    { id: 4, nombre: 'Accesorios' },
    { id: 5, nombre: 'Vestidos' },
  ]);

  const [nuevaCategoria, setNuevaCategoria] = useState('');
  // Controla el hover desde React para evitar bugs con selectores compuestos en CSS Modules
  const [hoverId, setHoverId] = useState<number | null>(null);

  // Usuarios simulados para la gestion de roles
  const USUARIOS_DEMO = [
    { id: '1', nombre: 'Julia (Admin)' },
    { id: '2', nombre: 'Carlos (Vendedor)' },
    { id: '3', nombre: 'Maria (Cajera)' },
  ];

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(USUARIOS_DEMO[0].id);

  // Permisos simulados por usuario
  const [permisos, setPermisos] = useState<Record<string, {
    crearProducto: boolean;
    editarProducto: boolean;
    eliminarProducto: boolean;
    vender: boolean;
    verReportes: boolean;
    ajustarTasa: boolean;
    cambiarInformacion: boolean;
    modificarCategorias: boolean;
  }>>({
    '1': { crearProducto: true, editarProducto: true, eliminarProducto: true, vender: true, verReportes: true, ajustarTasa: true, cambiarInformacion: true, modificarCategorias: true },
    '2': { crearProducto: false, editarProducto: false, eliminarProducto: false, vender: true, verReportes: false, ajustarTasa: false, cambiarInformacion: false, modificarCategorias: false },
    '3': { crearProducto: false, editarProducto: false, eliminarProducto: false, vender: true, verReportes: false, ajustarTasa: false, cambiarInformacion: false, modificarCategorias: false },
  });

  const manejarCambioPermiso = (permiso: keyof typeof permisos['1']) => {
    setPermisos(prev => ({
      ...prev,
      [usuarioSeleccionado]: {
        ...prev[usuarioSeleccionado],
        [permiso]: !prev[usuarioSeleccionado][permiso]
      }
    }));
  };

  // Confirmacion de guardado con SweetAlert2
  const manejarGuardar = async () => {
    const resultado = await Swal.fire({
      title: 'Guardar cambios',
      text: 'Esta accion actualizara la informacion del negocio y los ajustes de recibos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#770dee',
      cancelButtonColor: '#dadce0',
      customClass: {
        cancelButton: 'swal-btn-cancelar',
        popup: 'swal-popup-julimoda',
      },
      showLoaderOnConfirm: true,
      preConfirm: () =>
        new Promise(resolve => setTimeout(resolve, 1000)),
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (resultado.isConfirmed) {
      Swal.fire({
        title: 'Cambios guardados',
        text: 'La informacion del negocio se ha actualizado correctamente.',
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#770dee',
        timer: 2500,
        timerProgressBar: true,
        customClass: { popup: 'swal-popup-julimoda' },
      });
    }
  };

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<{ id: number; nombre: string } | null>(null);
  const [nombreEnModal, setNombreEnModal] = useState('');
  const inputModalRef = useRef<HTMLInputElement>(null);

  // Enfocar el input al abrir el modal
  useEffect(() => {
    if (modalAbierto) {
      setTimeout(() => inputModalRef.current?.focus(), 50);
    }
  }, [modalAbierto]);

  const manejarAgregar = () => {
    if (nuevaCategoria.trim() === '') return;
    const nuevoId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1;
    setCategorias([{ id: nuevoId, nombre: nuevaCategoria.trim() }, ...categorias]);
    setNuevaCategoria('');
  };

  const manejarEliminar = (id: number) => {
    setCategorias(categorias.filter(c => c.id !== id));
  };

  const abrirModalEditar = (id: number, nombre: string) => {
    setCategoriaEditando({ id, nombre });
    setNombreEnModal(nombre);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaEditando(null);
    setNombreEnModal('');
  };

  const confirmarEdicion = () => {
    if (!categoriaEditando || nombreEnModal.trim() === '') return;
    setCategorias(categorias.map(c =>
      c.id === categoriaEditando.id ? { ...c, nombre: nombreEnModal.trim() } : c
    ));
    cerrarModal();
  };

  return (
    <div className={estilos.contenedor}>

      {/* ---- COLUMNA IZQUIERDA ---- */}
      <div className={estilos.columnaIzquierda}>


        {/* Informacion del Negocio */}
        <section className={estilos.seccion}>
          <h2 className={estilos.tituloSeccion}>
            <Store size={18} className={estilos.iconoSeccion} />
            Informacion del Negocio
          </h2>

          <div className={estilos.formularioGrid}>
            <div className={estilos.campoGrupo}>
              <label className={estilos.etiqueta}>Nombre del Emprendimiento</label>
              <input type="text" className={estilos.input} defaultValue="JuliModa" />
            </div>

            <div className={estilos.campoGrupo}>
              <label className={estilos.etiqueta}>Telefono / WhatsApp</label>
              <input type="text" className={estilos.input} defaultValue="+58 414-1234567" />
            </div>

            <div className={`${estilos.campoGrupo} ${estilos.campoGrupoFull}`}>
              <label className={estilos.etiqueta}>Correo Electronico</label>
              <input type="email" className={estilos.input} defaultValue="contacto@julimoda.com" />
            </div>
          </div>
        </section>

        {/* Recibos */}
        <section className={estilos.seccion}>
          <h2 className={estilos.tituloSeccion}>
            <Receipt size={18} className={estilos.iconoSeccion} />
            Recibos y Facturacion
          </h2>

          <div className={estilos.formularioGrid}>
            <div className={`${estilos.campoGrupo} ${estilos.campoGrupoFull}`}>
              <label className={estilos.etiqueta}>Mensaje al pie del recibo</label>
              <textarea
                className={estilos.textarea}
                defaultValue="Gracias por tu compra! Conserva este recibo para cambios (Maximo 15 dias)."
              />
            </div>
          </div>
        </section>

        {/* Gestion de Roles */}
        <section className={estilos.seccion}>
          <h2 className={estilos.tituloSeccion}>
            <Users size={18} className={estilos.iconoSeccion} />
            Gestion de Roles y Permisos
          </h2>

          <div className={estilos.formularioGrid}>
            <div className={`${estilos.campoGrupo} ${estilos.campoGrupoFull}`}>
              <label className={estilos.etiqueta}>Seleccionar Usuario</label>
              <select
                className={`${estilos.input} ${estilos.select}`}
                value={usuarioSeleccionado}
                onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              >
                {USUARIOS_DEMO.map(user => (
                  <option key={user.id} value={user.id}>{user.nombre}</option>
                ))}
              </select>
            </div>

            <div className={`${estilos.campoGrupo} ${estilos.campoGrupoFull}`}>
              <label className={estilos.etiqueta}>Permisos del usuario</label>
              
              <div className={estilos.listaPermisos}>
                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Crear productos</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.crearProducto || false}
                      onChange={() => manejarCambioPermiso('crearProducto')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Editar productos</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.editarProducto || false}
                      onChange={() => manejarCambioPermiso('editarProducto')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Eliminar productos</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.eliminarProducto || false}
                      onChange={() => manejarCambioPermiso('eliminarProducto')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Vender (Punto de Venta)</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.vender || false}
                      onChange={() => manejarCambioPermiso('vender')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Ver reportes</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.verReportes || false}
                      onChange={() => manejarCambioPermiso('verReportes')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Ajustar tasa de cambio</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.ajustarTasa || false}
                      onChange={() => manejarCambioPermiso('ajustarTasa')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Cambiar informacion del negocio</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.cambiarInformacion || false}
                      onChange={() => manejarCambioPermiso('cambiarInformacion')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>

                <label className={estilos.itemPermiso}>
                  <span className={estilos.textoPermiso}>Modificar categorias</span>
                  <div className={estilos.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      checked={permisos[usuarioSeleccionado]?.modificarCategorias || false}
                      onChange={() => manejarCambioPermiso('modificarCategorias')}
                    />
                    <span className={estilos.toggleSlider}></span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className={estilos.acciones}>
          <button className={estilos.botonGuardar} onClick={manejarGuardar}>
            <Save size={16} />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* ---- COLUMNA DERECHA: CRUD Categorias ---- */}
      <div className={estilos.columnaDerecha}>
        <section className={estilos.seccion}>
          <h2 className={estilos.tituloSeccion}>
            <Tags size={18} className={estilos.iconoSeccion} />
            Categorias del Inventario
            <span className={estilos.badgeContador}>{categorias.length}</span>
          </h2>

          {/* Input para agregar nueva categoria */}
          <div className={estilos.grupoAgregar}>
            <input
              type="text"
              className={estilos.input}
              placeholder="Nueva categoria..."
              value={nuevaCategoria}
              onChange={e => setNuevaCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && manejarAgregar()}
            />
            <button
              className={estilos.botonAgregar}
              onClick={manejarAgregar}
              aria-label="Agregar categoria"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Lista de categorias */}
          <div className={estilos.listaCategorias}>
            {categorias.length === 0 ? (
              <div className={estilos.estadoVacio}>
                <FolderOpen size={32} strokeWidth={1.5} />
                <p>No hay categorias aun.<br />Agrega una usando el campo de arriba.</p>
              </div>
            ) : (
              categorias.map(cat => (
                <div
                  key={cat.id}
                  className={estilos.itemCategoria}
                  onMouseEnter={() => setHoverId(cat.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <span className={estilos.indicadorColor} />
                  <span className={estilos.nombreCategoria}>{cat.nombre}</span>
                  <div
                    className={estilos.accionesCategoria}
                    style={{ opacity: hoverId === cat.id ? 1 : 0 }}
                  >
                    <button
                      className={estilos.botonAccion}
                      onClick={() => abrirModalEditar(cat.id, cat.nombre)}
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className={`${estilos.botonAccion} ${estilos.rojo}`}
                      onClick={() => manejarEliminar(cat.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modal de edicion de categoria */}
      {modalAbierto && categoriaEditando && (
        <div className={estilos.overlay} onClick={cerrarModal} role="dialog" aria-modal="true">
          <div className={estilos.modal} onClick={e => e.stopPropagation()}>
            <div className={estilos.modalEncabezado}>
              <h3 className={estilos.modalTitulo}>Editar Categoria</h3>
              <button className={estilos.modalCerrar} onClick={cerrarModal} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <p className={estilos.modalDescripcion}>
              Nombre actual: <strong>{categoriaEditando.nombre}</strong>
            </p>

            <div className={estilos.campoGrupo}>
              <label className={estilos.etiqueta}>Nuevo nombre</label>
              <input
                ref={inputModalRef}
                type="text"
                className={estilos.input}
                value={nombreEnModal}
                onChange={e => setNombreEnModal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmarEdicion()}
                placeholder="Nombre de la categoria..."
              />
            </div>

            <div className={estilos.modalAcciones}>
              <button className={estilos.botonCancelar} onClick={cerrarModal}>
                Cancelar
              </button>
              <button className={estilos.botonConfirmar} onClick={confirmarEdicion}>
                <Check size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

