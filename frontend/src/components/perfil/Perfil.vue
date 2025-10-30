<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Navbar from "../navbar/Navbar.vue";
import { useUserStore } from "../../stores/user.js";

const store = useUserStore();
const userData = ref(null);
const loading = ref(true);
const error = ref("");

// =====================================================
// Cargar datos del usuario logueado desde backend
// =====================================================
onMounted(async () => {
  try {
    if (!store.user?.id) {
      error.value = "No se encontró información del usuario autenticado.";
      loading.value = false;
      return;
    }

    const response = await axios.get(`http://localhost:5000/api/users/${store.user.id}`);
    userData.value = response.data;
  } catch (err) {
    console.error("❌ Error al obtener perfil:", err);
    error.value = "Error al cargar el perfil del usuario.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <Navbar />

    <div class="container mt-5">
      <h2 class="text-center mb-4 text-primary fw-bold">
        <i class="fas fa-user me-2"></i>Perfil del Usuario
      </h2>

      <!-- Estado de carga -->
      <div v-if="loading" class="text-center mt-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Cargando información...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger text-center">
        {{ error }}
      </div>

      <!-- Perfil -->
      <div v-else-if="userData" class="card mx-auto shadow-sm border-0" style="max-width: 500px;">
        <div class="card-body text-center p-4">
          <i class="fas fa-user-circle fa-5x text-secondary mb-3"></i>
          <h4 class="fw-semibold text-dark mb-1">{{ userData.name }}</h4>
          <p class="text-muted mb-3">{{ userData.email }}</p>

          <div v-if="userData.rol">
            <span
              class="badge px-3 py-2"
              :class="userData.rol.isAdmin ? 'bg-danger' : 'bg-success'"
            >
              {{ userData.rol.name }}
            </span>
            <p class="mt-2 small text-muted">
              {{ userData.rol.description || "Sin descripción asignada" }}
            </p>
          </div>

          <div v-else>
            <span class="badge bg-secondary px-3 py-2">Sin rol asignado</span>
          </div>

          <hr class="my-4" />

          <p class="small text-muted mb-0">
            <i class="fas fa-calendar-alt me-2"></i>
            Miembro desde:
            <strong>{{ new Date(userData.createdAt).toLocaleDateString() }}</strong>
          </p>
        </div>
      </div>

      <!-- Si no hay datos -->
      <div v-else class="text-center text-muted mt-5">
        <i class="fas fa-user-slash fa-2x mb-3"></i>
        <p>No se encontró información del usuario.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-weight: 600;
  font-size: 1.8rem;
}
.card {
  border-radius: 12px;
  background-color: #ffffff;
}
.badge {
  font-size: 0.95rem;
}
</style>
