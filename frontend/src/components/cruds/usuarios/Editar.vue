<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

// Props: ID del usuario a editar
const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

// Emitir evento al padre cuando se actualiza un usuario
const emit = defineEmits(["usuarioEditado", "cerrarFormulario"]);

const name = ref("");
const email = ref("");
const password = ref("");
const rolId = ref("");
const roles = ref([]);
const message = ref("");
const isError = ref(false);
const showAlert = ref(false);
const loading = ref(false);
const cargandoDatos = ref(true);

// 🔄 Cargar roles dinámicamente
const fetchRoles = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/roles");
    roles.value = response.data;
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
  }
};

// 🔄 Cargar datos del usuario
const fetchUsuario = async () => {
  if (!props.userId) return;
  cargandoDatos.value = true;
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${props.userId}`);
    const user = response.data;
    name.value = user.name || "";
    email.value = user.email || "";
    rolId.value = user.rol?._id || "";
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    message.value = "Error al cargar los datos del usuario.";
    isError.value = true;
    showAlert.value = true;
  } finally {
    cargandoDatos.value = false;
  }
};

// Ejecutar al montar y cuando cambie el userId
onMounted(async () => {
  await fetchRoles();
  await fetchUsuario();
});

watch(
  () => props.userId,
  async (newId) => {
    if (newId) await fetchUsuario();
  }
);

// ✏️ Actualizar usuario
const handleSubmit = async () => {
  message.value = "";
  showAlert.value = false;

  if (!name.value || !email.value || !rolId.value) {
    message.value = "Todos los campos son obligatorios (excepto contraseña).";
    isError.value = true;
    showAlert.value = true;
    return;
  }

  loading.value = true;

  try {
    // 1️⃣ Actualizar nombre/email (y contraseña si la hay)
    const updateData = { name: name.value.trim(), email: email.value.trim() };
    if (password.value.trim()) updateData.password = password.value.trim();

    await axios.put(`http://localhost:5000/api/users/${props.userId}`, updateData);

    // 2️⃣ Asignar rol
    await axios.post("http://localhost:5000/api/users/assign-role", {
      userId: props.userId,
      rolId: rolId.value,
    });

    // 3️⃣ Emitir evento al padre
    emit("usuarioEditado");

    // 4️⃣ Mostrar éxito
    message.value = "Usuario actualizado correctamente.";
    isError.value = false;
    showAlert.value = true;
  } catch (error) {
    isError.value = true;
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else {
      message.value = "Error al actualizar el usuario.";
    }
    showAlert.value = true;
  } finally {
    loading.value = false;
  }
};

// Cerrar alerta manualmente
const closeAlert = () => {
  showAlert.value = false;
};

// Cerrar formulario desde botón
const cerrarFormulario = () => {
  emit("cerrarFormulario");
};
</script>

<template>
  <div class="agregar-usuario p-3 bg-white shadow-sm border rounded">
    <h5 class="fw-bold text-center text-primary mb-3">
      <i class="fas fa-user-edit me-2"></i>Editar Usuario
    </h5>
    <hr class="divider mx-auto" />

    <!-- Alerta dinámica -->
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

    <!-- Estado de carga -->
    <div v-if="cargandoDatos" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Cargando datos...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit">
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
          <i class="fas fa-lock me-2"></i>Nueva Contraseña
        </label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          placeholder="Deja vacío para no cambiarla"
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

      <!-- Botones -->
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
