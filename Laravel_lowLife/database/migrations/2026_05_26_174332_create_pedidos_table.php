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
        Schema::create('pedidos', function (Blueprint $table) {
            // id: Entero (PK) - Número de pedido único
            $table->id();

            // usuario_id: Entero (FK) - Conecta con el id del Usuario
            // En Laravel, 'foreignId' y 'constrained' hacen la magia de enlazar las tablas automáticamente.
            // Le añadimos 'cascade' para que si borras un usuario, se borren sus pedidos (opcional pero recomendado).
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');

            // fecha: Fecha/Hora - Cuándo se realizó el pedido
            $table->dateTime('fecha');

            // procesado: Booleano - true (pasado al proveedor) / false (pendiente)
            // Le ponemos false por defecto, ya que al crearlo recién estará pendiente.
            $table->boolean('procesado')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};