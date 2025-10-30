<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// Emitir evento al padre cuando se agregue un usuario
const emit = defineEmits(["usuarioCreado"]);

const name = ref("");
const email = ref("");
const password = ref("");
const rolId = ref("");
const roles = ref([]);

const message = ref("");
const isError = ref(false);
const loading = ref(false);
const showAlert = ref(false);

// Cargar roles dinámicamente
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/roles");
    roles.value = response.data;
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
  }
});

const handleSubmit = async () => {
  message.value = "";
  showAlert.value = false;

  if (!name.value || !email.value || !password.value || !rolId.value) {
    message.value = "Todos los campos son obligatorios.";
    isError.value = true;
    showAlert.value = true;
    return;
  }

  loading.value = true;

  try {
    // Crear el usuario
    const createResponse = await axios.post("http://localhost:5000/api/users", {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value.trim(),
    });

    const newUserId = createResponse.data.user.id;

    // Asignar el rol al nuevo usuario
    await axios.post("http://localhost:5000/api/users/assign-role", {
      userId: newUserId,
      rolId: rolId.value,
    });

    // Emitir evento para refrescar el listado
    emit("usuarioCreado");

    // Mostrar mensaje de éxito
    message.value = "Usuario creado y rol asignado correctamente.";
    isError.value = false;
    showAlert.value = true;

    // Limpiar campos
    name.value = "";
    email.value = "";
    password.value = "";
    rolId.value = "";
  } catch (error) {
    isError.value = true;
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else {
      message.value = "Error al crear el usuario.";
    }
    showAlert.value = true;
  } finally {
    loading.value = false;
  }
};

const closeAlert = () => {
  showAlert.value = false;
};
</script>

<template>
  <div class="agregar-usuario p-3 bg-white shadow-sm border rounded">
    <h5 class="fw-bold text-center text-primary mb-3">
      <i class="fas fa-user-plus me-2"></i>Agregar Usuario
    </h5>
    <hr class="divider mx-auto" />

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
      <i :class="isError ? 'fas fa-times-circle me-2' : 'fas fa-check-circle me-2'"></i>
      {{ message }}
      <button type="button" class="btn-close" @click="closeAlert"></button>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Nombre -->
      <div class="mb-3">
        <label class="form-label fw-semibold">
          <i class="fas fa-user me-2"></i>Nombre
        </label>
        <input
          v-model="name"
          type="text"
          class="form-control"
          placeholder="Introduce el nombre completo"
          required
        />
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label class="form-label fw-semibold">
          <i class="fas fa-envelope me-2"></i>Email
        </label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          placeholder="Introduce el correo electrónico"
          required
        />
      </div>

      <!-- Contraseña -->
      <div class="mb-3">
        <label class="form-label fw-semibold">
          <i class="fas fa-lock me-2"></i>Contraseña
        </label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          placeholder="Introduce la contraseña"
          required
        />
      </div>

      <!-- Rol -->
      <div class="mb-4">
        <label class="form-label fw-semibold">
          <i class="fas fa-user-shield me-2"></i>Rol
        </label>
        <select v-model="rolId" class="form-select" required>
          <option disabled value="">Selecciona un rol...</option>
          <option v-for="rol in roles" :key="rol._id" :value="rol._id">
            {{ rol.name }}
          </option>
        </select>
      </div>

      <!-- Botón -->
      <button
        type="submit"
        class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
        :disabled="loading"
      >
        <i v-if="!loading" class="fas fa-save me-2"></i>
        <div
          v-else
          class="spinner-border spinner-border-sm me-2 text-light"
          role="status"
        ></div>
        {{ loading ? "Guardando..." : "Guardar Usuario" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.agregar-usuario {
  min-height: 520px;
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
