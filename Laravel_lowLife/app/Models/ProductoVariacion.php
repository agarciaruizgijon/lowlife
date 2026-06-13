<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoVariacion extends Model
{
    protected $table = 'producto_variaciones';
    protected $fillable = ['producto_id', 'talla', 'color_nombre', 'color_hex', 'stock'];

    public function producto()
    {
        return $this->belongsTo(Productos::class, 'producto_id');
    }
}
