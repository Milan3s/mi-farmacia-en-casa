<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const props = defineProps({
  rolId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["rolEditado", "cerrarFormulario"]);

const name = ref("");
const description = ref("");
const message = ref("");
const isError = ref(false);
const showAlert = ref(false);
const loading = ref(false);
const cargandoDatos = ref(true);

const fetchRol = async () => {
  if (!props.rolId) return;
  cargandoDatos.value = true;
  try {
    const response = await axios.get(`http://localhost:5000/api/roles/${props.rolId}`);
    const rol = response.data;
    name.value = rol.name || "";
    description.value = rol.description || "";
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    message.value = "Error al cargar los datos del rol.";
    isError.value = true;
    showAlert.value = true;
  } finally {
    cargandoDatos.value = false;
  }
};

onMounted(fetchRol);

watch(
  () => props.rolId,
  async (newId) => {
    if (newId) await fetchRol();
  }
);

const handleSubmit = async () => {
  message.value = "";
  showAlert.value = false;

  if (!name.value || !description.value) {
    message.value = "Todos los campos son obligatorios.";
    isError.value = true;
    showAlert.value = true;
    return;
  }

  loading.value = true;

  try {
    await axios.put(`http://localhost:5000/api/roles/${props.rolId}`, {
      name: name.value.trim(),
      description: description.value.trim(),
    });

    emit("rolEditado");

    message.value = "Rol actualizado correctamente.";
    isError.value = false;
    showAlert.value = true;
  } catch (error) {
    isError.value = true;
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else {
      message.value = "Error al actualizar el rol.";
    }
    showAlert.value = true;
  } finally {
    loading.value = false;
  }
};

const closeAlert = () => {
  showAlert.value = false;
};

const cerrarFormulario = () => {
  emit("cerrarFormulario");
};
</script>

<template>
  <div class="editar-rol p-3 bg-white shadow-sm border rounded">
    <h5 class="fw-bold text-center text-primary mb-3">
      <i class="fas fa-user-shield me-2"></i>Editar Rol
    </h5>
    <hr class="divider mx-auto" />

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
      <i :class="isError ? 'fas fa-times-circle me-2' : 'fas fa-check-circle me-2'"></i>
      {{ message }}
      <button type="button" class="btn-close" @click="closeAlert"></button>
    </div>

    <div v-if="cargandoDatos" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Cargando datos...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label class="form-label fw-semibold">
          <i class="fas fa-user-shield me-2"></i>Nombre del Rol
        </label>
        <input
          v-model="name"
          type="text"
          class="form-control"
          placeholder="Introduce el nombre del rol"
          required
        />
      </div>

      <div class="mb-4">
        <label class="form-label fw-semibold">
          <i class="fas fa-align-left me-2"></i>Descripción
        </label>
        <textarea
          v-model="description"
          class="form-control"
          rows="3"
          placeholder="Describe brevemente la función del rol"
          required
        ></textarea>
      </div>

      <div class="d-flex justify-content-between">
        <button
          type="button"
          class="btn btn-secondary w-50 me-2 d-flex align-items-center justify-content-center"
          @click="cerrarFormulario"
        >
          <i class="fas fa-times me-2"></i>Cancelar
        </button>

        <button
          type="submit"
          class="btn btn-primary w-50 d-flex align-items-center justify-content-center"
          :disabled="loading"
        >
          <i v-if="!loading" class="fas fa-save me-2"></i>
          <div
            v-else
            class="spinner-border spinner-border-sm me-2 text-light"
            role="status"
          ></div>
          {{ loading ? "Guardando..." : "Guardar Cambios" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.editar-rol {
  min-height: 400px;
}
.divider {
  width: 70px;
  border: 2px solid #0d6efd;
  opacity: 0.9;
  margin-top: 6px;
  margin-bottom: 20px;
}
.form-control,
.form-select {
  border-radius: 8px;
  padding: 10px;
}
.btn {
  border-radius: 8px;
  font-weight: 500;
}
.alert {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}
.btn-close {
  float: right;
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
