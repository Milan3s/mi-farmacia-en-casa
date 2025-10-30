import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// Importar estilos globales
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

const app = createApp(App);

// 🚫 Desactivar herramientas de depuración de Vue en producción
if (process.env.NODE_ENV === "production") {
  app.config.devtools = false;
  app.config.performance = false;
  app.config.warnHandler = () => null; // Opcional: oculta warnings en consola
}

app.use(createPinia());
app.use(router);
app.mount("#app");
