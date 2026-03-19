# Eluxar Backend - E-commerce de Perfumes

Bienvenido al repositorio del backend del sistema Eluxar, un e-commerce especializado en la venta de perfumes. Este proyecto está desarrollado utilizando **Java 21** y **Spring Boot 3**.

## 🚀 Tecnologías Principales

*   **Java 21**
*   **Spring Boot 3.5.11** (Web, Data JPA, Security, Validation)
*   **PostgreSQL** (Base de datos relacional)
*   **Maven** (Gestor de dependencias y construcción)
*   **Lombok** (Reducción de código boilerplate)
*   **MapStruct** (Mapeo entre DTOs y Entidades)
*   **JWT (JSON Web Token)** (Autenticación y autorización)
*   **Swagger / OpenAPI** (Documentación de la API)

## 📋 Prerrequisitos y Dependencias

Para poder ejecutar este proyecto localmente, necesitas tener instalado lo siguiente en tu máquina:

1.  **Java Development Kit (JDK) 21**: Puedes descargarlo desde [Oracle](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html), [Adoptium (Temurin)](https://adoptium.net/), o utilizar el de tu preferencia. Comprueba que está instalado ejecutando `java -version`.
2.  **PostgreSQL**: Necesitas tener un servidor de PostgreSQL corriendo (versión 12 o superior recomendada).
3.  **Maven (Opcional)**: El proyecto incluye el *Maven Wrapper* (`mvnw`), por lo que no es estrictamente necesario tener Maven instalado de forma global, aunque es recomendable.

## ⚙️ Configuración del Entorno Local

Antes de correr el proyecto, debes configurar la base de datos para que el backend pueda conectarse:

1. Abre tu gestor de base de datos PostgreSQL (como pgAdmin o DBeaver).
2. Crea una nueva base de datos llamada: **`eluxar_db`**.
3. Asegúrate de que las credenciales locales de tu usuario de PostgreSQL coincidan con las configuradas por defecto en el archivo `src/main/resources/application.properties`:

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/eluxar_db
   spring.datasource.username=postgres
   spring.datasource.password=2026
   ```

   *(Si tu usuario o contraseña de PostgreSQL es diferente a `postgres` / `2026`, cámbialos en el archivo `application.properties` o usa variables de entorno en caso de configurarlo para producción).*

## 🏃 Cómo Correr el Proyecto

Una vez configurada la base de datos, sigue estos pasos desde la terminal (consola de comandos) ubicándote en la raíz del proyecto (donde se encuentra el archivo `pom.xml`):

### 1. Limpiar y Compilar el Proyecto (Descargar dependencias)
Ejecuta el siguiente comando para que Maven descargue todas las dependencias necesarias y recompile el proyecto:

*   **En Windows:**
    ```bash
    .\mvnw clean install
    ```
*   **En Linux/Mac:**
    ```bash
    ./mvnw clean install
    ```

*(Si se generan errores en los tests de momento, puedes saltarlos agregando `-DskipTests` al final del comando).*

### 2. Ejecutar la Aplicación
Para levantar el servidor de Spring Boot, ejecuta:

*   **En Windows:**
    ```bash
    .\mvnw spring-boot:run
    ```
*   **En Linux/Mac:**
    ```bash
    ./mvnw spring-boot:run
    ```

Si la aplicación inicia correctamente, verás en la consola un mensaje indicando que el servidor arrancó (`Started EluxarApplication in ... seconds`).

## 📚 Documentación de la API (Swagger)

Una vez que el servidor esté corriendo (por defecto en el puerto `8080`), puedes acceder a la documentación interactiva de los endpoints (Swagger UI) ingresando la siguiente URL en tu navegador web:

👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

Desde ahí podrás visualizar y probar todos los módulos y controllers desarrollados (Catálogo, Ventas, Admin, Auth, etc.).

## 📦 Estructura del Proyecto

El código fuente principal se encuentra en `src/main/java/com/eluxar/` y está organizado por módulos:

*   **`common`**: Excepciones globales, respuestas unificadas (`ApiResponse`), etc.
*   **`config`**: Configuraciones generales (Security, OpenAPI, CORS).
*   **`modules`**: Contiene la lógica de negocio dividida por dominios:
    *   `admin`: Dashboard y gestión de roles.
    *   `auth`: Autenticación, JWT, Usuarios.
    *   `catalogo`: Productos, Categorías, Marcas.
    *   `ventas`: Carrito, Pedidos, Detalles de Pedido.

Cada módulo maneja sus propios `controller`, `service`, `entity`, `repository` y `dto`.
