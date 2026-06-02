<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario en la base de datos.
     * Recibe los datos desde Angular, cifra la contraseña y crea el usuario.
     */
    public function register(Request $request)
    {
        // 1. Validamos los datos que nos llegan (solo nombre, email y password obligatorios)
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:6',
        ]);

        // 2. Creamos el usuario en la base de datos
        $usuario = Usuarios::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Contraseña encriptada
            'direccion' => null, // Se rellenará luego en el perfil
            'pais' => null,
            'telefono' => null,
            'rol' => 'usuario', // Rol forzado
        ]);

        // 3. Generamos un token de acceso
        $token = $usuario->createToken('auth_token')->plainTextToken;

        // 4. Devolvemos la respuesta
        return response()->json([
            'mensaje' => 'Usuario registrado con éxito',
            'usuario' => $usuario,
            'token' => $token,
        ], 201);
    }

    /**
     * Inicia sesión con un usuario existente.
     * Permite loguearse con nombre de usuario o con email.
     */
    public function login(Request $request)
    {
        // 1. Validamos que nos manden el identificador (nombre o email) y contraseña
        $request->validate([
            'identificador' => 'required|string',
            'password' => 'required|string',
        ]);

        // 2. Buscamos al usuario por email o por nombre
        $usuario = Usuarios::where('email', $request->identificador)
                           ->orWhere('nombre', $request->identificador)
                           ->first();

        // 3. Comprobamos si existe y si la contraseña es correcta
        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            throw ValidationException::withMessages([
                'credenciales' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // 4. Generamos el token de acceso
        $token = $usuario->createToken('auth_token')->plainTextToken;

        // 5. Devolvemos el token y los datos del usuario
        return response()->json([
            'mensaje' => 'Inicio de sesión correcto',
            'usuario' => $usuario,
            'token' => $token,
        ], 200);
    }

    /**
     * Cierra la sesión (elimina los tokens del usuario).
     */
    public function logout(Request $request)
    {
        // Elimina todos los tokens del usuario actual
        $request->user()->tokens()->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada con éxito'
        ]);
    }

    /**
     * Redirige al usuario a Google para autenticarse.
     */
    public function redirectToGoogle()
    {
        // Redirigimos a la página de login de Google. 
        // Usamos stateless() porque Angular (cliente separado) no maneja la sesión de Laravel.
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl()
        ]);
    }

    /**
     * Maneja el retorno desde Google y loguea/registra al usuario.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Buscar si ya existe por google_id o por email
            $usuario = Usuarios::where('google_id', $googleUser->getId())
                               ->orWhere('email', $googleUser->getEmail())
                               ->first();

            if ($usuario) {
                // Si existe pero no tiene google_id, lo actualizamos
                if (!$usuario->google_id) {
                    $usuario->update(['google_id' => $googleUser->getId()]);
                }
            } else {
                // Si no existe, lo creamos
                $usuario = Usuarios::create([
                    'nombre' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => null, // No tiene contraseña
                    'rol' => 'usuario'
                ]);
            }

            // Generamos el token de acceso
            $token = $usuario->createToken('auth_token')->plainTextToken;

            // Redirigimos al frontend pasándole el token en la URL
            return redirect('http://localhost:4200/auth/callback?token=' . $token);

        } catch (\Exception $e) {
            // En caso de error (ej. usuario cancela), redirigimos al login con error
            return redirect('http://localhost:4200/login?error=google_auth_failed');
        }
    }
}
