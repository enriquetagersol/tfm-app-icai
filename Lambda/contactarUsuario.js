// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:contactarUsuario
// Region --> eu-west-3 (París)

// Esta función envía un email a un usuario de forma individual

const AWS = require('aws-sdk');
const ses = new AWS.SES();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const { email, asunto, mensaje } = requestBody;

    if (!email || !asunto || !mensaje) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "El campo 'email', 'asunto' o 'mensaje' está vacío o no se proporcionó." })
        };
    }

let boundary = "NextPart";
    
    // Encabezados del mensaje
    let rawEmailMessage = `From: gestionfincas.tfm@gmail.com\r\n`;
    rawEmailMessage += `To: ${email}\r\n`;
    rawEmailMessage += "Subject: Notificación de mensaje\r\n";
    rawEmailMessage += "MIME-Version: 1.0\r\n";
    rawEmailMessage += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;
    rawEmailMessage += "\r\n";
    
    // Cuerpo del mensaje en HTML
    rawEmailMessage += `--${boundary}\r\n`;
    rawEmailMessage += "Content-Type: text/html; charset=UTF-8\r\n";
    rawEmailMessage += "Content-Transfer-Encoding: 7bit\r\n";
    rawEmailMessage += "\r\n";
    rawEmailMessage += `
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
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #295E7E;
            color: white;
            padding: 20px;
            text-align: center;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .content {
            padding: 20px;
        }
        .footer {
            background-color: #295E7E;
            color: white;
            text-align: center;
            padding: 10px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
        }
        .button {
            background-color: #295E7E;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            border-radius: 5px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #1558b3;
        }
        .content p {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Notificación de Mensaje</h1>
        </div>
        <div class="content">
            <p><strong>Asunto:</strong> ${asunto}</p>
            <p><strong>Mensaje:</strong> ${mensaje}</p>
        </div>
        <div class="footer">
            <p>© 2024 tfm-app-icai.</p>
        </div>
    </div>
</body>
</html>
    `;
    rawEmailMessage += "\r\n";
    rawEmailMessage += `--${boundary}--\r\n`;

    const params = {
        RawMessage: { Data: rawEmailMessage }
    };

    try {
        await ses.sendRawEmail(params).promise();
        console.log(`Correo enviado a ${email}`);
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "OK" })
        };
    } catch (error) {
        console.error(`Error al enviar el correo a ${email}:`, error);
        throw new Error(`Error al enviar el correo a ${email}`);
    }
};
