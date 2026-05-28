<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumen de Compra - Eluxar</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 40px;
            color: #111111;
            border: 1px solid #eeeeee;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-weight: 300;
            letter-spacing: 2px;
            font-size: 24px;
            margin: 0;
            text-transform: uppercase;
        }
        .greeting {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
            color: #444444;
        }
        .order-meta {
            font-size: 12px;
            color: #888888;
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #eeeeee;
            padding-bottom: 15px;
        }
        .order-meta p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 15px 0;
            border-bottom: 1px solid #eeeeee;
            font-size: 13px;
        }
        th {
            text-align: left;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 10px;
            letter-spacing: 1px;
            color: #888888;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-top: 20px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 8px 0;
            color: #444444;
        }
        .totals-row.grand-total {
            font-size: 16px;
            font-weight: bold;
            color: #111111;
            border-top: 1px solid #111111;
            padding-top: 15px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ELUXAR</h1>
        </div>
        
        <div class="greeting">
            Hola ${nombre},<br><br>
            Gracias por tu compra. Tu pedido ha sido confirmado y está siendo procesado. A continuación, encontrarás los detalles de tu factura.
        </div>

        <div class="order-meta">
            <p><strong>Pedido #:</strong> ${pedidoId}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Método de pago:</strong> ${metodoPago}</p>
            <p><strong>Dirección de envío:</strong> ${direccion}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cant</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                <#list items as item>
                <tr>
                    <td>
                        <div style="font-weight: bold;">${item.productoNombre}</div>
                        <div style="font-size: 11px; color: #888;">${item.tamanoMl}ml</div>
                    </td>
                    <td style="text-align: center; color: #444;">${item.cantidad}</td>
                    <td class="text-right" style="color: #444;">$${item.subtotalStr}</td>
                </tr>
                </#list>
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal</span>
                <span>$${subtotalStr}</span>
            </div>
            <#if descuento != 0>
            <div class="totals-row" style="color: #3A4A3F;">
                <span>Descuento</span>
                <span>-$${descuentoStr}</span>
            </div>
            </#if>
            <div class="totals-row">
                <span>Envío</span>
                <span>Gratis</span>
            </div>
            <div class="totals-row grand-total">
                <span>Total pagado (COP)</span>
                <span>$${totalStr}</span>
            </div>
        </div>

        <div class="footer">
            &copy; ${anio} Eluxar Logistics.<br>
            Este es un correo generado automáticamente. Por favor, no respondas a este mensaje.
        </div>
    </div>
</body>
</html>
