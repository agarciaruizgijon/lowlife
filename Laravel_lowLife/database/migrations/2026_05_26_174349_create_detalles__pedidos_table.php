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
        Schema::create('detalles_pedidos', function (Blueprint $table) {
            // id: Entero (PK) - Identificador único de esta línea de compra
            $table->id();

            // pedido_id: Entero (FK) - Conecta con la tabla 'pedidos'
            // Añadimos cascade: Si eliminas un pedido, se borrarán automáticamente sus detalles
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');

            // producto_id: Entero (FK) - Conecta con la tabla 'productos'
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');

            // cantidad: Entero - Cuántas unidades compró de ese producto
            $table->integer('cantidad');

            // Campos automáticos de fecha (created_at y updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalles_pedidos');
    }
};