<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuarios;
use App\Models\Productos;
use App\Models\Pedidos;
use App\Models\Detalles_Pedido;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class PedidosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Obtener o crear un usuario de prueba
        $usuario = Usuarios::first();
        if (!$usuario) {
            $usuario = Usuarios::create([
                'name' => 'Cliente de Prueba',
                'email' => 'cliente@prueba.com',
                'password' => Hash::make('password123'),
                'rol' => 'usuario'
            ]);
        }

        // 2. Obtener o crear productos de prueba
        $productos = Productos::all();
        if ($productos->isEmpty()) {
            $productos = collect([
                Productos::create([
                    'name' => 'Camiseta LowLife Black', 
                    'precio' => 25.99, 
                    'stock' => 50, 
                    'category' => 'Camisetas', 
                    'image' => 'https://via.placeholder.com/300'
                ]),
                Productos::create([
                    'name' => 'Sudadera Classic', 
                    'precio' => 45.00, 
                    'stock' => 30, 
                    'category' => 'Sudaderas', 
                    'image' => 'https://via.placeholder.com/300'
                ]),
                Productos::create([
                    'name' => 'Gorra Urban', 
                    'precio' => 15.50, 
                    'stock' => 100, 
                    'category' => 'Accesorios', 
                    'image' => 'https://via.placeholder.com/300'
                ])
            ]);
        }

        // 3. Crear Pedido 1 (Pendiente)
        $pedido1 = Pedidos::create([
            'usuario_id' => $usuario->id,
            'fecha' => Carbon::now()->subDays(2),
            'procesado' => false
        ]);
        Detalles_Pedido::create([
            'pedido_id' => $pedido1->id, 
            'producto_id' => $productos[0]->id, 
            'cantidad' => 2
        ]);
        if (isset($productos[1])) {
            Detalles_Pedido::create([
                'pedido_id' => $pedido1->id, 
                'producto_id' => $productos[1]->id, 
                'cantidad' => 1
            ]);
        }

        // 4. Crear Pedido 2 (Procesado)
        $pedido2 = Pedidos::create([
            'usuario_id' => $usuario->id,
            'fecha' => Carbon::now()->subDays(5),
            'procesado' => true
        ]);
        if (isset($productos[2])) {
            Detalles_Pedido::create([
                'pedido_id' => $pedido2->id, 
                'producto_id' => $productos[2]->id, 
                'cantidad' => 3
            ]);
        } else {
            Detalles_Pedido::create([
                'pedido_id' => $pedido2->id, 
                'producto_id' => $productos[0]->id, 
                'cantidad' => 1
            ]);
        }

        // 5. Crear Pedido 3 (Pendiente)
        $pedido3 = Pedidos::create([
            'usuario_id' => $usuario->id,
            'fecha' => Carbon::now()->subHours(5),
            'procesado' => false
        ]);
        Detalles_Pedido::create([
            'pedido_id' => $pedido3->id, 
            'producto_id' => $productos[0]->id, 
            'cantidad' => 1
        ]);
        
        $this->command->info('Pedidos de prueba creados correctamente. ¡Listo para probar!');
    }
}
