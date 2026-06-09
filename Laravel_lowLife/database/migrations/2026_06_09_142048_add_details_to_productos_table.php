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
        Schema::table('productos', function (Blueprint $table) {
            $table->string('tallas')->nullable();
            $table->string('estado')->default('draft');
            $table->string('categoria')->nullable();
            $table->string('proveedor_nombre')->nullable();
            $table->string('proveedor_email')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['tallas', 'estado', 'categoria', 'proveedor_nombre', 'proveedor_email']);
        });
    }
};
