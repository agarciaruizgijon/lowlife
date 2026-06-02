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

// Rutas públicas de autenticación tradicional
Route::post('/register', [AuthController::class, 'register']);
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
    Route::get('/deseados', [\App\Http\Controllers\DeseadosController::class, 'index']);
    Route::post('/deseados/toggle', [\App\Http\Controllers\DeseadosController::class, 'toggle']);
});

Route::apiResource('productos', ProductosController::class);
Route::apiResource('usuarios', UsuariosController::class);
Route::apiResource('pedidos', PedidosController::class);
Route::apiResource('detalles_pedidos', DetallesPedidoController::class);

Route::get('cesta/{usuario_id}', [CestaController::class, 'index']);
Route::post('cesta', [CestaController::class, 'store']);
