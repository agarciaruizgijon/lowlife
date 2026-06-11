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
     * Comentario añadido: 
     * Display a listing of the resource.
     * Este método se encarga de extraer todos los pedidos de la base de datos para el panel de administración.
     * Incluye las relaciones 'detalles.producto' y 'usuario' para mostrar la info completa en la tabla de recientes.
     */
    public function index()
    {
        // Traemos todos los pedidos ordenados del más nuevo al más viejo
        $pedidos = Pedidos::with(['detalles.producto', 'usuario'])->latest()->get();
        return response()->json($pedidos);
    }

    /**
     * Display the specified resource.
     */
    public function show(Pedidos $pedido)
    {
        return response()->json($pedido->load(['detalles.producto', 'usuario']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pedidos $pedido)
    {
        $pedido->update($request->all());
        return response()->json($pedido);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pedidos $pedido)
    {
        $pedido->delete();
        return response()->json(null, 204);
    }
}
