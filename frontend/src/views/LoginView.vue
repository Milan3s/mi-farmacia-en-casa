<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user.js";

const name = ref("");
const password = ref("");
const message = ref("");
const loading = ref(false);
const router = useRouter();
const store = useUserStore();

const handleLogin = async () => {
  message.value = "";
  loading.value = true;

  try {
    const response = await axios.post("http://localhost:5000/api/users/login", {
      name: name.value.trim(),
      password: password.value.trim(),
    });

    if (response.data && response.data.success) {
      store.login(response.data.user);
      message.value = "✅ Inicio de sesión correcto";
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      message.value = "❌ Credenciales incorrectas";
    }
  } catch (error) {
    console.error("❌ Error en el login:", error);

    if (error.response?.status === 404) {
      message.value = "❌ Usuario no encontrado";
    } else if (error.response?.status === 401) {
      message.value = "❌ Contraseña incorrecta";
    } else {
      message.value = "❌ Error al conectar con el servidor";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div id="login-container" class="container d-flex justify-content-center align-items-start">
    <div class="card shadow-lg p-4 login-card">
      <div class="text-center mb-3">
        <i class="fas fa-user-lock fa-3x text-primary mb-2"></i>
        <h4 class="fw-bold text-dark">Iniciar Sesión</h4>
      </div>

      <div class="mb-3">
        <label for="name" class="form-label fw-semibold">
          <i class="fas fa-user me-2"></i>Nombre de usuario
        </label>
        <input
          v-model="name"
          type="text"
          id="name"
          class="form-control"
          placeholder="Introduce tu nombre"
          autocomplete="username"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label fw-semibold">
          <i class="fas fa-lock me-2"></i>Contraseña
        </label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="form-control"
          placeholder="Introduce tu contraseña"
          autocomplete="current-password"
        />
      </div>

      <button
        @click="handleLogin"
        :disabled="loading"
        class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
      >
        <i v-if="!loading" class="fas fa-sign-in-alt me-2"></i>
        <div
          v-else
          class="spinner-border spinner-border-sm me-2 text-light"
          role="status"
        ></div>
        {{ loading ? "Verificando..." : "Entrar" }}
      </button>

      <p
        v-if="message"
        class="mt-3 text-center"
        :class="message.includes('❌') ? 'text-danger' : 'text-success'"
      >
        {{ message }}
      </p>

      <div class="text-center mt-3">
        <router-link to="/register" class="text-decoration-none">
          ¿No tienes cuenta? <strong>Regístrate</strong>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor general */
#login-container {
  margin-top: 369px; 
}

/* Card del login */
.login-card {
  max-width: 400px;
  width: 100%;
  border-radius: 12px;
  background-color: #ffffff;
}

/* Inputs */
.form-control {
  border-radius: 8px;
  padding: 10px;
}

/* Botón */
.btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Enlace */
a {
  color: #0d6efd;
}

a:hover {
  text-decoration: underline;
}
</style>
