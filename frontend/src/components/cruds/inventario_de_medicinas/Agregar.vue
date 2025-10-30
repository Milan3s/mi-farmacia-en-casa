<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const emit = defineEmits(["medicinaCreada", "cerrarModal"]);

const API_URL = "http://localhost:5000";

// Campos
const nombre = ref("");
const descripcion = ref("");
const proveedor = ref("");
const fecha_compra = ref("");
const fecha_caducidad = ref("");
const cantidad = ref("");
const precio = ref("");
const precio_por_unidad = ref(0);
const foto = ref(null);
const fotoPreview = ref(null);

// Estado UI
const message = ref("");
const isError = ref(false);
const showAlert = ref(false);
const loading = ref(false);

// ============================================================
// 📷 Previsualización de imagen
// ============================================================
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    foto.value = file;
    fotoPreview.value = URL.createObjectURL(file);
  }
};

// ============================================================
// 💰 Calcular precio por unidad automáticamente
// ============================================================
watch([precio, cantidad], () => {
  if (cantidad.value > 0 && precio.value >= 0) {
    precio_por_unidad.value = +(precio.value / cantidad.value).toFixed(2);
  } else {
    precio_por_unidad.value = 0;
  }
});

// ============================================================
// 💾 Enviar datos al backend
// ============================================================
const handleSubmit = async () => {
  showAlert.value = false;
  message.value = "";

  if (
    !nombre.value ||
    !descripcion.value ||
    !proveedor.value ||
    !fecha_compra.value ||
    !fecha_caducidad.value ||
    !cantidad.value ||
    !precio.value
  ) {
    isError.value = true;
    message.value = "Todos los campos son obligatorios.";
    showAlert.value = true;
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append("nombre", nombre.value.trim());
    formData.append("descripcion", descripcion.value.trim());
    formData.append("proveedor", proveedor.value.trim());
    formData.append("fecha_compra", fecha_compra.value);
    formData.append("fecha_caducidad", fecha_caducidad.value);
    formData.append("cantidad", cantidad.value);
    formData.append("precio", precio.value);
    formData.append("precio_por_unidad", precio_por_unidad.value);
    if (foto.value) formData.append("foto", foto.value);

    const response = await axios.post(`${API_URL}/api/inventario`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    emit("medicinaCreada", response.data.medicina);

    message.value = "✅ Medicina agregada correctamente.";
    isError.value = false;
    showAlert.value = true;

    // Limpiar formulario
    nombre.value = "";
    descripcion.value = "";
    proveedor.value = "";
    fecha_compra.value = "";
    fecha_caducidad.value = "";
    cantidad.value = "";
    precio.value = "";
    precio_por_unidad.value = 0;
    foto.value = null;
    fotoPreview.value = null;

    // Cerrar modal tras confirmación
    setTimeout(() => emit("cerrarModal"), 1200);
  } catch (error) {
    console.error("❌ Error al agregar medicina:", error);
    isError.value = true;
    message.value = error.response?.data?.message || "Error al agregar la medicina.";
    showAlert.value = true;
  } finally {
    loading.value = false;
  }
};

const closeAlert = () => (showAlert.value = false);
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.45);" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title fw-semibold">
            <i class="fa-solid fa-pills me-2"></i>Agregar Nueva Medicina
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="emit('cerrarModal')"></button>
        </div>

        <div class="modal-body">
          <!-- ✅ Alerta -->
          <div
            v-if="showAlert"
            :class="[
              'alert',
              'alert-dismissible',
              'fade',
              'show',
              isError ? 'alert-danger' : 'alert-success',
            ]"
            role="alert"
          >
            <i
              :class="isError
                ? 'fas fa-times-circle me-2'
                : 'fas fa-check-circle me-2'"
            ></i>
            {{ message }}
            <button type="button" class="btn-close" @click="closeAlert"></button>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
            <div class="row g-3">
              <!-- Nombre -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-capsules me-2"></i>Nombre
                </label>
                <input v-model="nombre" type="text" class="form-control" placeholder="Ej: Ibuprofeno" required />
              </div>

              <!-- Proveedor -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-industry me-2"></i>Proveedor
                </label>
                <input v-model="proveedor" type="text" class="form-control" placeholder="Ej: Laboratorios Cinfa" required />
              </div>

              <!-- Descripción -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-align-left me-2"></i>Descripción
                </label>
                <textarea
                  v-model="descripcion"
                  class="form-control"
                  placeholder="Descripción breve del medicamento..."
                  rows="2"
                  required
                ></textarea>
              </div>

              <!-- Fechas -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-calendar-plus me-2"></i>Fecha de compra
                </label>
                <input v-model="fecha_compra" type="date" class="form-control" required />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-calendar-xmark me-2"></i>Fecha de caducidad
                </label>
                <input v-model="fecha_caducidad" type="date" class="form-control" required />
              </div>

              <!-- Cantidad -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-boxes-stacked me-2"></i>Cantidad
                </label>
                <input v-model.number="cantidad" type="number" min="1" class="form-control" placeholder="Ej: 100" required />
              </div>

              <!-- Precio total -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-euro-sign me-2"></i>Precio Total (€)
                </label>
                <input v-model.number="precio" type="number" min="0" step="0.01" class="form-control" placeholder="Ej: 150.00" required />
              </div>

              <!-- Precio por unidad -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-tag me-2"></i>Precio por Unidad (€)
                </label>
                <input v-model="precio_por_unidad" type="number" class="form-control bg-light" readonly />
              </div>

              <!-- Imagen -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-image me-2"></i>Foto (opcional)
                </label>
                <input @change="handleFileChange" type="file" class="form-control" accept="image/*" />
                <div v-if="fotoPreview" class="mt-3 text-center">
                  <img :src="fotoPreview" alt="Vista previa" class="img-thumbnail rounded shadow-sm" style="max-height: 130px; object-fit: contain;" />
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="text-end mt-4">
              <button type="button" class="btn btn-secondary me-2" @click="emit('cerrarModal')">
                <i class="fa-solid fa-xmark me-2"></i>Cancelar
              </button>
              <button type="submit" class="btn btn-success" :disabled="loading">
                <i v-if="!loading" class="fa-solid fa-floppy-disk me-2"></i>
                <div v-else class="spinner-border spinner-border-sm me-2 text-light" role="status"></div>
                {{ loading ? "Guardando..." : "Guardar Medicina" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-control,
textarea {
  border-radius: 8px;
  padding: 10px;
}

.modal-content {
  border-radius: 12px;
}

.alert {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

.btn-close {
  font-size: 0.8rem;
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
