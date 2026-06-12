<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Detalles_Pedido extends Model
{


    // Le decimos exactamente cómo se llama la tabla en la base de datos
    protected $table = 'detalles_pedidos';

    protected $fillable = [
        'pedido_id',
        'producto_id',
        'cantidad'
    ];

    // Relación: Este detalle pertenece a un Pedido específico
    public function pedido()
    {
        return $this->belongsTo(Pedidos::class, 'pedido_id');
    }

    // Relación: Este detalle pertenece a un Producto específico
    public function producto()
    {
        return $this->belongsTo(Productos::class, 'producto_id');
    }
}
