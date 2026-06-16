<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cesta;

class CestaController extends Controller
{
    public function index($usuario_id)
    {
        // Obtener todos los productos de la cesta del usuario junto con sus datos
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

        // Buscar la variación exacta del producto para comprobar el stock disponible
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

        // Comprobar si este producto ya está en la cesta con la misma talla y color
        $cesta = Cesta::where('usuario_id', $request->usuario_id)
                      ->where('producto_id', $request->producto_id)
                      ->where('color', $request->color)
                      ->where('talla', $request->talla)
                      ->first();

        // Calcular la cantidad total que tendrá el producto en la cesta
        $nuevaCantidad = $request->input('cantidad', 1);
        if ($cesta) {
            $nuevaCantidad += $cesta->cantidad;
        }

        // Si la cantidad supera el stock disponible, devolver un error
        if ($variacion && $nuevaCantidad > $variacion->stock) {
            return response()->json(['message' => 'Stock insuficiente. Solo quedan ' . $variacion->stock . ' unidades.'], 400);
        }

        if ($cesta) {
            // Actualizar la cantidad del producto existente
            $cesta->cantidad = $nuevaCantidad;
            $cesta->save();
        } else {
            // Crear un nuevo registro en la cesta
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

    // Actualizar la cantidad de un producto comprobando antes el stock disponible
    public function update(Request $request, $id)
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1'
        ]);

        $cesta = Cesta::find($id);

        if (!$cesta) {
            return response()->json(['message' => 'Elemento no encontrado en la cesta'], 404);
        }

        // Buscar la variación exacta del producto para comprobar el stock disponible
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

        // Si la cantidad solicitada es mayor que el stock disponible, devolver un error
        if ($variacion && $request->cantidad > $variacion->stock) {
            return response()->json(['message' => 'Stock insuficiente. Solo quedan ' . $variacion->stock . ' unidades.'], 400);
        }

        // Guardar la nueva cantidad en la cesta
        $cesta->cantidad = $request->cantidad;
        $cesta->save();

        return response()->json(['message' => 'Cantidad actualizada', 'cesta' => $cesta], 200);
    }

    public function clear($usuario_id)
    {
        // Eliminar todos los productos de la cesta del usuario
        Cesta::where('usuario_id', $usuario_id)->delete();

        return response()->json(['message' => 'Cesta vaciada correctamente'], 200);
    }
}