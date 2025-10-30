<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const name = ref("");
const email = ref("");
const password = ref("");
const message = ref("");
const loading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  message.value = "";

  if (!name.value || !email.value || !password.value) {
    message.value = "❌ Todos los campos son obligatorios";
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post("http://localhost:5000/api/users", {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value.trim(),
    });

    if (response.status === 201) {
      message.value = "✅ Usuario registrado correctamente";
      setTimeout(() => router.push("/login"), 1000);
    }
  } catch (error) {
    if (error.response?.status === 400) {
      message.value = "❌ El email o nombre ya están registrados";
    } else {
      message.value = "❌ Error al registrar el usuario";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div id="register-container" class="container d-flex justify-content-center align-items-start">
    <div class="card shadow-lg p-4 register-card">
      <div class="text-center mb-3">
        <i class="fas fa-user-plus fa-3x text-success mb-2"></i>
        <h4 class="fw-bold text-dark">Crear Cuenta</h4>
      </div>

      <div class="mb-3">
        <label for="name" class="form-label fw-semibold">
          <i class="fas fa-user me-2"></i>Nombre completo
        </label>
        <input v-model="name" type="text" id="name" class="form-control" placeholder="Introduce tu nombre" />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label fw-semibold">
          <i class="fas fa-envelope me-2"></i>Email
        </label>
        <input v-model="email" type="email" id="email" class="form-control" placeholder="Introduce tu correo" />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label fw-semibold">
          <i class="fas fa-lock me-2"></i>Contraseña
        </label>
        <input v-model="password" type="password" id="password" class="form-control"
          placeholder="Introduce tu contraseña" />
      </div>

      <button @click="handleRegister" :disabled="loading"
        class="btn btn-success w-100 d-flex align-items-center justify-content-center">
        <i v-if="!loading" class="fas fa-user-check me-2"></i>
        <div v-else class="spinner-border spinner-border-sm me-2 text-light" role="status"></div>
        {{ loading ? "Registrando..." : "Registrarse" }}
      </button>

      <p v-if="message" class="mt-3 text-center" :class="message.includes('❌') ? 'text-danger' : 'text-success'">
        {{ message }}
      </p>

      <div class="text-center mt-3">
        <router-link to="/login" class="text-decoration-none">
          ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor general */
#register-container {
  margin-top: 369px;
}

/* Card del registro */
.register-card {
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
