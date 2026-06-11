<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

DB::table('usuarios')->insert([
    [
        'nombre' => 'Admin Test',
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'rol' => 'admin',
        'email_verified_at' => Carbon::now(),
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now()
    ],
    [
        'nombre' => 'User Test',
        'email' => 'user@test.com',
        'password' => Hash::make('password123'),
        'rol' => 'usuario',
        'email_verified_at' => Carbon::now(),
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now()
    ]
]);

echo "Users created successfully!\n";
