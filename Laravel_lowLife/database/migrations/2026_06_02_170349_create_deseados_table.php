<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deseados', function (Blueprint $table) {
            $table->id();
            // Comentario: ID del usuario que da "like"
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            // Comentario: ID del producto que gusta
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->timestamps();

            // Comentario: Evitar que un usuario de "like" al mismo producto varias veces
            $table->unique(['usuario_id', 'producto_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deseados');
    }
};
