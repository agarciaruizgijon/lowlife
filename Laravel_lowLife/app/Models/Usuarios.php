<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// Importamos el trait HasApiTokens para poder generar tokens de autenticación
use Laravel\Sanctum\HasApiTokens;

class Usuarios extends Model
{
    // Añadimos el trait HasApiTokens para que este modelo pueda emitir tokens de Sanctum
    use HasApiTokens;

    // 1. Campos que se pueden llenar masivamente
    protected $fillable = [
        'rol',
        'nombre',
        'email',
        'password',
        'google_id',
        'foto_perfil',
        'direccion',
        'pais',
        'telefono'
    ];

    // Campos ocultos al serializar el modelo (no se devuelven en las respuestas JSON)
    protected $hidden = [
        'password',
    ];

    // 2. Relación: Un Usuario tiene muchos Pedidos (1 a N)
    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
}
