<?php

namespace App\Http\Controllers;

use App\Models\Productos;
use Illuminate\Http\Request;

class ProductosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Productos::with('variaciones')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric',
            'foto_url' => 'nullable', // puede ser string (URL) o file (imagen local)
            'estado' => 'nullable|string',
            'categoria' => 'nullable|string',
            'proveedor_nombre' => 'nullable|string',
            'proveedor_email' => 'nullable|email',
            'variaciones' => 'nullable|string', // JSON string con las variaciones
        ]);

        $data = $request->except(['foto_url', 'variaciones']);

        // Manejar subida de foto de producto
        if ($request->hasFile('foto_url')) {
            $path = $request->file('foto_url')->store('productos', 'public');
            $data['foto_url'] = url('storage/' . $path);
        } elseif ($request->filled('foto_url') && is_string($request->foto_url)) {
            $data['foto_url'] = $request->foto_url;
        }

        $producto = Productos::create($data);

        if ($request->filled('variaciones')) {
            $variaciones = json_decode($request->variaciones, true);
            if (is_array($variaciones)) {
                foreach ($variaciones as $var) {
                    $producto->variaciones()->create([
                        'talla' => $var['talla'] ?? null,
                        'color_nombre' => $var['color_nombre'] ?? null,
                        'color_hex' => $var['color_hex'] ?? null,
                        'stock' => $var['stock'] ?? 0,
                    ]);
                }
            }
        }

        $producto->load('variaciones');

        return response()->json($producto, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $producto = Productos::with('variaciones')->find($id);
        if (!$producto) {
            return response()->json(['message' => 'Not Found'], 404);
        }
        return response()->json($producto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $producto = Productos::find($id);
        if (!$producto) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'precio' => 'required|numeric',
            'foto_url' => 'nullable', 
            'estado' => 'nullable|string',
            'categoria' => 'nullable|string',
            'proveedor_nombre' => 'nullable|string',
            'proveedor_email' => 'nullable|email',
            'variaciones' => 'nullable|string',
        ]);

        $data = $request->except(['foto_url', 'variaciones']);

        // Manejar subida de foto de producto
        if ($request->hasFile('foto_url')) {
            $path = $request->file('foto_url')->store('productos', 'public');
            $data['foto_url'] = url('storage/' . $path);
        } elseif ($request->filled('foto_url') && is_string($request->foto_url)) {
            $data['foto_url'] = $request->foto_url;
        }

        $producto->update($data);

        if ($request->has('variaciones')) {
            $variaciones = json_decode($request->variaciones, true);
            // Recrear variaciones para simplificar
            $producto->variaciones()->delete();
            if (is_array($variaciones)) {
                foreach ($variaciones as $var) {
                    $producto->variaciones()->create([
                        'talla' => $var['talla'] ?? null,
                        'color_nombre' => $var['color_nombre'] ?? null,
                        'color_hex' => $var['color_hex'] ?? null,
                        'stock' => $var['stock'] ?? 0,
                    ]);
                }
            }
        }

        $producto->load('variaciones');

        return response()->json($producto, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $producto = Productos::find($id);
        if (!$producto) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $producto->delete();

        return response()->json(['message' => 'Producto eliminado correctamente'], 200);
    }
}
