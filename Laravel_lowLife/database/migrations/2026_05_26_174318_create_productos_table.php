<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            // id: Entero (PK) - Identificador único
            $table->id();

            // titulo: Texto - Nombre del producto
            $table->string('titulo');

            // descripcion: Texto - Detalles del producto
            // Usamos 'text' porque las descripciones suelen ser largas
            $table->text('descripcion');

            // foto_url: Texto - Enlace de la imagen
            // Usamos 'string' (equivale a VARCHAR de 255 caracteres) que es suficiente para una URL
            $table->string('foto_url')->nullable(); // Le pongo nullable() por si un producto se crea sin foto inicial

            // colores: Texto - Colores disponibles separados por comas
            $table->string('colores')->nullable();

            // precio: Decimal - Precio de venta al público
            $table->decimal('precio', 8, 2);

            // Stock: Entero - Cantidad disponible
            $table->integer('stock');

            // Campos automáticos de Laravel para saber cuándo se creó y actualizó
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};