<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \DB::table('productos')->insert([
            [
                'titulo' => 'Camiseta Básica Blanca',
                'descripcion' => 'Camiseta de algodón 100% muy cómoda y transpirable.',
                'foto_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop',
                'colores' => 'Blanco,Negro,Gris',
                'precio' => 15.99,
                'stock' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => 'Pantalón Vaquero Clásico',
                'descripcion' => 'Pantalón vaquero de corte recto con tejido elástico.',
                'foto_url' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop',
                'colores' => 'Azul,Negro',
                'precio' => 39.99,
                'stock' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => 'Sudadera con Capucha',
                'descripcion' => 'Sudadera cálida con bolsillo canguro y capucha ajustable.',
                'foto_url' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop',
                'colores' => 'Gris,Rojo,Azul Marino',
                'precio' => 29.50,
                'stock' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo' => 'Zapatillas Urbanas',
                'descripcion' => 'Zapatillas de estilo casual ideales para el día a día.',
                'foto_url' => 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop',
                'colores' => 'Blanco,Negro',
                'precio' => 59.90,
                'stock' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
