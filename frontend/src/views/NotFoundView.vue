<template>
  <div id="notfound-container" class="container d-flex justify-content-center align-items-center">
    <div class="card shadow-lg text-center p-5 notfound-card">
      <div class="mb-3">
        <i class="fas fa-exclamation-triangle text-warning fa-4x"></i>
      </div>
      <h1 class="display-5 fw-bold text-dark">404</h1>
      <h4 class="text-secondary mb-3">Página no encontrada</h4>
      <p class="text-muted mb-4">
        La página que intentas acceder no existe o fue movida.
      </p>

      <router-link to="/login" class="btn btn-primary">
        <i class="fas fa-home me-2"></i>Volver al inicio
      </router-link>
    </div>
  </div>
</template>

<style scoped>
#notfound-container {
  height: 100vh;
}

.notfound-card {
  max-width: 450px;
  border-radius: 14px;
  background-color: #ffffff;
}
</style>
