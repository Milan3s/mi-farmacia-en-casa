<script setup>
import { ref } from "vue";
import axios from "axios";

const props = defineProps({
  medicina: { type: Object, required: true },
});

const emit = defineEmits(["medicinaEliminada", "cerrarModal"]);

const loading = ref(false);
const message = ref("");
const isError = ref(false);
const showAlert = ref(false);

const handleEliminar = async () => {
  loading.value = true;
  message.value = "";
  showAlert.value = false;

  try {
    await axios.delete(`http://localhost:5000/api/inventario/${props.medicina._id}`);
    message.value = "✅ Medicina eliminada correctamente.";
    isError.value = false;
    showAlert.value = true;

    emit("medicinaEliminada");

    // Cierra el modal con un pequeño delay
    setTimeout(() => emit("cerrarModal"), 1200);
  } catch (error) {
    console.error("❌ Error al eliminar medicina:", error);
    message.value = error.response?.data?.message || "❌ Error al eliminar la medicina.";
    isError.value = true;
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
    style="background-color: rgba(0,0,0,0.45);"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title fw-semibold">
            <i class="fa-solid fa-trash-can me-2"></i>Eliminar Medicina
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="emit('cerrarModal')"
          ></button>
        </div>

        <div class="modal-body text-center">
          <!-- ✅ Alerta dinámica -->
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
              :class="isError ? 'fas fa-times-circle me-2' : 'fas fa-check-circle me-2'"
            ></i>
            {{ message }}
            <button type="button" class="btn-close" @click="closeAlert"></button>
          </div>

          <i class="fa-solid fa-triangle-exclamation fa-3x text-danger mb-3"></i>
          <h5 class="fw-bold text-danger">¿Eliminar esta medicina?</h5>

          <p class="text-muted mt-2">
            Estás a punto de eliminar <br />
            <strong class="text-dark">{{ props.medicina.nombre }}</strong>.
            <br />
            Esta acción <span class="fw-semibold text-danger">no se puede deshacer.</span>
          </p>

          <div class="d-flex justify-content-center gap-3 mt-4">
            <button
              class="btn btn-secondary px-4"
              @click="emit('cerrarModal')"
              :disabled="loading"
            >
              <i class="fa-solid fa-xmark me-2"></i>Cancelar
            </button>

            <button
              class="btn btn-danger px-4"
              @click="handleEliminar"
              :disabled="loading"
            >
              <i v-if="!loading" class="fa-solid fa-trash me-2"></i>
              <div
                v-else
                class="spinner-border spinner-border-sm text-light me-2"
                role="status"
              ></div>
              {{ loading ? "Eliminando..." : "Eliminar" }}
            </button>
          </div>
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

.btn {
  border-radius: 8px;
  font-weight: 500;
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
