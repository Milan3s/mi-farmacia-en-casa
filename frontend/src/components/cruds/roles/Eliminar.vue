<script setup>
import { ref } from "vue";
import axios from "axios";

const props = defineProps({
  rolId: { type: String, required: true },
  rolName: { type: String, required: true },
});

const emit = defineEmits(["rolEliminado", "cancelar"]);

const loading = ref(false);
const message = ref("");

const handleEliminar = async () => {
  loading.value = true;
  message.value = "";

  try {
    await axios.delete(`http://localhost:5000/api/roles/${props.rolId}`);
    message.value = "✅ Rol eliminado correctamente";
    emit("rolEliminado");
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    message.value = "❌ Error al eliminar el rol";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="eliminar-rol d-flex flex-column justify-content-center align-items-center text-center bg-white shadow-sm border rounded p-4">
    <div class="content" style="max-width: 90%; width: 100%;">
      <h5 class="fw-bold text-danger mb-3">
        <i class="fas fa-trash-alt me-2"></i>Eliminar Rol
      </h5>
      <hr class="divider mx-auto" />

      <p class="text-muted mb-4">
        ¿Estás seguro de que deseas eliminar el rol <br />
        <strong class="text-dark">{{ rolName }}</strong>?<br />
        Esta acción <span class="fw-semibold text-danger">no se puede deshacer.</span>
      </p>

      <div v-if="message" class="alert mt-3" :class="message.includes('✅') ? 'alert-success' : 'alert-danger'">
        {{ message }}
      </div>

      <div class="d-flex justify-content-center gap-3 mt-4">
        <button
          class="btn btn-secondary d-flex align-items-center justify-content-center"
          @click="emit('cancelar')"
          :disabled="loading"
        >
          <i class="fas fa-times me-2"></i>Cancelar
        </button>

        <button
          class="btn btn-danger d-flex align-items-center justify-content-center"
          @click="handleEliminar"
          :disabled="loading"
        >
          <i v-if="!loading" class="fas fa-trash me-2"></i>
          <div v-else class="spinner-border spinner-border-sm text-light me-2"></div>
          {{ loading ? "Eliminando..." : "Eliminar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eliminar-rol {
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.divider {
  width: 70px;
  border: 2px solid #dc3545;
  opacity: 0.9;
  margin-top: 6px;
  margin-bottom: 20px;
}
.btn {
  border-radius: 8px;
  font-weight: 500;
  min-width: 120px;
}
.alert {
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>
