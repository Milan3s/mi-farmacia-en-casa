<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Navbar from "../../navbar/Navbar.vue";
import { Pie, Bar } from "vue-chartjs";
import html2pdf from "html2pdf.js";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

const API_URL = "http://localhost:5000/api/reportes";

const reporte = ref(null);
const medicinas = ref([]);
const loading = ref(true);
const error = ref("");
const categoriaSeleccionada = ref(null);
const medicinasFiltradas = ref([]);

const chartDataPie = ref(null);
const chartDataBar = ref(null);

// ============================================================
// 🔄 Cargar reporte desde el backend
// ============================================================
const fetchReporte = async () => {
  loading.value = true;
  error.value = "";
  categoriaSeleccionada.value = null;
  medicinasFiltradas.value = [];

  try {
    const res = await axios.get(`${API_URL}/inventario`);

    reporte.value = res.data.reporte || null;
    medicinas.value = res.data.medicinas || [];

    if (!reporte.value) throw new Error("No se recibieron datos del reporte.");

    // 📊 Gráfico circular
    chartDataPie.value = {
      labels: ["Disponibles", "Agotadas", "Caducadas"],
      datasets: [
        {
          label: "Cantidad de medicinas",
          data: [
            reporte.value.disponibles || 0,
            reporte.value.agotadas || 0,
            reporte.value.caducadas || 0,
          ],
          backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
          borderWidth: 1,
        },
      ],
    };

    // 💰 Gráfico de barras (Top 5 costosas)
    const top = reporte.value?.detalle?.top_costosas || [];
    chartDataBar.value = {
      labels: top.map((m) => m.nombre),
      datasets: [
        {
          label: "Precio (€)",
          backgroundColor: "#007bff",
          data: top.map((m) => m.precio),
        },
      ],
    };
  } catch (err) {
    console.error("❌ Error al cargar el reporte:", err);
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Error al obtener los datos del reporte.";
  } finally {
    loading.value = false;
  }
};

// ============================================================
// 📄 Exportar listado detallado de medicinas a PDF
// ============================================================
const exportarPDF = () => {
  if (!medicinas.value.length) {
    alert("No hay medicinas disponibles para exportar.");
    return;
  }

  const hoy = new Date();

  // Agrupar medicinas por estado
  const disponibles = medicinas.value.filter(
    (m) => m.estado === "Disponible" && m.cantidad > 0
  );
  const agotadas = medicinas.value.filter(
    (m) => m.estado === "Agotado" || m.cantidad === 0
  );
  const caducadas = medicinas.value.filter(
    (m) => new Date(m.fecha_caducidad) < hoy || m.estado === "Caducado"
  );

  // Crear contenido HTML del PDF
  const contenido = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align:center; color:#198754;">📋 Reporte Detallado de Medicinas</h2>
      <p style="text-align:center; color:#555;">
        Generado el ${hoy.toLocaleDateString()} a las ${hoy.toLocaleTimeString()}
      </p>

      <h3 style="color:#198754; border-bottom:2px solid #198754;">Disponibles (${disponibles.length})</h3>
      ${
        disponibles.length
          ? `<ul>${disponibles
              .map(
                (m) =>
                  `<li><b>${m.nombre}</b> — ${m.cantidad} unidades — Caduca: ${new Date(
                    m.fecha_caducidad
                  ).toLocaleDateString()}</li>`
              )
              .join("")}</ul>`
          : `<p style="color:#888;">No hay medicinas disponibles.</p>`
      }

      <h3 style="color:#ffc107; border-bottom:2px solid #ffc107;">Agotadas (${agotadas.length})</h3>
      ${
        agotadas.length
          ? `<ul>${agotadas
              .map(
                (m) =>
                  `<li><b>${m.nombre}</b> — ${m.cantidad} unidades — Caduca: ${new Date(
                    m.fecha_caducidad
                  ).toLocaleDateString()}</li>`
              )
              .join("")}</ul>`
          : `<p style="color:#888;">No hay medicinas agotadas.</p>`
      }

      <h3 style="color:#dc3545; border-bottom:2px solid #dc3545;">Caducadas (${caducadas.length})</h3>
      ${
        caducadas.length
          ? `<ul>${caducadas
              .map(
                (m) =>
                  `<li><b>${m.nombre}</b> — ${m.cantidad} unidades — Caducó el ${new Date(
                    m.fecha_caducidad
                  ).toLocaleDateString()}</li>`
              )
              .join("")}</ul>`
          : `<p style="color:#888;">No hay medicinas caducadas.</p>`
      }

      <p style="margin-top:20px; font-size:12px; text-align:center; color:#888;">
        Sistema de Inventario - Reporte generado automáticamente
      </p>
    </div>
  `;

  const opciones = {
    margin: 0.5,
    filename: `Reporte_Medicinas_${hoy.toLocaleDateString()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf().set(opciones).from(contenido).save();
};

// ============================================================
// 🧩 Filtrar medicinas según categoría (clic en gráfico)
// ============================================================
const filtrarMedicinas = (categoria) => {
  categoriaSeleccionada.value = categoria;
  const hoy = new Date();

  if (categoria === "Disponibles") {
    medicinasFiltradas.value = medicinas.value.filter(
      (m) => m.estado === "Disponible" && m.cantidad > 0
    );
  } else if (categoria === "Agotadas") {
    medicinasFiltradas.value = medicinas.value.filter(
      (m) => m.estado === "Agotado" || m.cantidad === 0
    );
  } else if (categoria === "Caducadas") {
    medicinasFiltradas.value = medicinas.value.filter(
      (m) => new Date(m.fecha_caducidad) < hoy || m.estado === "Caducado"
    );
  } else {
    medicinasFiltradas.value = [];
  }
};

// 🎯 Clic en gráfico circular
const onPieClick = (event, elements) => {
  if (!elements.length) return;
  const index = elements[0].index;
  const categoria = chartDataPie.value.labels[index];
  filtrarMedicinas(categoria);
};

// Cerrar listado
const cerrarListado = () => {
  categoriaSeleccionada.value = null;
  medicinasFiltradas.value = [];
};

onMounted(fetchReporte);
</script>

<template>
  <div id="reporte-inventario">
    <Navbar />

    <div class="container py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-success">
          <i class="fa-solid fa-chart-pie me-2"></i> Reporte del Inventario
        </h2>
        <hr class="divider mx-auto" />
        <p class="text-muted">
          Visualiza el estado general de las medicinas registradas en el sistema.
        </p>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-success" role="status"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      </div>

      <!-- Contenido -->
      <div v-else>
        <!-- Datos generales -->
        <div class="row text-center mb-5">
          <div
            class="col-md-3 mb-3"
            v-for="(valor, key) in {
              'Total Medicinas': reporte.total_medicinas || 0,
              'Disponibles': reporte.disponibles || 0,
              'Agotadas': reporte.agotadas || 0,
              'Caducadas': reporte.caducadas || 0
            }"
            :key="key"
          >
            <div class="card shadow-sm border-0 rounded-4">
              <div class="card-body">
                <h6 class="text-muted">{{ key }}</h6>
                <h3 class="fw-bold text-success">{{ valor }}</h3>
              </div>
            </div>
          </div>

          <!-- Valor total -->
          <div class="col-md-3 mb-3">
            <div class="card shadow-sm border-0 rounded-4 bg-light">
              <div class="card-body">
                <h6 class="text-muted">💰 Valor total del inventario</h6>
                <h3 class="fw-bold text-primary">
                  {{ (reporte.valor_total_inventario || 0).toFixed(2) }} €
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="row justify-content-center g-4">
          <div class="col-md-5">
            <div class="card shadow-sm border-0 rounded-4 p-3">
              <h5 class="text-center fw-semibold mb-3 text-success">
                Distribución por estado
              </h5>
              <Pie
                v-if="chartDataPie"
                :data="chartDataPie"
                :options="{
                  responsive: true,
                  onClick: onPieClick,
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const valor = context.parsed || 0;
                          const porcentaje = total ? ((valor / total) * 100).toFixed(1) : 0;
                          return `${context.label}: ${valor} (${porcentaje}%)`;
                        },
                      },
                    },
                  },
                }"
              />
              <p class="text-center text-muted small mt-2">
                Haz clic en una sección para ver las medicinas correspondientes.
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card shadow-sm border-0 rounded-4 p-3">
              <h5 class="text-center fw-semibold mb-3 text-primary">
                Top 5 Medicinas más costosas
              </h5>
              <Bar
                v-if="chartDataBar"
                :data="chartDataBar"
                :options="{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }"
              />
            </div>
          </div>
        </div>

        <!-- Listado filtrado -->
        <transition name="fade">
          <div v-if="categoriaSeleccionada" class="mt-5">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold text-secondary">
                Medicinas {{ categoriaSeleccionada.toLowerCase() }}
              </h5>
              <button class="btn btn-sm btn-outline-secondary" @click="cerrarListado">
                <i class="fa-solid fa-xmark me-1"></i> Cerrar
              </button>
            </div>

            <ul class="list-group shadow-sm rounded-3">
              <li
                v-for="m in medicinasFiltradas"
                :key="m._id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{{ m.nombre }}</strong>
                  <small class="text-muted d-block">
                    Caduca: {{ new Date(m.fecha_caducidad).toLocaleDateString() }}
                  </small>
                </div>
                <span
                  class="badge rounded-pill"
                  :class="{
                    'bg-success': categoriaSeleccionada === 'Disponibles',
                    'bg-warning text-dark': categoriaSeleccionada === 'Agotadas',
                    'bg-danger': categoriaSeleccionada === 'Caducadas',
                  }"
                >
                  {{ m.cantidad || 0 }} unidades
                </span>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>

    <!-- Botones -->
    <div class="text-center mt-4 my-5">
      <button class="btn btn-outline-success fw-semibold me-3" @click="fetchReporte">
        <i class="fa-solid fa-rotate me-2"></i>Actualizar reporte
      </button>
      <button class="btn btn-outline-primary fw-semibold" @click="exportarPDF">
        <i class="fa-solid fa-file-pdf me-2"></i>Descargar PDF del listado
      </button>
    </div>
  </div>
</template>

<style scoped>
.divider {
  width: 90px;
  height: 3px;
  background-color: #198754;
  border-radius: 3px;
}
.card {
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
