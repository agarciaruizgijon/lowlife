<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            margin-top: 40px;
        }
        .header {
            font-size: 28px;
            font-weight: bold;
            color: #333333;
            margin-bottom: 20px;
        }
        .text {
            font-size: 16px;
            color: #555555;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 5px;
            font-weight: bold;
        }
        .btn:hover {
            background-color: #333333;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #aaaaaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ¡Bienvenido a LowLife, {{ $user->nombre }}!
        </div>
        <div class="text">
            Estamos muy contentos de que te hayas unido a nuestra comunidad. 
            Para poder acceder a todas las funciones y empezar a añadir productos a tu cesta o lista de deseos, 
            necesitamos que verifiques tu correo electrónico pulsando en el botón de abajo.
        </div>
        <a href="{{ $url }}" class="btn">Verificar mi cuenta</a>
        
        <div class="text" style="margin-top: 30px; font-size: 14px;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
            <a href="{{ $url }}">{{ $url }}</a>
        </div>
        
        <div class="footer">
            Si no te has registrado en LowLife, puedes ignorar este correo con total tranquilidad.
            <br><br>
            © {{ date('Y') }} LowLife. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
