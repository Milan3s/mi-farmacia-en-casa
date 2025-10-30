<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const props = defineProps({
  medicina: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["cerrarModal", "medicinaEditada"]);

const API_URL = "http://localhost:5000";

// Campos
const nombre = ref("");
const descripcion = ref("");
const proveedor = ref("");
const fecha_compra = ref("");
const fecha_caducidad = ref("");
const cantidad = ref(0);
const precio = ref(0);
const precio_por_unidad = ref(0);
const foto = ref(null);
const previewUrl = ref("");

// Estados UI
const message = ref("");
const isError = ref(false);
const showAlert = ref(false);
const loading = ref(false);

// ============================================================
// 🔄 Cargar datos del medicamento al abrir el modal
// ============================================================
watch(
  () => props.medicina,
  (m) => {
    if (m) {
      nombre.value = m.nombre || "";
      descripcion.value = m.descripcion || "";
      proveedor.value = m.proveedor || "";
      fecha_compra.value = m.fecha_compra?.slice(0, 10) || "";
      fecha_caducidad.value = m.fecha_caducidad?.slice(0, 10) || "";
      cantidad.value = m.cantidad || 0;
      precio.value = m.precio || 0;
      precio_por_unidad.value = m.precio_por_unidad || 0;
      foto.value = null;
      previewUrl.value = m.foto
        ? `${API_URL}/uploads/${m.foto}`
        : `${API_URL}/uploads/default.png`;
    }
  },
  { immediate: true }
);

// ============================================================
// 📸 Manejar cambio de archivo y previsualización
// ============================================================
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    foto.value = file;
    previewUrl.value = URL.createObjectURL(file);
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
// 💾 Guardar cambios (usando POST + _method=PUT por compatibilidad con multer)
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
    cantidad.value < 0 ||
    precio.value < 0
  ) {
    message.value = "Por favor completa todos los campos correctamente.";
    isError.value = true;
    showAlert.value = true;
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append("nombre", nombre.value);
    formData.append("descripcion", descripcion.value);
    formData.append("proveedor", proveedor.value);
    formData.append("fecha_compra", fecha_compra.value);
    formData.append("fecha_caducidad", fecha_caducidad.value);
    formData.append("cantidad", cantidad.value);
    formData.append("precio", precio.value);
    formData.append("precio_por_unidad", precio_por_unidad.value);
    if (foto.value) formData.append("foto", foto.value);

    // ⚙️ Usamos POST con _method=PUT para que multer acepte archivos
    await axios.post(
      `${API_URL}/api/inventario/${props.medicina._id}?_method=PUT`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    message.value = "✅ Medicina actualizada correctamente.";
    isError.value = false;
    showAlert.value = true;

    emit("medicinaEditada");
    setTimeout(() => emit("cerrarModal"), 1200);
  } catch (error) {
    console.error("❌ Error al actualizar medicina:", error);
    isError.value = true;
    message.value =
      error.response?.data?.message || "Error al actualizar la medicina.";
    showAlert.value = true;
  } finally {
    loading.value = false;
  }
};

const closeAlert = () => (showAlert.value = false);
</script>

<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    style="background-color: rgba(0, 0, 0, 0.5);"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <!-- Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-semibold">
            <i class="fa-solid fa-pen-to-square me-2"></i>Editar Medicina
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="emit('cerrarModal')"
          ></button>
        </div>

        <!-- Body -->
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
              :class="
                isError
                  ? 'fas fa-times-circle me-2'
                  : 'fas fa-check-circle me-2'
              "
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
                <input v-model="nombre" type="text" class="form-control" required />
              </div>

              <!-- Proveedor -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-industry me-2"></i>Proveedor
                </label>
                <input v-model="proveedor" type="text" class="form-control" required />
              </div>

              <!-- Descripción -->
              <div class="col-12">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-align-left me-2"></i>Descripción
                </label>
                <textarea v-model="descripcion" class="form-control" rows="2" required></textarea>
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
                <input v-model.number="cantidad" type="number" min="0" class="form-control" required />
              </div>

              <!-- Precio total -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">
                  <i class="fa-solid fa-euro-sign me-2"></i>Precio Total (€)
                </label>
                <input v-model.number="precio" type="number" min="0" step="0.01" class="form-control" required />
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
                  <i class="fa-solid fa-image me-2"></i>Cambiar foto (opcional)
                </label>
                <input @change="handleFileChange" type="file" class="form-control" accept="image/*" />
                <div class="mt-3 text-center">
                  <img
                    :src="previewUrl"
                    alt="Previsualización"
                    class="img-fluid rounded-3 border p-1 shadow-sm bg-white"
                    style="max-height: 150px; object-fit: contain;"
                    @error="(e) => {
                      if (!e.target.dataset.fallback) {
                        e.target.src = `${API_URL}/uploads/default.png`;
                        e.target.dataset.fallback = 'true';
                      }
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Botones -->
            <div class="text-end mt-4">
              <button type="button" class="btn btn-secondary me-2" @click="emit('cerrarModal')">
                <i class="fa-solid fa-xmark me-2"></i>Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <i v-if="!loading" class="fa-solid fa-floppy-disk me-2"></i>
                <div v-else class="spinner-border spinner-border-sm me-2 text-light" role="status"></div>
                {{ loading ? "Guardando..." : "Guardar Cambios" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-content {
  border-radius: 12px;
}

.alert {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

.form-control,
textarea {
  border-radius: 8px;
  padding: 10px;
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
