<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #1a1a1a;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }
        .header h1 {
            margin: 0;
            font-weight: 300;
            letter-spacing: 2px;
            font-size: 24px;
        }
        .content {
            padding: 40px;
            color: #333333;
            line-height: 1.6;
        }
        .code-container {
            text-align: center;
            margin: 30px 0;
        }
        .code {
            display: inline-block;
            font-size: 32px;
            font-weight: bold;
            color: #1a1a1a;
            background-color: #f9f9f9;
            border: 2px dashed #cccccc;
            padding: 15px 30px;
            letter-spacing: 5px;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #888888;
            background-color: #f9f9f9;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ELUXAR</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Eluxar. Usa el siguiente código de seguridad de 6 dígitos para completar el proceso:</p>
            
            <div class="code-container">
                <div class="code">${codigo}</div>
            </div>
            
            <p>Este código <strong>expirará en 10 minutos</strong> y solo puede ser usado una vez.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará hasta que ingreses este código en la aplicación.</p>
        </div>
        <div class="footer">
            <p>&copy; ${anio} Eluxar. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
