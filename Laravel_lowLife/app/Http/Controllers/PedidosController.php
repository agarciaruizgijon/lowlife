<?php

namespace App\Http\Controllers;

use App\Models\Pedidos;
use Illuminate\Http\Request;

class PedidosController extends Controller
{
    /**
     * Comentario: Devuelve el historial de pedidos del usuario autenticado
     */
    public function misPedidos(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        // Buscamos los pedidos del usuario. 
        // Con 'with' traemos también los detalles y, de cada detalle, el producto asociado.
        // Los ordenamos de más nuevo a más viejo usando latest().
        $pedidos = Pedidos::with('detalles.producto')
                          ->where('usuario_id', $usuario->id)
                          ->latest()
                          ->get();
                          
        return response()->json($pedidos);
    }

    /**
     * Display the specified resource.
     */
    public function show(Pedidos $pedidos)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pedidos $pedidos)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pedidos $pedidos)
    {
        //
    }
}
