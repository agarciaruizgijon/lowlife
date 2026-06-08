<?php
use Illuminate\Support\Facades\Mail;
use App\Models\Usuarios;
use App\Mail\VerifyEmailMailable;

try {
    $usuario = Usuarios::first();
    Mail::to('test@example.com')->send(new VerifyEmailMailable($usuario, 'http://localhost'));
    echo "Mail sent successfully.\n";
} catch (\Exception $e) {
    echo "Error sending mail:\n";
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
