<script setup>
import { useUserStore } from "./stores/user.js";
import Footer from "./components/footer/Footer.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const store = useUserStore();
store.loadUser();

const route = useRoute();

// ✅ Opcional: mostrar/ocultar navbar y footer en rutas específicas
const showLayout = computed(() => !["/login", "/register"].includes(route.path));
</script>

<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- Navbar visible en todas las páginas excepto login/register -->
    <Navbar v-if="showLayout" />

    <!-- Contenido dinámico del router -->
    <main class="flex-grow-1">
      <router-view />
    </main>

    <!-- Footer visible en todas las páginas excepto login/register -->
    <Footer v-if="showLayout" />
  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
}
</style>
