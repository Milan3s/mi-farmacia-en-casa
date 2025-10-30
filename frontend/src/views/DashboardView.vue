<script setup>
import Navbar from "../components/navbar/Navbar.vue";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const dashboard = ref(null);
const router = useRouter();
const loading = ref(true);

// =====================================================
// Usuario logueado y rol actual (ajustado a "rol")
// =====================================================
const user = JSON.parse(localStorage.getItem("user")) || null;
const userRoleId = user?.rol?._id || null;
const userRoleName = user?.rol?.name?.toLowerCase() || "";

// =====================================================
// Cargar dashboard desde la API
// =====================================================
const loadDashboard = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/dashboard");
    const data = await res.json();
    if (data.dashboard) {
      dashboard.value = data.dashboard;
    } else {
      console.warn("⚠️ No se encontró ningún dashboard en la base de datos.");
    }
  } catch (error) {
    console.error("❌ Error al cargar el dashboard:", error);
  } finally {
    loading.value = false;
  }
};

// =====================================================
// Filtro de cards según permisos del rol actual
// =====================================================
const filteredCards = computed(() => {
  if (!dashboard.value?.cards) return [];

  // Si es administrador, muestra todo
  if (userRoleName === "administrador") return dashboard.value.cards;

  // Si no tiene rol asignado, no muestra nada
  if (!userRoleId) return [];

  // Filtrar según los permisos
  return dashboard.value.cards.filter((card) => {
    if (!Array.isArray(card.permissions)) return false;
    return card.permissions.some((perm) => {
      const permId = typeof perm === "object" ? perm._id : perm;
      return permId === userRoleId;
    });
  });
});

// =====================================================
// Navegar si la card tiene ruta asociada
// =====================================================
const handleCardClick = (card) => {
  if (card.path) router.push(card.path);
};

onMounted(() => {
  if (!user) {
    router.push("/login");
    return;
  }
  loadDashboard();
});
</script>

<template>
  <div>
    <Navbar />

    <div class="container py-5 dashboard-container">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fa-solid fa-spinner fa-spin fa-2x mb-3"></i>
        <p>Cargando dashboard...</p>
      </div>

      <!-- Dashboard principal -->
      <div v-else-if="dashboard" class="fade-in">
        <!-- Cabecera -->
        <div class="text-center mb-4">
          <h2 class="fw-bold mb-2">
            <i class="fa-solid fa-tachometer-alt me-2"></i>
            {{ dashboard.name }}
          </h2>
          <div class="separator mx-auto mb-3"></div>
          <p class="text-muted fs-6">
            Panel principal de administración del sistema
          </p>
        </div>

        <!-- Cards -->
        <div v-if="filteredCards.length > 0" class="cards-grid">
          <div v-for="card in filteredCards" :key="card._id" class="card shadow-sm text-center clickable-card"
            @click="handleCardClick(card)">
            <div class="card-body d-flex flex-column align-items-center justify-content-center">
              <i v-if="card.icon" :class="[card.icon, 'fa-3x', 'mb-3']" :style="{ color: card.color || '#0d6efd' }"></i>
              <h5 class="card-title fw-semibold mb-1">{{ card.title }}</h5>
              <p class="text-muted small mt-2 mb-0">
                {{ card.description || "Sin descripción disponible" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sin permisos -->
        <div v-else class="text-center text-muted py-5">
          <i class="fa-solid fa-lock fa-2x mb-3"></i>
          <p class="fw-semibold">
            No tienes permisos para acceder a ningún módulo del sistema.
          </p>
        </div>
      </div>

      <!-- Sin dashboard -->
      <div v-else class="text-center py-5 text-muted">
        <i class="fa-solid fa-exclamation-circle fa-2x mb-3"></i>
        <p>No hay dashboard disponible en este momento.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  margin-top: 180px;
}

/* Animación */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Línea decorativa */
.separator {
  width: 90px;
  height: 3px;
  background-color: var(--bs-primary);
  border-radius: 3px;
  margin: 0 auto;
}

/* Cuadrícula centrada */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  max-width: 700px;
  margin: 0 auto;
}

/* Card */
.card {
  border-radius: 14px;
  transition: all 0.25s ease-in-out;
  background-color: #fff;
  min-height: 160px;
  padding: 20px 16px;
}

/* Hover */
.clickable-card {
  cursor: pointer;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

/* Iconos */
.card i {
  transition: transform 0.25s ease-in-out;
}

.clickable-card:hover i {
  transform: scale(1.1);
}
</style>
