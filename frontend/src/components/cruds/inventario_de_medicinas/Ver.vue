<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  medicina: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["cerrarModal"]);

// ✅ Computed seguro para construir la URL de imagen
const imagenMedicina = computed(() => {
  const foto = props.medicina?.foto;

  if (!foto) {
    // Si no tiene foto registrada
    return "http://localhost:5000/uploads/default.png";
  }

  // Si ya es una URL completa (por ejemplo, Cloudinary o base64)
  if (foto.startsWith("http")) {
    return foto;
  }

  // Si es un nombre de archivo almacenado en /uploads/
  return `http://localhost:5000/uploads/${foto}`;
});

// ✅ Manejador de error — reemplaza solo una vez
const handleImageError = (event) => {
  const img = event.target;
  if (!img.dataset.fallback) {
    img.src = "http://localhost:5000/uploads/default.png";
    img.dataset.fallback = "true"; // evita bucles infinitos
  }
};
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
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title fw-semibold">
            <i class="fa-solid fa-eye me-2"></i>Detalles de la Medicina
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="emit('cerrarModal')"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="row align-items-center">
            <!-- Datos -->
            <div class="col-md-7">
              <div class="mb-3">
                <label class="fw-semibold text-secondary">
                  <i class="fa-solid fa-capsules me-2"></i>Nombre:
                </label>
                <p class="mb-2 fs-6 fw-bold text-dark">
                  {{ medicina.nombre }}
                </p>
              </div>

              <div class="mb-3">
                <label class="fw-semibold text-secondary">
                  <i class="fa-solid fa-align-left me-2"></i>Descripción:
                </label>
                <p class="mb-2 text-muted">
                  {{ medicina.descripcion || "Sin descripción" }}
                </p>
              </div>

              <div class="mb-3">
                <label class="fw-semibold text-secondary">
                  <i class="fa-solid fa-industry me-2"></i>Proveedor:
                </label>
                <p class="mb-2">{{ medicina.proveedor || "—" }}</p>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <label class="fw-semibold text-secondary">
                    <i class="fa-solid fa-calendar-plus me-2"></i>Fecha de compra:
                  </label>
                  <p class="text-success fw-semibold">
                    {{
                      medicina.fecha_compra
                        ? new Date(medicina.fecha_compra).toLocaleDateString()
                        : "—"
                    }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="fw-semibold text-secondary">
                    <i class="fa-solid fa-calendar-xmark me-2"></i>Fecha de caducidad:
                  </label>
                  <p class="text-danger fw-semibold">
                    {{
                      medicina.fecha_caducidad
                        ? new Date(medicina.fecha_caducidad).toLocaleDateString()
                        : "—"
                    }}
                  </p>
                </div>
              </div>

              <div class="mt-3">
                <label class="fw-semibold text-secondary">
                  <i class="fa-solid fa-boxes-stacked me-2"></i>Cantidad disponible:
                </label>
                <p
                  class="fw-bold fs-5"
                  :class="{
                    'text-danger': medicina.cantidad < 20,
                    'text-warning': medicina.cantidad < 50 && medicina.cantidad >= 20,
                    'text-success': medicina.cantidad >= 50,
                  }"
                >
                  {{ medicina.cantidad ?? 0 }}
                </p>
              </div>
            </div>

            <!-- Imagen -->
            <div class="col-md-5 text-center">
              <img
                :src="imagenMedicina"
                alt="Foto de medicina"
                class="img-fluid rounded-3 border p-2 shadow-sm bg-white"
                style="max-height: 280px; object-fit: contain;"
                @error="handleImageError"
              />
              <p class="small text-muted mt-2">
                Imagen actual del producto
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="emit('cerrarModal')">
            <i class="fa-solid fa-xmark me-2"></i>Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-content {
  border-radius: 12px;
}
.modal-header {
  border-bottom: none;
}
.modal-footer {
  border-top: none;
}
label {
  font-size: 0.9rem;
}
p {
  margin-bottom: 0.25rem;
}
</style>
