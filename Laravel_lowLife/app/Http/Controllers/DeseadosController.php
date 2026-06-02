<?php

namespace App\Http\Controllers;

use App\Models\Deseado;
use Illuminate\Http\Request;

class DeseadosController extends Controller
{
    /**
     * Comentario: Devuelve todos los productos que el usuario tiene en deseados
     */
    public function index(Request $request)
    {
        // Cogemos el usuario actual
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        // Buscamos sus deseados, incluyendo la información del producto asociado
        $deseados = Deseado::with('producto')->where('usuario_id', $usuario->id)->get();
        return response()->json($deseados);
    }

    /**
     * Comentario: Alterna (añade o quita) el "like" a un producto
     */
    public function toggle(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $request->validate([
            'producto_id' => 'required|exists:productos,id'
        ]);

        $producto_id = $request->producto_id;

        // Comprobamos si ya le había dado like
        $existente = Deseado::where('usuario_id', $usuario->id)
                            ->where('producto_id', $producto_id)
                            ->first();

        if ($existente) {
            // Si ya existe, lo borramos (quitamos el like)
            $existente->delete();
            return response()->json(['mensaje' => 'Quitado de deseados', 'is_liked' => false]);
        } else {
            // Si no existe, lo creamos (damos like)
            Deseado::create([
                'usuario_id' => $usuario->id,
                'producto_id' => $producto_id
            ]);
            return response()->json(['mensaje' => 'Añadido a deseados', 'is_liked' => true]);
        }
    }
}
