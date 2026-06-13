<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductosController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PedidosController;
use App\Http\Controllers\DetallesPedidoController;

use App\Http\Controllers\CestaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// --- RUTAS DE AUTENTICACIÓN Y USUARIOS ---

// 1. Registro de usuario: Recibe nombre, email, password y crea la cuenta (enviando el correo de verificación)
Route::post('/registro', [AuthController::class, 'registro']);

// 2. Verificación de email: Ruta a la que llega el usuario cuando hace clic en el enlace de su correo
// Tiene que tener el nombre 'verification.verify' para que URL::temporarySignedRoute de Laravel funcione
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// 3. Login de usuario: Recibe identificador y password y devuelve el token de sesión
Route::post('/login', [AuthController::class, 'login']);

// Rutas públicas de autenticación con Google
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Rutas protegidas (requieren token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Ruta para actualizar el perfil del usuario (acepta FormData para la imagen)
    Route::post('/perfil/actualizar', [UsuariosController::class, 'updateProfile']);
    
    // Rutas para el historial de pedidos y lista de deseados
    Route::get('/mis-pedidos', [PedidosController::class, 'misPedidos']);
    Route::post('/pedidos', [PedidosController::class, 'store']); // Crear pedido
    Route::patch('/pedidos/{id}/ocultar', [PedidosController::class, 'ocultarPedido']); // Ocultar pedido para el usuario
    Route::get('/deseados', [\App\Http\Controllers\DeseadosController::class, 'index']);
    Route::post('/deseados/toggle', [\App\Http\Controllers\DeseadosController::class, 'toggle']);
});

Route::apiResource('productos', ProductosController::class);
Route::apiResource('usuarios', UsuariosController::class);
Route::apiResource('pedidos', PedidosController::class)->except(['store']);
Route::apiResource('detalles_pedidos', DetallesPedidoController::class);

Route::get('cesta/{usuario_id}', [CestaController::class, 'index']);
Route::post('cesta', [CestaController::class, 'store']);
Route::put('cesta/{id}', [CestaController::class, 'update']);
Route::delete('cesta/clear/{usuario_id}', [CestaController::class, 'clear']);
Route::delete('cesta/{id}', [CestaController::class, 'destroy']);
