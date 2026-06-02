<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deseado extends Model
{
    // Comentario: Campos que se pueden rellenar de forma masiva
    protected $fillable = ['usuario_id', 'producto_id'];

    // Comentario: Relación, este like pertenece a un usuario
    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'usuario_id');
    }

    // Comentario: Relación, este like pertenece a un producto
    public function producto()
    {
        return $this->belongsTo(Productos::class, 'producto_id');
    }
}
