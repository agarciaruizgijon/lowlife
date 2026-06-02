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
        Schema::create('usuarios', function (Blueprint $table) {
            // id: Entero (PK) - Identificador único
            $table->id();

            // rol: Texto / Enum - Define si es 'usuario' normal o 'admin'
            // Le ponemos 'usuario' como valor por defecto para mayor seguridad
            $table->enum('rol', ['usuario', 'admin'])->default('usuario');

            // nombre: Texto - Nombre completo del cliente
            $table->string('nombre');

            // email: Texto - Correo electrónico del usuario (único)
            $table->string('email')->unique();

            // password: Texto - Contraseña para iniciar sesión
            $table->string('password');

            // direccion: Texto - Calle, número, código postal, etc.
            // Puede ser nulo porque se rellena en el perfil
            $table->text('direccion')->nullable();

            // pais: Texto - País de residencia
            $table->string('pais')->nullable();

            // telefono: Texto - Número de contacto
            $table->string('telefono')->nullable();

            // Esto crea los campos 'created_at' y 'updated_at' automáticamente (muy recomendado)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};