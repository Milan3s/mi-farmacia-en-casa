<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Navbar from "../../navbar/Navbar.vue";
import Agregar from "./Agregar.vue";
import Editar from "./Editar.vue";
import Eliminar from "./Eliminar.vue";

const usuarios = ref([]);
const roles = ref([]);
const loading = ref(true);
const error = ref("");

// Control de formularios
const modoFormulario = ref("agregar");
const usuarioSeleccionado = ref(null);
const usuarioNombre = ref("");

// Paginación
const currentPage = ref(1);
const perPage = ref(5);

// Filtros
const searchQuery = ref("");
const selectedRol = ref("");

// 🔄 Cargar datos
const fetchUsuarios = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await axios.get("http://localhost:5000/api/users");
    usuarios.value = response.data;
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err);
    error.value = "Error al cargar los usuarios.";
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/roles");
    roles.value = response.data;
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
  }
};

onMounted(() => {
  fetchUsuarios();
  fetchRoles();
});

// 🧩 Acciones
const editarUsuario = (id) => {
  modoFormulario.value = "editar";
  usuarioSeleccionado.value = id;
};

const eliminarUsuario = (id, name) => {
  modoFormulario.value = "eliminar";
  usuarioSeleccionado.value = id;
  usuarioNombre.value = name;
};

const volverAgregar = () => {
  modoFormulario.value = "agregar";
  usuarioSeleccionado.value = null;
  usuarioNombre.value = "";
};

// 🔍 Filtros y paginación
const filteredUsuarios = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const rolFilter = selectedRol.value;

  return usuarios.value.filter((user) => {
    const matchesQuery =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.rol?.name || "").toLowerCase().includes(query);

    const matchesRol = !rolFilter || user.rol?._id === rolFilter;

    return matchesQuery && matchesRol;
  });
});

const totalUsuarios = computed(() => filteredUsuarios.value.length);

const totalPages = computed(() =>
  Math.ceil(totalUsuarios.value / perPage.value)
);

const paginatedUsuarios = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredUsuarios.value.slice(start, end);
});

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
  <div>
    <Navbar />

    <div class="container listado-container">
      <!-- Encabezado global -->
      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary titulo">
          <i class="fas fa-users me-2"></i>Gestión de Usuarios
        </h2>
        <hr class="divider mx-auto" />
        <p class="text-muted descripcion">
          Aquí puedes visualizar, buscar, agregar, editar y eliminar usuarios registrados en el sistema junto con su rol
          y fecha de creación.
        </p>
      </div>

      <div class="row justify-content-center mt-5">
        <!-- Columna izquierda -->
        <div class="col-md-5 mb-4">
          <Agregar v-if="modoFormulario === 'agregar'" @usuarioCreado="fetchUsuarios" />

          <Editar v-else-if="modoFormulario === 'editar'" :userId="usuarioSeleccionado"
            @usuarioEditado="() => { fetchUsuarios(); volverAgregar(); }" @cerrarFormulario="volverAgregar" />

          <Eliminar v-else-if="modoFormulario === 'eliminar'" :userId="usuarioSeleccionado" :userName="usuarioNombre"
            @usuarioEliminado="() => { fetchUsuarios(); volverAgregar(); }" @cancelar="volverAgregar" />
        </div>

        <!-- Columna derecha -->
        <div class="col-md-5">
          <div class="users-box border shadow-lg rounded bg-white d-flex flex-column">
            <!-- Cabecera fija -->
            <div class="list-header border-bottom bg-light sticky-top">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-semibold text-dark m-0">
                  <i class="fas fa-list me-2 text-primary"></i>Listado de usuarios
                </h5>
                <button v-if="modoFormulario !== 'agregar'" class="btn btn-sm btn-outline-secondary"
                  @click="volverAgregar">
                  <i class="fas fa-plus me-1"></i>Agregar nuevo
                </button>
              </div>

              <!-- Buscador y filtro -->
              <div class="d-flex flex-wrap align-items-center gap-2">
                <!-- Buscador -->
                <div class="input-group flex-grow-1">
                  <span class="input-group-text bg-light">
                    <i class="fas fa-search text-secondary"></i>
                  </span>
                  <input type="text" class="form-control" placeholder="Buscar por nombre, correo o rol..."
                    v-model="searchQuery" />
                </div>

                <!-- Label y Select de roles -->
                <div class="d-flex align-items-center gap-2">
                  <label for="rolSelect" class="form-label m-0 fw-semibold text-secondary small">
                    Filtrar por rol:
                  </label>
                  <select id="rolSelect" v-model="selectedRol" class="form-select form-select-sm w-auto">
                    <option value="">Todos los roles</option>
                    <option v-for="rol in roles" :key="rol._id" :value="rol._id">
                      {{ rol.name }}
                    </option>
                  </select>
                </div>
              </div>


              <p class="text-muted small mt-2 mb-0">
                <i class="fas fa-users me-1 text-primary"></i>
                Total registrados: <strong>{{ totalUsuarios }}</strong>
              </p>
            </div>

            <!-- Contenido scrollable -->
            <div class="list-content flex-grow-1">
              <!-- Cargando -->
              <div v-if="loading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status"></div>
              </div>

              <!-- Error -->
              <div v-else-if="error" class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
              </div>

              <!-- Lista -->
              <ul v-else class="list-unstyled mb-0 px-3 pt-3">
                <li v-for="user in paginatedUsuarios" :key="user._id"
                  class="user-item border rounded mb-3 p-3 shadow-sm d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="fw-bold mb-1">
                      <i class="fas fa-user me-2 text-primary"></i>{{ user.name }}
                    </h6>
                    <p class="mb-1 text-muted small">
                      <i class="fas fa-envelope me-2"></i>{{ user.email }}
                    </p>
                    <span v-if="user.rol" class="badge bg-success px-3 py-2">
                      {{ user.rol.name }}
                    </span>
                    <span v-else class="badge bg-secondary px-3 py-2">Sin rol</span>
                  </div>

                  <div class="text-end">
                    <p class="small text-muted mb-2">
                      <i class="fas fa-calendar-alt me-1"></i>
                      {{ new Date(user.createdAt).toLocaleDateString() }}
                    </p>
                    <div class="d-flex gap-2 justify-content-end">
                      <button class="btn btn-sm btn-outline-primary" @click="editarUsuario(user._id)">
                        <i class="fas fa-edit me-1"></i>Editar
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="eliminarUsuario(user._id, user.name)">
                        <i class="fas fa-trash-alt me-1"></i>Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Footer con paginación fija -->
            <div class="list-footer border-top bg-light text-center py-2">
              <nav aria-label="Paginación de usuarios">
                <ul class="pagination justify-content-center align-items-center mb-0">
                  <!-- Ir a la primera página -->
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="goToPage(1)" title="Primera página">
                      ««
                    </button>
                  </li>

                  <!-- Página anterior -->
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="goToPage(currentPage - 1)" title="Anterior">
                      «
                    </button>
                  </li>

                  <!-- Indicador de página -->
                  <li class="page-item disabled">
                    <span class="page-link bg-transparent border-0 text-dark fw-semibold">
                      {{ currentPage }} / {{ totalPages || 1 }}
                    </span>
                  </li>

                  <!-- Página siguiente -->
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                    <button class="page-link" @click="goToPage(currentPage + 1)" title="Siguiente">
                      »
                    </button>
                  </li>

                  <!-- Ir a la última página -->
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                    <button class="page-link" @click="goToPage(totalPages)" title="Última página">
                      »»
                    </button>
                  </li>
                </ul>
              </nav>

              <p class="text-muted small mt-1 mb-0">
                Mostrando
                {{ (currentPage - 1) * perPage + 1 }} –
                {{ Math.min(currentPage * perPage, totalUsuarios) }}
                de {{ totalUsuarios }} usuarios
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.listado-container {
  margin-top: 44px;
  margin-bottom: 60px;
}

/* --- ENCABEZADO --- */
.titulo {
  font-size: 30px;
}

.descripcion {
  font-size: 20px;
  margin-bottom: 0;
}

.divider {
  width: 80px;
  border: 2px solid #0d6efd;
  opacity: 0.9;
  margin-top: 8px;
  margin-bottom: 10px;
}

/* --- CAJA PRINCIPAL --- */
.users-box {
  height: 920px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
  overflow: hidden;
  position: relative;
}

/* Cabecera fija dentro del contenedor */
.list-header {
  z-index: 3;
  background-color: #f8f9fa;
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
}

/* Contenido scrollable (ajustado para no cubrir el footer) */
.list-content {
  overflow-y: auto;
  flex-grow: 1;
  padding: 16px;
  background-color: #ffffff;
  margin-bottom: 64px;
  /* deja espacio para el footer */
}

/* Footer fijo visible */
.list-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  text-align: center;
  padding: 10px 0;
  z-index: 4;
}

/* Scrollbar personalizado */
.list-content::-webkit-scrollbar {
  width: 8px;
}

.list-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.list-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.35);
}

/* Items */
.user-item {
  background-color: #f8f9fa;
  transition: all 0.2s ease-in-out;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.user-item:hover {
  background-color: #e9ecef;
  transform: translateY(-3px);
  border-color: #adb5bd;
}

/* Paginación */
.pagination {
  margin-bottom: 6px;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-link {
  color: #0d6efd;
  cursor: pointer;
}

.page-item.disabled .page-link {
  color: #adb5bd;
  cursor: default;
}

/* Botones */
.btn-outline-primary,
.btn-outline-danger,
.btn-outline-secondary {
  border-radius: 6px;
  font-weight: 500;
}

/* Select de roles */
.form-select {
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Input buscador */
.input-group-text {
  border-radius: 8px 0 0 8px;
}

.form-control {
  border-radius: 0 8px 8px 0;
}
</style>
