<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuarios extends Model
{

    // 1. Campos que se pueden llenar masivamente
    protected $fillable = [
        'rol',
        'nombre',
        'direccion',
        'pais',
        'telefono'
    ];

    // 2. Relación: Un Usuario tiene muchos Pedidos (1 a N)
    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
}
