import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";
import NotFoundView from "../views/NotFoundView.vue";

// Componentes protegidos
import Perfil from "../components/perfil/Perfil.vue";
import UsuariosList from "../components/cruds/usuarios/List.vue";
import RolesList from "../components/cruds/roles/List.vue";
import InventarioList from "../components/cruds/inventario_de_medicinas/List.vue";
import ReportesList from "../components/cruds/reportes/ReporteInventario.vue"; // Nueva ruta

import { useUserStore } from "../stores/user.js";

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { requiresGuest: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/perfil",
    name: "perfil",
    component: Perfil,
    meta: { requiresAuth: true },
  },
  {
    path: "/usuarios",
    name: "usuarios",
    component: UsuariosList,
    meta: { requiresAuth: true },
  },
  {
    path: "/roles",
    name: "roles",
    component: RolesList,
    meta: { requiresAuth: true },
  },
  {
    path: "/inventario",
    name: "inventario",
    component: InventarioList,
    meta: { requiresAuth: true },
  },
  {
    path: "/reportes",
    name: "reportes",
    component: ReportesList,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// ===================================================
// 🚨 Protección de rutas + control de autenticación y rol
// ===================================================
router.beforeEach((to, from, next) => {
  const store = useUserStore();
  store.loadUser();

  const userRol = store.user?.rol?.name;

  // Requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    next("/login");
  }
  // Evita acceso a login/register si ya está autenticado
  else if (to.meta.requiresGuest && store.isAuthenticated) {
    next("/dashboard");
  }
  // Restricciones por rol
  else if (to.path === "/usuarios" && userRol !== "Administrador") {
    next("/dashboard");
  }
  else if (to.path === "/roles" && userRol !== "Administrador") {
    next("/dashboard");
  }
  // Farmacéuticos y administradores pueden ver inventario
  else if (to.path === "/inventario" && !["Administrador", "Farmaceutico"].includes(userRol)) {
    next("/dashboard");
  }
  // Farmacéuticos y administradores pueden ver reportes
  else if (to.path === "/reportes" && !["Administrador", "Farmaceutico"].includes(userRol)) {
    next("/dashboard");
  }
  else {
    next();
  }
});

export default router;
