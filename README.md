# 💊 Mi Farmacia en Casa

> 🧠 Proyecto Full Stack desarrollado con **Vue 3**, **Vite**, **Pinia**, **Express** y **MongoDB**.  
> Permite gestionar el inventario, usuarios, reportes y control de medicinas de manera sencilla y eficiente.

---

## ⚙️ 1. Prerrequisitos del entorno

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

### 🧩 1.1 MongoDB Community Server
📥 Descargar desde: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

Durante la instalación:
- Selecciona **"Complete"**
- Marca **"Install MongoDB as a Service"**
- Deja el puerto por defecto **27017**
- Marca la opción **"MongoDB Compass"** (para la GUI)

Para verificar que está corriendo el servicio:
```bash
sc query MongoDB
```
Debe mostrar: `STATE: 4 RUNNING`.

---

### 🧭 1.2 MongoDB Compass
Herramienta GUI para explorar, consultar y administrar la base de datos.  
📥 Descargar desde: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

---

### 💾 1.3 MongoDB Database Tools (mongodump / mongorestore)
Desde MongoDB 5.0, las herramientas de backup y restauración se instalan por separado.

1. 📦 Descargar desde: [https://www.mongodb.com/try/download/database-tools](https://www.mongodb.com/try/download/database-tools)  
2. Extraer en: `C:\Program Files\MongoDB\Tools\`  
3. Agregar al PATH del sistema: `C:\Program Files\MongoDB\Tools\bin`  
4. Verificar instalación:
```bash
mongorestore --version
```

---

## 🗃️ 2. Restaurar la base de datos

Antes de iniciar el proyecto, restaura la base de datos **contador-de-medicinas**.

1. Copia el backup en:
```
C:\backup_mongo\contador-de-medicinas
```
2. Ejecuta (CMD o PowerShell como administrador):
```bash
mongorestore --db contador-de-medicinas "C:\backup_mongo\contador-de-medicinas"
```
3. Verifica en **MongoDB Compass** que existan las colecciones:
   - dashboards  
   - inventario_de_medicinas  
   - reportes  
   - reportes_generales  
   - roles  
   - usuarios  

---

## 🏗️ 3. Estructura del proyecto

```
api/
 ├── backend/        # Servidor Node.js + Express
 │   ├── config/     
 │   ├── controllers/
 │   ├── middlewares/
 │   ├── models/
 │   ├── public/
 │   ├── routes/
 │   ├── schemas/
 │   ├── .env        
 │   └── app.js      
 │
 └── frontend/       
     ├── src/        
     ├── public/     
     ├── vite.config.js
     └── package.json
```

---

## 🧰 4. Tecnologías utilizadas

### 🖥️ Backend
| 🧩 Tecnología | 📘 Descripción |
|---------------|----------------|
| **Node.js** | Entorno de ejecución para JavaScript |
| **Express 5.1.0** | Framework backend minimalista y rápido |
| **Mongoose 8.19.2** | ODM para interactuar con MongoDB |
| **Joi 18.0.1** | Validación de datos |
| **Multer 2.0.2** | Manejo de subida de archivos |
| **bcryptjs 3.0.2** | Hash de contraseñas |
| **dotenv 17.2.3** | Variables de entorno |
| **CORS / method-override** | Configuración de cabeceras HTTP |
| **Nodemon 3.1.10** | Auto-reinicio en desarrollo |

### 💻 Frontend
| 🧩 Tecnología | 📘 Descripción |
|---------------|----------------|
| **Vue 3.5.22** | Framework progresivo de JavaScript |
| **Vite 7.1.12** | Bundler ultrarrápido |
| **Pinia 3.0.3** | Manejador de estado global |
| **Vue Router 4.6.3** | Sistema de rutas SPA |
| **Bootstrap 5.3.8** | Framework de estilos CSS |
| **Font Awesome 7.1.0** | Iconografía moderna |
| **Axios 1.13.0** | Cliente HTTP |
| **Chart.js 4.5.1 / vue-chartjs 5.3.2** | Visualización de gráficos |
| **html2pdf.js 0.12.1** | Exportación de reportes a PDF |
| **ESLint + Prettier** | Linter y formateador de código |

---

## 📦 5. Instalación de dependencias

### 🖥️ Backend
```bash
cd backend
npm install express mongoose bcryptjs joi dotenv cors method-override multer
npm install nodemon --save-dev
```

### 💻 Frontend
```bash
cd frontend
npm install vue vite pinia vue-router bootstrap @fortawesome/fontawesome-free axios chart.js vue-chartjs html2pdf.js @vitejs/plugin-vue vite-plugin-vue-devtools eslint eslint-plugin-vue @eslint/js @vue/eslint-config-prettier prettier globals
```

---

## 🚀 6. Puesta en marcha

### ▶️ Backend
```bash
cd backend
node app.js
```
o en modo desarrollo:
```bash
npx nodemon app.js
```

### ▶️ Frontend
En otra terminal:
```bash
cd frontend
npm run dev
```
Luego abre el navegador en la URL mostrada (por ejemplo `http://localhost:5173`).

---

## 🧠 7. Arquitectura general

```
Frontend (Vue 3 + Vite)
        │
        ▼
Backend (Express + Node.js)
        │
        ▼
Base de Datos (MongoDB)
```

---

## 🧾 8. Scripts rápidos

| ⚡ Acción | 💬 Comando |
|-----------|------------|
| Ejecutar Frontend | `npm run dev` |
| Ejecutar Backend | `node app.js` |
| Ejecutar Backend en desarrollo | `npx nodemon app.js` |
| Instalar dependencias | `npm install` |
| Lint del código Vue | `npm run lint` |

---

## 👨‍💻 9. Autor

**Milanes**  
📧 Proyecto académico / de práctica profesional  
🌐 [GitHub - Milan3s](https://github.com/Milan3s)

---

## 🏁 10. Licencia

Este proyecto se distribuye bajo la licencia **MIT**.  
Eres libre de usar, modificar y compartir el código bajo los mismos términos.
