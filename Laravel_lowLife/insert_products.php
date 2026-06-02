<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Productos;

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
Productos::truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

Productos::create([
    'titulo' => 'Zapatillas Urbanas Clásicas',
    'descripcion' => 'Zapatillas de estilo urbano, cómodas y resistentes para el día a día.',
    'foto_url' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80',
    'colores' => '#ffffff,#000000',
    'precio' => 59.99,
    'stock' => 20
]);

Productos::create([
    'titulo' => 'Sudadera Casual',
    'descripcion' => 'Sudadera de algodón con capucha, ideal para climas fríos.',
    'foto_url' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80',
    'colores' => '#e53935,#3f51b5',
    'precio' => 35.50,
    'stock' => 15
]);

Productos::create([
    'titulo' => 'Reloj Deportivo',
    'descripcion' => 'Reloj resistente al agua con funciones inteligentes.',
    'foto_url' => 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80',
    'colores' => '#000000',
    'precio' => 120.00,
    'stock' => 5
]);

echo "Productos insertados correctamente.\n";
