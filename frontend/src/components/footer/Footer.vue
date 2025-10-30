<script setup>
import { ref, onMounted } from "vue";

const year = ref(new Date().getFullYear());

// Actualiza el año automáticamente si cambia (por ejemplo, al cruzar año nuevo)
onMounted(() => {
  const checkYear = () => {
    const currentYear = new Date().getFullYear();
    if (currentYear !== year.value) year.value = currentYear;
  };
  setInterval(checkYear, 86400000); // cada 24h
});
</script>

<template>
  <footer class="bg-dark text-white py-3 mt-auto shadow-sm">
    <div class="container text-center small">
      <p class="mb-0">
        Desarrollado por <strong>David Milanés</strong> — Todos los derechos reservados © {{ year }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  position: relative;
  bottom: 0;
  width: 100%;
  font-size: 0.9rem;
}
</style>
