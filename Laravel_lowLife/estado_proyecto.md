# Estado Actual del Proyecto Laravel (`lowlife`)

Este documento detalla la estructura implementada actualmente en el proyecto backend de Laravel, indicando qué componentes existen, sus configuraciones, así como los problemas detectados y las tareas pendientes necesarias para que sea funcional.

---

## 📂 1. Estructura General de Archivos Backend

Los archivos clave del proyecto se encuentran en las siguientes ubicaciones:

* **Rutas API:** [routes/api.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/routes/api.php)
* **Modelos:** En [app/Models/](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/)
* **Controladores:** En [app/Http/Controllers/](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Http/Controllers/)
* **Migraciones (Base de datos):** En [database/migrations/](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/database/migrations/)

---

## 🛠️ 2. Componentes Implementados por Entidad

A continuación se muestra el estado de implementación de cada modelo y su relación con las bases de datos y controladores:

### 📦 Productos
* **Modelo ([Productos.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/Productos.php)):** 
  * Tiene la propiedad `$fillable` definida con los campos: `titulo`, `descripcion`, `foto_url`, `colores`, `precio`, `stock`.
* **Migración ([create_productos_table.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/database/migrations/2026_05_26_174318_create_productos_table.php)):**
  * ⚠️ *Incompleta:* Solo contiene la estructura base (`id` y `timestamps`). Faltan añadir los campos del modelo.
* **Controlador ([ProductosController.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Http/Controllers/ProductosController.php)):**
  * Contiene los métodos para un recurso API (`index`, `store`, `show`, `update`, `destroy`) pero las funciones están actualmente vacías (sin lógica).
* **Ruta:**
  * ⚠️ *Error de sintaxis:* Registrada en `routes/api.php` como `ProductoController::class` (en singular), lo que causa un fallo de clase inexistente. Tampoco está importada la clase al inicio del archivo de rutas.

---

### 🛒 Pedidos
* **Modelo ([Pedidos.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/Pedidos.php)):**
  * Tiene la propiedad `$fillable` con los campos: `usuario_id`, `fecha`, `procesado`.
  * Define relaciones Eloquent:
    * `usuario()`: Pertenece a un usuario (`belongsTo`).
    * `detalles()`: Tiene muchos detalles de pedido (`hasMany`).
  * ⚠️ *Error de importación:* Usa el trait `HasFactory` pero no lo importa al inicio del archivo.
* **Migración ([create_pedidos_table.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/database/migrations/2026_05_26_174332_create_pedidos_table.php)):**
  * ⚠️ *Incompleta:* Solo contiene `id` y `timestamps`. Faltan añadir los campos definidos en `$fillable`.
* **Controlador ([PedidosController.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Http/Controllers/PedidosController.php)):**
  * Métodos de recurso API creados pero vacíos.
* **Ruta:**
  * ❌ *No registrada:* No existe entrada en `routes/api.php`.

---

### 📋 Detalles de Pedidos
* **Modelo ([Detalles_Pedido.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/Detalles_Pedido.php)):**
  * Asocia explícitamente la tabla `detalles_pedidos`.
  * Tiene `$fillable` con los campos: `pedido_id`, `producto_id`, `cantidad`.
  * Define relaciones Eloquent:
    * `pedido()`: Pertenece a un Pedido (`belongsTo`).
    * `producto()`: Pertenece a un Producto (`belongsTo`).
  * ⚠️ *Error de importación:* Usa el trait `HasFactory` pero no lo importa al inicio del archivo.
* **Migración ([create_detalles__pedidos_table.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/database/migrations/2026_05_26_174349_create_detalles__pedidos_table.php)):**
  * ✅ *Completa:* Configura correctamente la clave primaria, claves foráneas referenciando a `pedidos` y `productos` con borrado en cascada, el campo entero `cantidad` y `timestamps`.
* **Controlador ([DetallesPedidoController.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Http/Controllers/DetallesPedidoController.php)):**
  * Métodos de recurso API creados pero vacíos.
* **Ruta:**
  * ❌ *No registrada:* No existe entrada en `routes/api.php`.

---

### 👤 Usuarios / Autenticación
* **Modelos:**
  * **[User.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/User.php):** Modelo por defecto de Laravel para autenticación (usa la tabla `users` con `name`, `email`, `password`).
  * **[Usuarios.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/Usuarios.php):** Modelo vacío personalizado creado recientemente.
* **Migraciones:**
  * [create_users_table.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/database/migrations/0001_01_01_000000_create_users_table.php) (Completa con campos name, email, password, etc.).
  * [create_usuarios_table.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/database/migrations/2026_05_26_174254_create_usuarios_table.php) (⚠️ *Incompleta:* Solo contiene `id` y `timestamps`).
* **Controlador ([UsuariosController.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Http/Controllers/UsuariosController.php)):**
  * Métodos de recurso API creados pero vacíos.
* **Rutas:**
  * El endpoint `/api/user` (para obtener el usuario autenticado vía Sanctum) está registrado por defecto.
  * ❌ `UsuariosController` no tiene ruta registrada.

---

## 🛣️ 3. Catálogo Detallado de Endpoints

A continuación se detalla cómo se deben utilizar todos los endpoints del proyecto (tanto los que están registrados a nivel de rutas como los planificados a partir de los controladores y modelos actuales):

### 🔑 Autenticación / Usuario Autenticado
* **`GET /api/user`**
  * **Middleware:** `auth:sanctum` (requiere cabecera `Authorization: Bearer <token>`)
  * **Descripción:** Obtiene los datos del usuario actualmente autenticado.
  * **Respuesta Esperada (200 OK):**
    ```json
    {
      "id": 1,
      "name": "Nombre Usuario",
      "email": "user@example.com",
      "email_verified_at": null,
      "created_at": "2026-05-26T18:00:00.000000Z",
      "updated_at": "2026-05-26T18:00:00.000000Z"
    }
    ```

---

### 📦 Productos (`/api/productos`)
* **`GET /api/productos`**
  * **Descripción:** Devuelve un listado completo de todos los productos en stock.
  * **Respuesta Esperada (200 OK):** Array de productos.
* **`POST /api/productos`**
  * **Descripción:** Crea un nuevo producto.
  * **Body (JSON):**
    ```json
    {
      "titulo": "Camiseta Lowlife",
      "descripcion": "Diseño exclusivo de la marca",
      "foto_url": "https://lowlife.es/imagenes/camiseta1.jpg",
      "colores": "Negro, Blanco, Gris",
      "precio": 29.99,
      "stock": 50
    }
    ```
* **`GET /api/productos/{id}`**
  * **Descripción:** Muestra los detalles de un producto específico.
* **`PUT /api/productos/{id}`**
  * **Descripción:** Modifica total o parcialmente un producto existente.
  * **Body (JSON):** Campos a actualizar (ej. `{"precio": 24.99, "stock": 45}`).
* **`DELETE /api/productos/{id}`**
  * **Descripción:** Elimina un producto de la tienda.

---

### 🛒 Pedidos (`/api/pedidos` - *Pendiente de Registrar Ruta*)
* **`GET /api/pedidos`**
  * **Descripción:** Obtiene la lista de todos los pedidos realizados.
* **`POST /api/pedidos`**
  * **Descripción:** Genera un nuevo pedido.
  * **Body (JSON):**
    ```json
    {
      "usuario_id": 1,
      "fecha": "2026-05-26 20:10:00",
      "procesado": false
    }
    ```
* **`GET /api/pedidos/{id}`**
  * **Descripción:** Muestra el estado y detalles de cabecera de un pedido concreto.
* **`PUT /api/pedidos/{id}`**
  * **Descripción:** Actualiza un pedido (por ejemplo, para marcarlo como procesado o cambiar la fecha).
  * **Body (JSON):** `{"procesado": true}`
* **`DELETE /api/pedidos/{id}`**
  * **Descripción:** Cancela y elimina un pedido (borra en cascada sus detalles asociados).

---

### 📋 Detalles de Pedidos (`/api/detalles-pedidos` - *Pendiente de Registrar Ruta*)
* **`GET /api/detalles-pedidos`**
  * **Descripción:** Obtiene todas las líneas de detalle de todos los pedidos.
* **`POST /api/detalles-pedidos`**
  * **Descripción:** Añade un producto y su cantidad a un pedido ya existente.
  * **Body (JSON):**
    ```json
    {
      "pedido_id": 1,
      "producto_id": 2,
      "cantidad": 3
    }
    ```
* **`GET /api/detalles-pedidos/{id}`**
  * **Descripción:** Muestra una línea de compra específica.
* **`PUT /api/detalles-pedidos/{id}`**
  * **Descripción:** Modifica la cantidad comprada de un artículo.
  * **Body (JSON):** `{"cantidad": 5}`
* **`DELETE /api/detalles-pedidos/{id}`**
  * **Descripción:** Elimina un artículo del pedido.

---

### 👤 Usuarios Personalizados (`/api/usuarios` - *Pendiente de Registrar Ruta*)
* **`GET /api/usuarios`** / **`POST /api/usuarios`** / **`GET /api/usuarios/{id}`** / **`PUT /api/usuarios/{id}`** / **`DELETE /api/usuarios/{id}`**
  * **Descripción:** Operaciones CRUD asociadas a la tabla personalizada de usuarios. *(Nota: Por lo general, se aconseja unificar con el modelo `User` por defecto si se va a utilizar autenticación basada en Laravel Sanctum).*

---

## ⚡ 4. Errores Detectados que se Deben Solucionar

Para poner en marcha el proyecto, se deben corregir los siguientes detalles:

1. **Error en rutas API ([routes/api.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/routes/api.php)):**
   * Cambiar `ProductoController::class` a `ProductosController::class`.
   * Añadir el import correspondiente arriba:
     ```php
     use App\Http\Controllers\ProductosController;
     ```
2. **Imports de `HasFactory` faltantes:**
   * En [Pedidos.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/Pedidos.php) y [Detalles_Pedido.php](file:///d:/Victor/Documentos/proyectoFinal/lowlife/Laravel_lowLife/app/Models/Detalles_Pedido.php) se debe añadir:
     ```php
     use Illuminate\Database\Eloquent\Factories\HasFactory;
     ```
3. **Completar Migraciones de Base de Datos:**
   * **Productos:** Añadir los campos (`titulo`, `descripcion`, `foto_url`, `colores`, `precio`, `stock`) a la migración para que correspondan con el modelo.
   * **Pedidos:** Añadir los campos (`usuario_id`, `fecha`, `procesado`) a la migración.
4. **Lógica de los Controladores:**
   * Desarrollar el cuerpo de los métodos de cada controlador para que realicen las consultas a la base de datos (por ejemplo, `Productos::all()`, `Productos::create()`, etc.) y retornen respuestas en formato JSON.

---

## 🛠️ 5. Comandos Útiles para el Backend

Si necesitas interactuar con el backend de Laravel desde el terminal, puedes situarte en el directorio `Laravel_lowLife` y ejecutar:

* **Levantar el servidor local:**
  ```powershell
  php artisan serve
  ```
* **Correr las migraciones (crear tablas en la Base de Datos):**
  ```powershell
  php artisan migrate
  ```
* **Resetear y volver a correr las migraciones (borra todos los datos):**
  ```powershell
  php artisan migrate:fresh
  ```
* **Ver el listado completo de rutas registradas (útil tras corregir los imports):**
  ```powershell
  php artisan route:list
  ```
