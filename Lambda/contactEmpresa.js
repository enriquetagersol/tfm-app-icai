// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:contactEmpresa
// Region --> eu-west-3 (Paris)

// Esta función envía un email a la dirección de contacto de la empresa administradora (tabla "Admins" en DynamoDB)

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
const crypto = require('crypto');

exports.handler = async (event) => {
  
  let body;
    if (event.body) {
        body = JSON.parse(event.body);
    } else {
        console.error('No se recibió un cuerpo válido');
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: 'No se recibió un cuerpo válido'
        };
    }
    
    const admin_id = body.admin_id;
    const msg = body.msg;
    const asunto = body.asunto;
    
    try{
      
      const params = {
        TableName: 'Admins',
        Key: {
          ADMIN_ID: admin_id
        }
      }
      
      const dataAdmin = await dynamoDB.get(params).promise();
      const email_admin = dataAdmin.Item.email;
      
      /*let boundary = "NextPart";
      
      // Encabezados del mensaje
      let rawEmailMessage = `From: gestionfincas.tfm@gmail.com\r\n`;
      rawEmailMessage += `To: ${email_admin}\r\n`;
      rawEmailMessage += `Subject: ${asunto}\r\n`;
      rawEmailMessage += "MIME-Version: 1.0\r\n";
      rawEmailMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
      rawEmailMessage += "\r\n";
      
      // Cuerpo del mensaje en HTML
      rawEmailMessage += `--${boundary}\r\n`;
      rawEmailMessage += "Content-Type: text/html; charset=UTF-8\r\n";
      rawEmailMessage += "Content-Transfer-Encoding: 7bit\r\n";
      rawEmailMessage += "\r\n";
      rawEmailMessage += "<html>\r\n<body>\r\n";
      rawEmailMessage += `<h3>${asunto}</h3>\r\n`;
      rawEmailMessage += `<p>${msg}</p>\r\n`;
      rawEmailMessage += "</body>\r\n</html>\r\n";
      rawEmailMessage += "\r\n";*/
      
      let boundary = "NextPart";
    
      // Encabezados del mensaje
      let rawEmailMessage = `From: gestionfincas.tfm@gmail.com\r\n`;
      rawEmailMessage += `To: ${email_admin}\r\n`;
      rawEmailMessage += `Subject: Notificación de mensaje\r\n`;
      rawEmailMessage += "MIME-Version: 1.0\r\n";
      rawEmailMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
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
            background-color: #FFA600;
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
            background-color: #FFA600;
            color: white;
            text-align: center;
            padding: 10px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
          }
          .content p {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Notificación de mensaje</h1>
          </div>
          <div class="content">
            <p><strong>Asunto:</strong> ${asunto}</p>
            <p><strong>Mensaje:</strong> ${msg}</p>
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
      
      // Configurar los parámetros para sendRawEmail
      const params1 = {
        RawMessage: { Data: rawEmailMessage }
      };
      
      try {
        const sendEmailResponse = await ses.sendRawEmail(params1).promise();
        console.log('Correo enviado correctamente.');

      } catch (error) {
        console.error('Error al enviar correo con SES', error);
      }
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: "Correos electrónicos enviados" })
      };
      
    }catch (error){
      console.error("Error al procesar la solicitud: ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
      
    }
  
};


