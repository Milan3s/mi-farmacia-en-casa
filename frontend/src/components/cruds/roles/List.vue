<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Navbar from "../../navbar/Navbar.vue";
import Agregar from "./Agregar.vue";
import Editar from "./Editar.vue";
import Eliminar from "./Eliminar.vue";

const roles = ref([]);
const loading = ref(true);
const error = ref("");
const modoFormulario = ref("agregar");
const rolSeleccionado = ref(null);
const rolNombre = ref("");
const currentPage = ref(1);
const perPage = ref(5);
const searchQuery = ref("");

const fetchRoles = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await axios.get("http://localhost:5000/api/roles");
    roles.value = Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Error al obtener roles:", err);
    error.value = "Error al cargar los roles desde el servidor.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRoles();
});

const editarRol = (id) => {
  modoFormulario.value = "editar";
  rolSeleccionado.value = id;
};

const eliminarRol = (id, name) => {
  modoFormulario.value = "eliminar";
  rolSeleccionado.value = id;
  rolNombre.value = name;
};

const volverAgregar = () => {
  modoFormulario.value = "agregar";
  rolSeleccionado.value = null;
  rolNombre.value = "";
};

const filteredRoles = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  return roles.value.filter((rol) => {
    return (
      !query ||
      rol.name?.toLowerCase().includes(query) ||
      rol.description?.toLowerCase().includes(query)
    );
  });
});

const totalRoles = computed(() => filteredRoles.value.length);
const totalPages = computed(() => Math.ceil(totalRoles.value / perPage.value));

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredRoles.value.slice(start, end);
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
      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary titulo">
          <i class="fas fa-user-shield me-2"></i>Gestión de Roles
        </h2>
        <hr class="divider mx-auto" />
        <p class="text-muted descripcion">
          Aquí puedes visualizar, buscar, agregar, editar y eliminar los roles
          disponibles en el sistema junto con su descripción y fecha de creación.
        </p>
      </div>

      <div class="row justify-content-center mt-5">
        <div class="col-md-5 mb-4">
          <Agregar v-if="modoFormulario === 'agregar'" @rolCreado="fetchRoles" />
          <Editar
            v-else-if="modoFormulario === 'editar'"
            :rolId="rolSeleccionado"
            @rolEditado="() => { fetchRoles(); volverAgregar(); }"
            @cerrarFormulario="volverAgregar"
          />
          <Eliminar
            v-else-if="modoFormulario === 'eliminar'"
            :rolId="rolSeleccionado"
            :rolName="rolNombre"
            @rolEliminado="() => { fetchRoles(); volverAgregar(); }"
            @cancelar="volverAgregar"
          />
        </div>

        <div class="col-md-5">
          <div class="roles-box border shadow-lg rounded bg-white d-flex flex-column">
            <div class="list-header border-bottom bg-light sticky-top">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-semibold text-dark m-0">
                  <i class="fas fa-list me-2 text-primary"></i>Listado de roles
                </h5>
                <button
                  v-if="modoFormulario !== 'agregar'"
                  class="btn btn-sm btn-outline-secondary"
                  @click="volverAgregar"
                >
                  <i class="fas fa-plus me-1"></i>Agregar nuevo
                </button>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div class="input-group flex-grow-1">
                  <span class="input-group-text bg-light">
                    <i class="fas fa-search text-secondary"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Buscar por nombre o descripción..."
                    v-model="searchQuery"
                  />
                </div>
              </div>

              <p class="text-muted small mt-2 mb-0">
                <i class="fas fa-user-shield me-1 text-primary"></i>
                Total registrados: <strong>{{ totalRoles }}</strong>
              </p>
            </div>

            <div class="list-content flex-grow-1">
              <div v-if="loading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status"></div>
              </div>

              <div v-else-if="error" class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
              </div>

              <ul v-else class="list-unstyled mb-0 px-3 pt-3">
                <li
                  v-for="rol in paginatedRoles"
                  :key="rol._id"
                  class="rol-item border rounded mb-3 p-3 shadow-sm"
                >
                  <h6 class="fw-bold mb-1">
                    <i class="fas fa-user-shield me-2 text-primary"></i>{{ rol.name }}
                  </h6>
                  <p class="mb-2 text-muted small">
                    <i class="fas fa-info-circle me-2"></i>{{ rol.description || "Sin descripción" }}
                  </p>
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <p class="small text-muted mb-0">
                      <i class="fas fa-calendar-alt me-1"></i>
                      {{ new Date(rol.createdAt).toLocaleDateString() }}
                    </p>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-primary" @click="editarRol(rol._id)">
                        <i class="fas fa-edit me-1"></i>Editar
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="eliminarRol(rol._id, rol.name)">
                        <i class="fas fa-trash-alt me-1"></i>Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="list-footer border-top bg-light text-center py-2">
              <nav aria-label="Paginación de roles">
                <ul class="pagination justify-content-center align-items-center mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="goToPage(1)" title="Primera página">««</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="goToPage(currentPage - 1)" title="Anterior">«</button>
                  </li>
                  <li class="page-item disabled">
                    <span class="page-link bg-transparent border-0 text-dark fw-semibold">
                      {{ currentPage }} / {{ totalPages || 1 }}
                    </span>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                    <button class="page-link" @click="goToPage(currentPage + 1)" title="Siguiente">»</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                    <button class="page-link" @click="goToPage(totalPages)" title="Última página">»»</button>
                  </li>
                </ul>
              </nav>
              <p class="text-muted small mt-1 mb-0">
                Mostrando
                {{ (currentPage - 1) * perPage + 1 }} –
                {{ Math.min(currentPage * perPage, totalRoles) }}
                de {{ totalRoles }} roles
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
.roles-box {
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
.list-header {
  z-index: 3;
  background-color: #f8f9fa;
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
}
.list-content {
  overflow-y: auto;
  flex-grow: 1;
  padding: 16px;
  margin-bottom: 64px;
  background-color: #ffffff;
}
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
.rol-item {
  background-color: #f8f9fa;
  transition: all 0.2s ease-in-out;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}
.rol-item:hover {
  background-color: #e9ecef;
  transform: translateY(-3px);
  border-color: #adb5bd;
}
.pagination {
  margin-bottom: 6px;
}
.page-link {
  color: #0d6efd;
  cursor: pointer;
}
.page-item.disabled .page-link {
  color: #adb5bd;
  cursor: default;
}
.btn-outline-primary,
.btn-outline-danger,
.btn-outline-secondary {
  border-radius: 6px;
  font-weight: 500;
}
.input-group-text {
  border-radius: 8px 0 0 8px;
}
.form-control {
  border-radius: 0 8px 8px 0;
}
</style>
