# Disriego_FrontMovil

Este repositorio contiene el frontend móvil de **DisRiego**, desarrollado en **React Native** y gestionado con **Android Studio** para pruebas y emulación. Se desplegará en la Google Play Store utilizando herramientas como Expo (u otra solución similar).

---

## 1. Organización del Repositorio y Ramas

- **Ramas Principales:**

  - **develop:** Rama de desarrollo activa.
  - **test:** Rama para integración y pruebas.
  - **main:** Rama de producción.

- **Flujo de Trabajo:**
  1. Desarrollo en `develop`.
  2. Merge a `test` para ejecutar pruebas y validaciones.
  3. Merge a `main` para el despliegue en producción (publicación en la Google Play Store).

---

## 2. Configuración del Entorno Local

### Requisitos

- [Visual Studio Code](https://code.visualstudio.com/) u otro IDE de preferencia.
- Node.js (versión LTS recomendada).
- React Native CLI y/o Expo CLI (según la solución adoptada).
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
   expo install
   ```

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

---

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

---

## 4. Despliegue en la Google Play Store

- **Proceso de Publicación:**

  - Una vez generado y validado el build en la rama `main`, se procederá a la publicación en la Google Play Store.
  - Se recomienda utilizar Expo Application Services (EAS) u otra solución automatizada para gestionar el proceso de build y despliegue.

- **Configuración:**
  - Configura las variables de entorno necesarias en el panel del servicio de despliegue.
  - Asegúrate de que las credenciales y certificados se gestionen de forma segura (por ejemplo, mediante GitHub Secrets).

---

## 5. Consideraciones Finales

- **Variables Sensibles:**
  - Utiliza GitHub Secrets y configura las variables en el servicio de despliegue (EAS, etc.).
- **Actualización:**
  - Este README se actualizará conforme se presenten cambios o imprevistos.
- **Soporte:**
  - Para dudas o incidencias, abre un issue en el repositorio o contacta al líder del equipo.

¡A desarrollar una aplicación móvil de calidad para DisRiego y prepararse para su publicación en la Google Play Store!

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
