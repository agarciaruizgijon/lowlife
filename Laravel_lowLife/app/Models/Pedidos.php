<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedidos extends Model
{

    protected $fillable = [
        'usuario_id',
        'fecha',
        'procesado'
    ];

    // Relación: Un Pedido pertenece a un Usuario (N a 1)
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    // Relación: Un Pedido tiene muchos Detalles (1 a N)
    public function detalles()
    {
        return $this->hasMany(DetallePedido::class);
    }
}
