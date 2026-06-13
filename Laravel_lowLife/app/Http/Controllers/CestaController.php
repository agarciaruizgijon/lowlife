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

        // Buscamos la variación exacta para comprobar el stock disponible antes de añadir o sumar
        $variacion = \App\Models\ProductoVariacion::where('producto_id', $request->producto_id)
            ->where(function($query) use ($request) {
                $query->where('talla', $request->talla)
                      ->orWhereNull('talla')
                      ->orWhere('talla', 'N/A')
                      ->orWhere('talla', '');
            })
            ->where(function($query) use ($request) {
                $query->where('color_nombre', $request->color)
                      ->orWhere('color_hex', $request->color)
                      ->orWhereNull('color_nombre')
                      ->orWhere('color_nombre', 'N/A')
                      ->orWhere('color_nombre', '');
            })->first();

        // Check if product already exists in cart for this user with the same color and size
        $cesta = Cesta::where('usuario_id', $request->usuario_id)
                      ->where('producto_id', $request->producto_id)
                      ->where('color', $request->color)
                      ->where('talla', $request->talla)
                      ->first();

        // Calculamos la nueva cantidad que tendrá en la cesta
        $nuevaCantidad = $request->input('cantidad', 1);
        if ($cesta) {
            $nuevaCantidad += $cesta->cantidad;
        }

        // Si la cantidad solicitada supera el stock disponible, devolvemos error
        if ($variacion && $nuevaCantidad > $variacion->stock) {
            return response()->json(['message' => 'Stock insuficiente. Solo quedan ' . $variacion->stock . ' unidades.'], 400);
        }

        if ($cesta) {
            // Update quantity
            $cesta->cantidad = $nuevaCantidad;
            $cesta->save();
        } else {
            // Create new entry
            $cesta = new Cesta();
            $cesta->usuario_id = $request->usuario_id;
            $cesta->producto_id = $request->producto_id;
            $cesta->cantidad = $nuevaCantidad;
            $cesta->color = $request->color;
            $cesta->talla = $request->talla;
            $cesta->save();
        }

        return response()->json(['message' => 'Añadido a la cesta', 'cesta' => $cesta], 201);
    }

    public function destroy($id)
    {
        $cesta = Cesta::find($id);
        
        if (!$cesta) {
            return response()->json(['message' => 'Elemento no encontrado en la cesta'], 404);
        }

        $cesta->delete();

        return response()->json(['message' => 'Producto eliminado de la cesta'], 200);
    }

    // Actualiza la cantidad de un elemento de la cesta validando el stock disponible
    public function update(Request $request, $id)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1'
        ]);

        $cesta = Cesta::find($id);
        
        if (!$cesta) {
            return response()->json(['message' => 'Elemento no encontrado en la cesta'], 404);
        }

        // Buscamos la variación exacta para comprobar el stock disponible
        $variacion = \App\Models\ProductoVariacion::where('producto_id', $cesta->producto_id)
            ->where(function($query) use ($cesta) {
                $query->where('talla', $cesta->talla)
                      ->orWhereNull('talla')
                      ->orWhere('talla', 'N/A')
                      ->orWhere('talla', '');
            })
            ->where(function($query) use ($cesta) {
                $query->where('color_nombre', $cesta->color)
                      ->orWhere('color_hex', $cesta->color)
                      ->orWhereNull('color_nombre')
                      ->orWhere('color_nombre', 'N/A')
                      ->orWhere('color_nombre', '');
            })->first();

        // Si la cantidad que se quiere establecer es mayor al stock de la variación, devolvemos error
        if ($variacion && $request->cantidad > $variacion->stock) {
            return response()->json(['message' => 'Stock insuficiente. Solo quedan ' . $variacion->stock . ' unidades.'], 400);
        }

        // Actualizamos la cantidad en la cesta
        $cesta->cantidad = $request->cantidad;
        $cesta->save();

        return response()->json(['message' => 'Cantidad actualizada', 'cesta' => $cesta], 200);
    }

    public function clear($usuario_id)
    {
        Cesta::where('usuario_id', $usuario_id)->delete();
        return response()->json(['message' => 'Cesta vaciada correctamente'], 200);
    }
}
