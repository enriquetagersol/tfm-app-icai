//ARN --> arn:aws:lambda:eu-west-3:699928454448:function:difundirMensaje
//Region --> eu-west-3 (París)

//Esta función envía un mensaje de correo electrónico a los propietarios y/o inquilinos de una finca



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
    const estateId = body.finca_id;
    const asunto = body.asunto;
    const mensaje = body.mensaje;
    const destinatarios = body.destinatarios;
    console.log(destinatarios);

    try {
        // Paso 1: Consultar en la tabla Properties los registros con el Estate_Id dado
        const propertiesParams = {
            TableName: 'Properties',
            IndexName: 'Estate',
            KeyConditionExpression: 'Estate = :Estate',
            ExpressionAttributeValues: { ':Estate': estateId }
        };

        const propertiesResult = await dynamoDB.query(propertiesParams).promise();
        let userList=[];
        
        if(destinatarios=='Propietarios'){
            // Extraer la lista de usuarios de cada registro y unirlas en una sola lista
            userList = propertiesResult.Items.reduce((acc, property) => {
                if (property.Propietarios && Array.isArray(property.Propietarios) && property.Propietarios.length > 0) {
                    acc.push(...property.Propietarios);
                }
                return acc;
            }, []);

            console.log(userList); 
        }else if(destinatarios=='Inquilinos'){
            userList = propertiesResult.Items.reduce((acc, property) => {
                if (property.Inquilinos && Array.isArray(property.Inquilinos) && property.Inquilinos.length > 0) {
                    acc.push(...property.Inquilinos);
                }
                return acc;
            }, []);

            console.log(userList); 
        }else if (destinatarios == 'Todos'){
            userList = propertiesResult.Items.reduce((acc, property) => {
                if (property.Inquilinos && Array.isArray(property.Inquilinos) && property.Inquilinos.length > 0) {
                    acc.push(...property.Inquilinos);
                }
                if (property.Propietarios && Array.isArray(property.Propietarios) && property.Propietarios.length > 0) {
                    acc.push(...property.Propietarios);
                }
                return acc;
            }, []);

            console.log(userList);
        }

        // Paso 2: Obtener los emails de la tabla Users
        let emailAddresses = [];
        for (const userId of userList) {
            const paramsUserGet = {
                TableName: 'Users',
                Key: { 'USER_ID': userId }
            };
            try {
                const userResponse = await dynamoDB.get(paramsUserGet).promise();
                if (userResponse.Item && userResponse.Item.email) {
                    emailAddresses.push(userResponse.Item.email);
                }
            } catch (error) {
                console.error(`Error al obtener email para userId ${userId}`, error);
            }
        }
        // Eliminar duplicados
        emailAddresses = [...new Set(emailAddresses)];
        
        //CONTROL-------
        console.log(emailAddresses);
        //-----------
        
        if (emailAddresses.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                    "Content-Type": "application/json"
                },
                body: 'No se encontraron emails.'
            };
        }

        // Envío de correos electrónicos
        emailAddresses.forEach(async email => {

            
            let boundary = "NextPart";

            // Encabezados del mensaje
            let rawEmailMessage = `From: gestionfincas.tfm@gmail.com\r\n`;
            rawEmailMessage += `To: ${email}\r\n`;
            rawEmailMessage += "Subject: Notificación de mensaje\r\n";
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
                        <p><strong>Mensaje:</strong> ${mensaje}</p>
                    <br>
                    </div>
                    <div class="footer">
                        <p>© 2024 tfm-app-icai.</p>
                    </div>
                </div>
            </body>
            </html>
            `;
            rawEmailMessage += "\r\n";
            

            // Configurar los parámetros para sendRawEmail
            const params = {
                RawMessage: { Data: rawEmailMessage }
            };

            // Envía el correo electrónico con Amazon SES utilizando sendRawEmail
            try {
                const sendEmailResponse = await ses.sendRawEmail(params).promise();
                console.log('Correo enviado correctamente.');

            } catch (error) {
                console.error('Error al enviar correo con SES', error);
            }
        });

        // Después de enviar todos los correos electrónicos, devolver una respuesta exitosa
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Correos electrónicos enviados" })
        };

    } catch (error) {
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
