<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Usuarios;

class VerifyEmailMailable extends Mailable
{
    use Queueable, SerializesModels;

    // Propiedades públicas que se pasan a la vista de Blade (email)
    public $user;
    public $url;

    /**
     * Constructor de la clase (lo que se ejecuta al crear 'new VerifyEmailMailable(...)')
     * Recibe al usuario para poder poner su nombre en el email y la URL segura de verificación.
     */
    public function __construct(Usuarios $user, string $url)
    {
        $this->user = $user;
        $this->url = $url;
    }

    /**
     * Define el "sobre" (envelope) del correo, que básicamente es el Asunto (Subject).
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verifica tu cuenta en LowLife',
        );
    }

    /**
     * Define el "contenido" (content) del correo, indicando qué vista Blade utilizar.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verify', // Busca en resources/views/emails/verify.blade.php
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
