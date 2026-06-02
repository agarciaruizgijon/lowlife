<?php

namespace App\Http\Controllers;

use App\Models\Usuarios;
use Illuminate\Http\Request;

class UsuariosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Usuarios $usuarios)
    {
        //
    }

    /**
     * Actualiza el perfil del usuario autenticado.
     */
    public function updateProfile(Request $request)
    {
        // 1. Obtenemos el usuario que hace la petición
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        // 2. Validamos los datos de entrada
        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:usuarios,email,' . $usuario->id,
            'direccion' => 'nullable|string|max:255',
            'pais' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            // La foto puede ser un archivo (imagen) o un string (URL)
            'foto_perfil' => 'nullable', 
        ]);

        // 3. Procesamos los datos básicos
        $data = $request->only(['nombre', 'email', 'direccion', 'pais', 'telefono']);

        // 4. Manejamos la foto de perfil
        if ($request->hasFile('foto_perfil')) {
            // Guardamos la imagen en storage/app/public/perfiles
            $path = $request->file('foto_perfil')->store('perfiles', 'public');
            // Guardamos la URL pública (requiere php artisan storage:link)
            $data['foto_perfil'] = url('storage/' . $path);
        } elseif ($request->filled('foto_perfil') && is_string($request->foto_perfil)) {
            // Si mandan una URL como string, la guardamos tal cual
            $data['foto_perfil'] = $request->foto_perfil;
        }

        // 5. Actualizamos y guardamos
        $usuario->update($data);

        return response()->json([
            'mensaje' => 'Perfil actualizado correctamente',
            'usuario' => $usuario
        ]);
    }
}
