<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuarios;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use App\Mail\VerifyEmailMailable;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario
     */
    public function registro(Request $request)
    {
        // 1. Validar los datos de entrada (asegurarnos de que recibimos nombre, email único y contraseña)
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:6',
        ]);

        // Si la validación falla, devolvemos un error 400 (Bad Request)
        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // 2. Crear el usuario en la base de datos con los datos validados
        $usuario = Usuarios::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Encriptamos la contraseña
            'rol' => 'usuario' // Todos los nuevos registrados son 'usuarios' por defecto
        ]);

        // 3. Generar la URL firmada para la verificación de correo
        // 'temporarySignedRoute' crea un enlace seguro y único que caduca en 60 minutos
        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify', // Nombre de la ruta en api.php
            now()->addMinutes(60), // Tiempo de expiración del enlace
            ['id' => $usuario->id, 'hash' => sha1($usuario->email)] // Parámetros seguros que enviamos
        );

        // 4. Enviar el correo electrónico con el enlace usando la plantilla VerifyEmailMailable
        try {
            Mail::to($usuario->email)->send(new VerifyEmailMailable($usuario, $verifyUrl));
        } catch (\Exception $e) {
            // Si el correo falla (por ejemplo, Mailtrap está caído), ignoramos el error para no bloquear el registro
        }

        // Responder al cliente (Angular) que todo ha ido bien
        return response()->json([
            'mensaje' => 'Usuario registrado con éxito. Por favor, verifica tu correo.',
            'usuario' => $usuario
        ], 201);
    }

    /**
     * Verificar correo electrónico a través del enlace que llega al mail.
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        // 1. Buscamos al usuario por su ID
        $user = Usuarios::find($id);

        // Si no existe, redirigimos al frontend mostrando un error
        if (!$user) {
            return redirect('http://localhost:4200/login?error=user_not_found');
        }

        // 2. Verificamos que el código (hash) sea correcto comparándolo con el email del usuario
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect('http://localhost:4200/login?error=invalid_hash');
        }

        // 3. Si el usuario ya había verificado su correo antes, le avisamos
        if ($user->hasVerifiedEmail()) {
            return redirect('http://localhost:4200/login?verified=already');
        }

        // 4. Si todo es correcto, marcamos su cuenta como verificada en la base de datos
        if ($user->markEmailAsVerified()) {
            // Aquí podríamos enviar un evento extra si el sistema lo requiriera
        }

        // 5. Redirigimos al usuario a Angular con el parámetro 'verified=success' para que le salga la alerta verde
        return redirect('http://localhost:4200/login?verified=success');
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

        // 3.5. Comprobamos si el usuario ha verificado su cuenta de correo.
        // Si la columna email_verified_at es nula, significa que no ha clicado en el correo de verificación.
        // En ese caso, bloqueamos el inicio de sesión y lanzamos un error que el frontend puede mostrar.
        if (!$usuario->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                // Mandamos un mensaje claro indicando que falta la verificación
                'verificacion' => ['Por favor, verifica tu cuenta desde el enlace que enviamos a tu correo antes de iniciar sesión.'],
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
