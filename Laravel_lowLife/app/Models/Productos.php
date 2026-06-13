<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Productos extends Model
{

    protected $fillable = [
        'titulo',
        'descripcion',
        'foto_url',
        'precio',
        'estado',
        'categoria',
        'proveedor_nombre',
        'proveedor_email'
    ];

    // Relación: Un Producto puede estar en muchos Detalles de Pedido (1 a N)
    public function detallesPedidos()
    {
        return $this->hasMany(DetallePedido::class);
    }

    public function variaciones()
    {
        return $this->hasMany(ProductoVariacion::class, 'producto_id');
    }
}
