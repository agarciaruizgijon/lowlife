<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductosController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\PedidosController;
use App\Http\Controllers\DetallesPedidoController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('productos', ProductosController::class);
Route::apiResource('usuarios', UsuariosController::class);
Route::apiResource('pedidos', PedidosController::class);
Route::apiResource('detalles_pedidos', DetallesPedidoController::class);

