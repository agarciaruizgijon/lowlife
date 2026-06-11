<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cesta;

class CestaController extends Controller
{
    public function index($usuario_id)
    {
        // Get all cart items for user with product details
        $cesta = Cesta::with('producto')->where('usuario_id', $usuario_id)->get();
        return response()->json($cesta);
    }

    public function store(Request $request)
    {
        $request->validate([
            'usuario_id' => 'required|exists:usuarios,id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'integer|min:1',
            'color' => 'nullable|string',
            'talla' => 'nullable|string'
        ]);

        // Check if product already exists in cart for this user with the same color and size
        $cesta = Cesta::where('usuario_id', $request->usuario_id)
                      ->where('producto_id', $request->producto_id)
                      ->where('color', $request->color)
                      ->where('talla', $request->talla)
                      ->first();

        if ($cesta) {
            // Update quantity
            $cesta->cantidad += $request->input('cantidad', 1);
            $cesta->save();
        } else {
            // Create new entry
            $cesta = new Cesta();
            $cesta->usuario_id = $request->usuario_id;
            $cesta->producto_id = $request->producto_id;
            $cesta->cantidad = $request->input('cantidad', 1);
            $cesta->color = $request->color;
            $cesta->talla = $request->talla;
            $cesta->save();
        }

        return response()->json(['message' => 'Añadido a la cesta', 'cesta' => $cesta], 201);
    }
}
