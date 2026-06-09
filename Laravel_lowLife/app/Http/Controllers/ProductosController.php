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
        return response()->json(Productos::all());
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
            'stock' => 'required|integer',
            'foto_url' => 'nullable', // puede ser string (URL) o file (imagen local)
            'colores' => 'nullable|string',
            'tallas' => 'nullable|string',
            'estado' => 'nullable|string',
            'categoria' => 'nullable|string',
            'proveedor_nombre' => 'nullable|string',
            'proveedor_email' => 'nullable|email',
        ]);

        $data = $request->except('foto_url');

        // Manejar subida de foto de producto
        if ($request->hasFile('foto_url')) {
            $path = $request->file('foto_url')->store('productos', 'public');
            $data['foto_url'] = url('storage/' . $path);
        } elseif ($request->filled('foto_url') && is_string($request->foto_url)) {
            $data['foto_url'] = $request->foto_url;
        }

        $producto = Productos::create($data);

        return response()->json($producto, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $producto = Productos::find($id);
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
            'stock' => 'required|integer',
            'foto_url' => 'nullable', 
            'colores' => 'nullable|string',
            'tallas' => 'nullable|string',
            'estado' => 'nullable|string',
            'categoria' => 'nullable|string',
            'proveedor_nombre' => 'nullable|string',
            'proveedor_email' => 'nullable|email',
        ]);

        $data = $request->except('foto_url');

        // Manejar subida de foto de producto
        if ($request->hasFile('foto_url')) {
            $path = $request->file('foto_url')->store('productos', 'public');
            $data['foto_url'] = url('storage/' . $path);
        } elseif ($request->filled('foto_url') && is_string($request->foto_url)) {
            $data['foto_url'] = $request->foto_url;
        }

        $producto->update($data);

        return response()->json($producto, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Productos $productos)
    {
        //
    }
}
