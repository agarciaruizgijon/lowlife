<?php

namespace App\Http\Controllers;

use App\Models\Pedidos;
use App\Models\Detalles_Pedido;
use App\Models\Cesta;
use App\Models\ProductoVariacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidosController extends Controller
{
    /**
     * Crea un nuevo pedido a partir de la cesta del usuario logueado.
     */
    public function store(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        // Validación de los datos de envío
        $validatedData = $request->validate([
            'total' => 'required|numeric',
            'direccion_envio' => 'required|string',
            'ciudad' => 'required|string',
            'codigo_postal' => 'required|string',
            'telefono_envio' => 'required|string',
            'nombre_envio' => 'required|string',
            'apellidos_envio' => 'required|string',
        ]);

        // Iniciar una transacción para asegurar que todo se guarde correctamente
        DB::beginTransaction();

        try {
            // 1. Crear el pedido
            $pedido = Pedidos::create([
                'usuario_id' => $usuario->id,
                'fecha' => now(),
                'procesado' => false,
                'total' => $validatedData['total'],
                'nombre_envio' => $validatedData['nombre_envio'],
                'apellidos_envio' => $validatedData['apellidos_envio'],
                'direccion_envio' => $validatedData['direccion_envio'],
                'ciudad' => $validatedData['ciudad'],
                'codigo_postal' => $validatedData['codigo_postal'],
                'telefono_envio' => $validatedData['telefono_envio'],
                'fecha_entrega' => now()->addMonth(),
                'estado' => 'Recepción y confirmación',
                'oculto_usuario' => false,
            ]);

            // 2. Obtener los productos de la cesta del usuario
            $cestaItems = Cesta::with('producto')->where('usuario_id', $usuario->id)->get();

            if ($cestaItems->isEmpty()) {
                DB::rollBack();
                return response()->json(['error' => 'La cesta está vacía'], 400);
            }

            // 3. Crear los detalles del pedido a partir de la cesta y actualizar stock
            foreach ($cestaItems as $item) {
                // Verificar disponibilidad de stock antes de continuar
                $variacion = ProductoVariacion::where('producto_id', $item->producto_id)
                    ->where(function($query) use ($item) {
                        $query->where('talla', $item->talla)
                              ->orWhereNull('talla')
                              ->orWhere('talla', 'N/A')
                              ->orWhere('talla', '');
                    })
                    ->where(function($query) use ($item) {
                        $query->where('color_nombre', $item->color)
                              ->orWhere('color_hex', $item->color)
                              ->orWhereNull('color_nombre')
                              ->orWhere('color_nombre', 'N/A')
                              ->orWhere('color_nombre', '');
                    })->first();

                if (!$variacion || $variacion->stock < $item->cantidad) {
                    DB::rollBack();
                    return response()->json(['error' => 'Stock insuficiente para el producto: ' . $item->producto->titulo], 400);
                }

                // Descontar el stock
                $variacion->stock -= $item->cantidad;
                $variacion->save();

                // Crear el detalle del pedido
                Detalles_Pedido::create([
                    'pedido_id' => $pedido->id,
                    'producto_id' => $item->producto_id,
                    'cantidad' => $item->cantidad,
                    'precio' => $item->producto->precio,
                    'color' => $item->color,
                    'talla' => $item->talla
                ]);
            }

            // 4. Vaciar la cesta del usuario
            Cesta::where('usuario_id', $usuario->id)->delete();

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'message' => 'Pedido creado con éxito',
                'pedido' => $pedido->load('detalles.producto')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear el pedido: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Devuelve el historial de pedidos del usuario autenticado
     */
    public function misPedidos(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        // Obtener solo los pedidos que no han sido ocultados por el usuario
        $pedidos = Pedidos::where('usuario_id', $usuario->id)
                          ->where('oculto_usuario', false)
                          ->with('detalles.producto') // Cargar detalles y producto
                          ->orderBy('created_at', 'desc')
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

    /**
     * Oculta un pedido para el usuario (Soft Delete desde la vista del usuario)
     */
    public function ocultarPedido(Request $request, $id)
    {
        $usuario = $request->user();
        $pedido = Pedidos::where('usuario_id', $usuario->id)->find($id);

        if (!$pedido) {
            return response()->json(['error' => 'Pedido no encontrado o no autorizado'], 404);
        }

        if ($pedido->estado !== 'Entrega al cliente') {
            return response()->json(['error' => 'Solo puedes borrar pedidos que ya han sido entregados'], 400);
        }

        $pedido->oculto_usuario = true;
        $pedido->save();

        return response()->json(['message' => 'Pedido ocultado con éxito']);
    }
}
