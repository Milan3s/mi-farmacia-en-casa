<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user.js";
import { computed } from "vue";

const router = useRouter();
const store = useUserStore();

// Navegación
const goToProfile = () => router.push("/perfil");
const goToDashboard = () => router.push("/dashboard");
const goToUsuarios = () => router.push("/usuarios");
const goToRoles = () => router.push("/roles");
const goToInventario = () => router.push("/inventario");
const goToReportes = () => router.push("/reportes");

const handleLogout = () => {
  store.logout();
  router.push("/login");
};

// ============================================================
// Rol del usuario actual (del store o del localStorage)
// ============================================================
const user = computed(() => store.user || JSON.parse(localStorage.getItem("user")) || null);
const userRole = computed(() => user.value?.rol?.name?.toLowerCase() || "");

// ============================================================
// Control de menús según rol
// ============================================================
const isAdmin = computed(() => userRole.value === "administrador");
const isFarmaceutico = computed(() => userRole.value === "farmaceutico");
</script>

<template>
  <nav class="navbar navbar-dark bg-dark px-3 shadow-sm">
    <div class="container d-flex justify-content-between align-items-center">
      <!-- Logo -->
      <div class="d-flex align-items-center gap-2 bg-success px-3 py-2 rounded-3 shadow-sm text-white">
  <i class="fa-solid fa-pills fs-4"></i>
  <span class="fw-semibold fs-5">Mi Farmacia en Casa</span>
</div>





      <div class="d-flex align-items-center gap-3">
        <!-- Botón Dashboard -->
        <button class="btn btn-outline-light btn-sm" @click="goToDashboard">
          <i class="fas fa-tachometer-alt me-1"></i> Dashboard
        </button>

        <!-- Dropdown Opciones del Sistema -->
        <div v-if="isAdmin || isFarmaceutico" class="dropdown">
          <button
            class="btn btn-dark dropdown-toggle text-white"
            type="button"
            id="sistemaDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="fas fa-cogs me-2"></i>Opciones del Sistema
          </button>

          <ul class="dropdown-menu" aria-labelledby="sistemaDropdown">
            <!-- Menús solo para ADMIN -->
            <template v-if="isAdmin">
              <li>
                <button class="dropdown-item" @click="goToUsuarios">
                  <i class="fas fa-users me-2 text-primary"></i> Usuarios
                </button>
              </li>
              <li>
                <button class="dropdown-item" @click="goToRoles">
                  <i class="fas fa-user-shield me-2 text-primary"></i> Roles
                </button>
              </li>
              <li><hr class="dropdown-divider" /></li>
            </template>

            <!-- Menús compartidos (Admin + Farmacéutico) -->
            <li>
              <button class="dropdown-item" @click="goToInventario">
                <i class="fas fa-capsules me-2 text-success"></i> Inventario
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="goToReportes">
                <i class="fas fa-chart-line me-2 text-danger"></i> Reportes
              </button>
            </li>
          </ul>
        </div>

        <!-- Dropdown del usuario -->
        <div v-if="user" class="dropdown">
          <button
            class="btn btn-dark dropdown-toggle d-flex align-items-center text-white border-0"
            type="button"
            id="userMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="fas fa-user-circle me-2 fs-5"></i>
            {{ user?.name || "Usuario" }}
          </button>

          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
            <li>
              <button class="dropdown-item" @click="goToProfile">
                <i class="fas fa-id-badge me-2 text-primary"></i> Ver Perfil
              </button>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li>
              <button class="dropdown-item text-danger" @click="handleLogout">
                <i class="fas fa-sign-out-alt me-2"></i> Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1050;
}

.dropdown-menu {
  min-width: 200px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.dropdown-item i {
  width: 18px;
  text-align: center;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}
</style>
