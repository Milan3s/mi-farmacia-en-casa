<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Navbar from "../../navbar/Navbar.vue";
import Agregar from "./Agregar.vue";
import Ver from "./Ver.vue";
import Editar from "./Editar.vue";
import Eliminar from "./Eliminar.vue";

// =============================================================
// 🔧 Variables principales
// =============================================================
const API_URL = "http://localhost:5000";
const medicinas = ref([]);
const loading = ref(true);
const error = ref("");
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(6);

// Modales
const showAgregarForm = ref(false);
const showVerModal = ref(false);
const showEditarModal = ref(false);
const showEliminarModal = ref(false);

// Datos seleccionados
const medicinaSeleccionada = ref(null);

// =============================================================
// 🔔 Alertas globales
// =============================================================
const globalMessage = ref("");
const globalIsError = ref(false);
const showGlobalAlert = ref(false);

const showMessage = (msg, isError = false) => {
  globalMessage.value = msg;
  globalIsError.value = isError;
  showGlobalAlert.value = true;
  setTimeout(() => (showGlobalAlert.value = false), 3000);
};

// =============================================================
// 🔄 Cargar Medicinas
// =============================================================
const fetchMedicinas = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get(`${API_URL}/api/inventario`);
    medicinas.value = res.data.medicinas || res.data;
  } catch (err) {
    console.error("❌ Error al cargar medicinas:", err);
    error.value = "Error al obtener las medicinas del servidor.";
  } finally {
    loading.value = false;
  }
};

// =============================================================
// 📷 Función para obtener ruta absoluta de imagen
// =============================================================
const getImageUrl = (foto) => {
  if (!foto) return `${API_URL}/uploads/default.png`;
  if (foto.startsWith("http")) return foto;
  if (foto.startsWith("/uploads") || foto.startsWith("uploads"))
    return `${API_URL}/${foto.replace(/^\/?/, "")}`;
  return `${API_URL}/uploads/${foto}`;
};

// =============================================================
// 💶 Formatear precios
// =============================================================
const formatPrice = (value) => {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
};

// =============================================================
// ✏️ Acciones
// =============================================================
const verMedicina = (medicina) => {
  medicinaSeleccionada.value = medicina;
  showVerModal.value = true;
};
const editarMedicina = (medicina) => {
  medicinaSeleccionada.value = medicina;
  showEditarModal.value = true;
};
const eliminarMedicina = (medicina) => {
  medicinaSeleccionada.value = medicina;
  showEliminarModal.value = true;
};

// Modales
const abrirAgregar = () => (showAgregarForm.value = true);
const cerrarAgregar = () => (showAgregarForm.value = false);
const cerrarVer = () => (showVerModal.value = false);
const cerrarEditar = () => (showEditarModal.value = false);
const cerrarEliminar = () => (showEliminarModal.value = false);

// =============================================================
// 🔍 Filtros y paginado
// =============================================================
const filteredMedicinas = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  return medicinas.value.filter(
    (m) =>
      m.nombre.toLowerCase().includes(q) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
      (m.proveedor && m.proveedor.toLowerCase().includes(q))
  );
});

const totalMedicinas = computed(() => filteredMedicinas.value.length);
const totalPages = computed(() => Math.ceil(totalMedicinas.value / perPage.value));

const paginatedMedicinas = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredMedicinas.value.slice(start, start + perPage.value);
});

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

onMounted(fetchMedicinas);
</script>

<template>
  <div id="inventario-de-medicinas">
    <Navbar />

    <div class="inventario-box container">
      <div class="container py-5 text-center">
        <i class="fa-solid fa-capsules text-success fs-1 mb-2"></i>
        <h2 class="fw-bold text-success">Inventario de Medicinas</h2>
        <hr class="divider mx-auto" />
        <p class="text-muted fs-6">
          Consulta, busca y administra las medicinas registradas en el sistema.
        </p>
      </div>

      <!-- Botón + Buscador -->
      <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <button class="btn btn-success fw-semibold" @click="abrirAgregar">
          <i class="fa-solid fa-plus me-2"></i>Agregar medicina
        </button>

        <div class="search-box flex-grow-1" style="max-width: 450px;">
          <div class="input-group">
            <span class="input-group-text bg-light">
              <i class="fas fa-search text-secondary"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre, descripción o proveedor..."
            />
          </div>
        </div>
      </div>

      <!-- ✅ Alerta global -->
      <div
        v-if="showGlobalAlert"
        :class="[
          'alert',
          'alert-dismissible',
          'fade',
          'show',
          globalIsError ? 'alert-danger' : 'alert-success',
        ]"
        role="alert"
      >
        <i
          :class="globalIsError
            ? 'fas fa-times-circle me-2'
            : 'fas fa-check-circle me-2'"
        ></i>
        {{ globalMessage }}
        <button type="button" class="btn-close" @click="showGlobalAlert = false"></button>
      </div>

      <!-- Tabla -->
      <table class="table table-bordered align-middle text-center mb-4">
        <thead class="table-success">
          <tr>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Proveedor</th>
            <th>Fecha Compra</th>
            <th>Fecha Caducidad</th>
            <th>Cantidad</th>
            <th>Precio Total (€)</th>
            <th>Precio Unidad (€)</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="text-center py-4">
              <div class="spinner-border text-success" role="status"></div>
            </td>
          </tr>

          <tr v-else-if="error">
            <td colspan="10" class="text-center text-danger fw-semibold">{{ error }}</td>
          </tr>

          <tr v-else-if="filteredMedicinas.length === 0">
            <td colspan="10" class="text-center text-muted">
              <i class="fa-solid fa-circle-exclamation me-2"></i>No se encontraron medicinas.
            </td>
          </tr>

          <tr v-for="m in paginatedMedicinas" :key="m._id">
            <td>
              <img
                :src="getImageUrl(m.foto)"
                @error="(e) => (e.target.src = `${API_URL}/uploads/default.png`)"
                alt="foto medicina"
                class="img-fluid"
                style="max-height: 90px; object-fit: contain;"
              />
            </td>
            <td class="fw-semibold">{{ m.nombre }}</td>
            <td class="text-muted small">{{ m.descripcion }}</td>
            <td>{{ m.proveedor || "—" }}</td>
            <td class="text-success fw-semibold">
              {{ new Date(m.fecha_compra).toLocaleDateString() }}
            </td>
            <td class="text-danger fw-semibold">
              {{ new Date(m.fecha_caducidad).toLocaleDateString() }}
            </td>
            <td>
              <span
                class="fw-bold"
                :class="{
                  'text-danger': m.cantidad < 20,
                  'text-warning': m.cantidad < 50 && m.cantidad >= 20,
                  'text-success': m.cantidad >= 50,
                }"
              >
                {{ m.cantidad }}
              </span>
            </td>
            <td class="fw-semibold text-success">{{ formatPrice(m.precio) }}</td>
            <td class="fw-semibold text-primary">{{ formatPrice(m.precio_por_unidad) }}</td>
            <td>
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-outline-info" title="Ver" @click="verMedicina(m)">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" title="Editar" @click="editarMedicina(m)">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Eliminar" @click="eliminarMedicina(m)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginado -->
      <nav v-if="!loading && totalPages > 1" class="d-flex justify-content-center mt-3">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(1)">Primero</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)">Anterior</button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(currentPage + 1)">Siguiente</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(totalPages)">Último</button>
          </li>
        </ul>
      </nav>

      <div class="text-center text-muted mt-2 small">
        Mostrando {{ (currentPage - 1) * perPage + 1 }} –
        {{ Math.min(currentPage * perPage, totalMedicinas) }} de {{ totalMedicinas }} medicinas
      </div>
    </div>

    <!-- Modales -->
    <Agregar
      v-if="showAgregarForm"
      @cerrarModal="cerrarAgregar"
      @medicinaCreada="() => { fetchMedicinas(); cerrarAgregar(); showMessage('Medicina agregada correctamente.'); }"
    />
    <Ver v-if="showVerModal" :medicina="medicinaSeleccionada" @cerrarModal="cerrarVer" />
    <Editar
      v-if="showEditarModal"
      :medicina="medicinaSeleccionada"
      @cerrarModal="cerrarEditar"
      @medicinaEditada="() => { fetchMedicinas(); cerrarEditar(); showMessage('Medicina actualizada correctamente.'); }"
    />
    <Eliminar
      v-if="showEliminarModal"
      :medicina="medicinaSeleccionada"
      @cerrarModal="cerrarEliminar"
      @medicinaEliminada="() => { fetchMedicinas(); cerrarEliminar(); showMessage('Medicina eliminada correctamente.'); }"
    />
  </div>
</template>

<style scoped>
.divider {
  width: 90px;
  height: 3px;
  background-color: #198754;
  border-radius: 3px;
}

.inventario-box {
  max-width: 1150px;
  margin-top: 76px;
}

.table th,
.table td {
  vertical-align: middle;
  font-size: 0.9rem;
}

img {
  display: block;
  margin: 0 auto;
}

.page-link {
  cursor: pointer;
  user-select: none;
}

.btn-outline-primary,
.btn-outline-danger,
.btn-outline-info {
  width: 34px;
  height: 34px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.alert {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
