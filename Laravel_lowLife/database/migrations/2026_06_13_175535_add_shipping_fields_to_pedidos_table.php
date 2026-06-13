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
        Schema::table('pedidos', function (Blueprint $table) {
            $table->decimal('total', 10, 2)->nullable();
            $table->string('nombre_envio')->nullable();
            $table->string('apellidos_envio')->nullable();
            $table->string('direccion_envio')->nullable();
            $table->string('ciudad')->nullable();
            $table->string('codigo_postal')->nullable();
            $table->string('telefono_envio')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn([
                'total',
                'nombre_envio',
                'apellidos_envio',
                'direccion_envio',
                'ciudad',
                'codigo_postal',
                'telefono_envio'
            ]);
        });
    }
};
