<?php

namespace App\Http\Controllers;

use App\Models\Usuarios;
use Illuminate\Http\Request;

class UsuariosController extends Controller
{
    /**
     * Display a listing of the resource.
     * Devuelve todos los usuarios para el panel de administración.
     */
    public function index()
    {
        // Obtenemos todos los usuarios de la base de datos
        $usuarios = Usuarios::all();
        // Devolvemos los usuarios en formato JSON con estado 200 OK
        return response()->json($usuarios, 200);
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
    public function show($id)
    {
        // Buscamos el usuario por su ID
        $usuario = Usuarios::find($id);
        
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($usuario, 200);
    }

    /**
     * Update the specified resource in storage.
     * Actualiza los datos de un usuario desde el panel de administración.
     */
    public function update(Request $request, $id)
    {
        // 1. Buscamos el usuario
        $usuario = Usuarios::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // 2. Validamos los datos permitidos para actualización
        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:usuarios,email,' . $usuario->id,
            'direccion' => 'nullable|string|max:255',
            'pais' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'rol' => 'sometimes|in:admin,usuario',
            'foto_perfil' => 'nullable', // Puede ser archivo o URL
        ]);

        // 3. Procesamos los datos básicos
        $data = $request->only(['nombre', 'email', 'direccion', 'pais', 'telefono', 'rol']);

        // 4. Manejamos la foto de perfil si se envió
        if ($request->hasFile('foto_perfil')) {
            $path = $request->file('foto_perfil')->store('perfiles', 'public');
            $data['foto_perfil'] = url('storage/' . $path);
        } elseif ($request->filled('foto_perfil') && is_string($request->foto_perfil)) {
            $data['foto_perfil'] = $request->foto_perfil;
        }

        // 5. Actualizamos el modelo con los datos recibidos
        $usuario->update($data);

        // 4. Devolvemos respuesta de éxito
        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'usuario' => $usuario
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     * Elimina un usuario específico de la base de datos.
     */
    public function destroy($id)
    {
        // Buscamos el usuario por su ID
        $usuario = Usuarios::find($id);

        if (!$usuario) {
            // Si no existe, devolvemos un error 404
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // Eliminamos el usuario
        $usuario->delete();

        // Devolvemos un mensaje de éxito
        return response()->json(['message' => 'Usuario eliminado correctamente'], 200);
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
