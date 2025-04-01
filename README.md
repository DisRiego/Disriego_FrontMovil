# Disriego_FrontMovil

Este repositorio contiene el frontend móvil de **DisRiego**, desarrollado en **React Native** y gestionado con **Android Studio** para pruebas y emulación. Se desplegará en la Google Play Store utilizando herramientas como Expo (u otra solución similar).


## 1. Organización del Repositorio y Ramas

### Ramas Principales:

- `develop` → Rama de desarrollo activa.
- `test` → Rama para integración y pruebas.
- `main` → Rama de producción.

### Flujo de trabajo:

1. Desarrollar nuevas funcionalidades en `develop`
2. Merge a `test` para ejecutar pruebas y validaciones.
3. Merge a `main` para el despliegue en producción (publicación en la Google Play Store).


## 2. Configuración del Entorno Local

### Requisitos previos

- [Visual Studio Code](https://code.visualstudio.com/) u otro IDE de preferencia.
- Node.js (versión LTS recomendada).
- React Native CLI y/o Expo CLI (según la solución adoptada).
- Expo go (para ejecutar la app en dispositivos móviles).
- Android Studio (para emulación y pruebas).

### Pasos

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/DisRiego_FrontMovil.git
   cd DisRiego_FrontMovil
   ```

2. **Instalar Dependencias:**

   ```bash
   npm install
   ```

   o, si usas Expo:

   ```bash
   npx expo install
   ```

   > Esto abrirá el navegador con un QR para ejecutar en Expo Go o en tu emulador Android.

3. **Configurar Variables de Entorno:**

   - Copia el archivo `.env.example` a `.env` y ajusta los valores necesarios.
   - Ejemplo:
     ```dotenv
     API_URL=https://api.disriego.com
     OTRO_PARAMETRO=valor
     ```

4. **Ejecución en Desarrollo:**

   - Para iniciar el proyecto con Expo:
     ```bash
     expo start
     ```
   - O para iniciar desde Android Studio, abre el proyecto en Android Studio y ejecuta el emulador.

5. **Ejecución de Tests:**
   - Ejecuta los tests locales:
     ```bash
     npm test
     ```

### Backend: Configuración Local

Para que la app móvil se conecte correctamente al backend, asegúrate de levantar **ambos servicios** en tu computador con puertos distintos:

| Servicio          | Comando para ejecutar                                      | Puerto ej. |
| ----------------- | ---------------------------------------------------------- | ---------- |
| Backend principal | `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` | `8000`     |
| Backend IoT       | `uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload` | `8002`     |

> En el código, las URLs del backend están en `src/services/config.ts`. Puedes usar una IP local como `http://ip:port` para desarrollo. Para obtener tu IP local, ejecuta ipconfig en la terminal (cmd).


## 3. Integración de CI/CD con GitHub Actions

### Flujo de CI/CD

- **CI:**

  - Se ejecutan tests unitarios y de integración en cada push o Pull Request en `develop` y `test`.

- **CD:**
  - Al fusionar en `main`, se puede automatizar la generación de builds y, si es posible, la publicación utilizando servicios como Expo Application Services (EAS).

### Ejemplo de Workflow (archivo `.github/workflows/ci-cd.yml`):

```yaml
name: CI/CD Frontend Móvil

on:
  push:
    branches: [develop, test, main]
  pull_request:
    branches: [develop, test, main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "16"
      - name: Install Dependencies
        run: npm install
      - name: Run Tests
        run: npm test

  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy Mobile Build
        run: echo "Deploying mobile build..."
```

## 4. Despliegue en la Google Play Store

- **Proceso de Publicación:**

  - Una vez generado y validado el build en la rama `main`, se procederá a la publicación en la Google Play Store.
  - Se recomienda utilizar Expo Application Services (EAS) u otra solución automatizada para gestionar el proceso de build y despliegue.

- **Configuración:**
  - Configura las variables de entorno necesarias en el panel del servicio de despliegue.
  - Asegúrate de que las credenciales y certificados se gestionen de forma segura (por ejemplo, mediante GitHub Secrets).


## 5. Consideraciones Finales

- **Variables Sensibles:**
  - Utiliza GitHub Secrets y configura las variables en el servicio de despliegue (EAS, etc.).
- **Actualización:**
  - Este README se actualizará conforme se presenten cambios o imprevistos.
- **Soporte:**
  - Para dudas o incidencias, abre un issue en el repositorio o contacta al líder del equipo.


## 6. Recomendaciones

- No subas IPs reales ni tokens al repositorio.
- Usa `.env` para credenciales y rutas sensibles.
- Documenta las ramas y PRs con mensajes como `add`, `update`, `fix`, `remove`.

¡A desarrollar una aplicación móvil de calidad para DisRiego y prepararse para su publicación en la Google Play Store!
