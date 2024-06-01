// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:crearEncuesta
// Region --> eu-west-3 (Paris)

// Esta función crea un nuevo registro en la tabla "Encuestas"
// Envía un email a los encuestados con un enlace para responder

const AWS = require('aws-sdk');
const ses = new AWS.SES();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const crypto = require('crypto');

exports.handler = async (event) => {
  let body;
  if (event.body) {
      body = JSON.parse(event.body); 
  } else {
    console.error('No se recibió un cuerpo válido');
    return { statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true, 
        "Content-Type": "application/json"
      },
      body: 'No se recibió un cuerpo válido' 
    };
  }
  const finca_id = body.finca_id;
  console.log(finca_id);
  const motivo = body.motivo;
  const descripcion = body.desc;
  const dateForDynamo = getCurrentFormattedDate();
  const creationDate=new Date();
  const creationDateDynamo=Math.floor(creationDate.getTime()/1000);
  const ttl= Math.floor((creationDate.getTime() / 1000) + (7 * 24 * 60 * 60));
  const ttl_legible = convertEpochToReadableDate(ttl);
  
  // Paso 1: Recuperar inquilinos y propietarios

    const propertiesParams = {
        TableName: 'Properties',
        IndexName: 'Estate',
        KeyConditionExpression: 'Estate = :Estate',
        ExpressionAttributeValues: { ':Estate': finca_id }
    };
    const propertiesResult = await dynamodb.query(propertiesParams).promise();
    let userIds=[];
    userIds = propertiesResult.Items.reduce((acc, property) => {
        if (property.Inquilinos && Array.isArray(property.Inquilinos) && property.Inquilinos.length > 0) {
            acc.push(...property.Inquilinos);
        }
        if (property.Propietarios && Array.isArray(property.Propietarios) && property.Propietarios.length > 0) {
            acc.push(...property.Propietarios);
        }
        return acc;
    }, []);
    
    //---------------
    console.log(userIds);
    //-----------------
    
    // Paso 2: Obtener los emails y USER_IDs (subs) de la tabla Users
    let emailAddresses = [];
    let subs = [];
    for (const userId of userIds) {
        const paramsUserGet = {
            TableName: 'Users',
            Key: { 'USER_ID': userId }
        };
        try {
            const userResponse = await dynamodb.get(paramsUserGet).promise();
            if (userResponse.Item && userResponse.Item.email) {
                emailAddresses.push(userResponse.Item.email);
                subs.push(userResponse.Item.USER_ID);
            }
        } catch (error) {
            console.error(`Error al obtener email para userId ${userId}`, error);
        }
    }
    // Eliminar duplicados
    emailAddresses = [...new Set(emailAddresses)];
    subs=[...new Set(subs)];
    console.log(emailAddresses);
    console.log(subs);
    if (emailAddresses.length === 0) {
        return { statusCode: 404, 
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: 'No se encontraron emails.' 
        };
    }
    
    // Paso 3: Almacenar el evento en la tabla y enviar correos
    const timestamp = Date.now();
    let encuesta_id = `${timestamp}-${finca_id}`;
    console.log(encuesta_id);
    
    // Preparar el mapa de invitados 
    let encuestadosMap = {};
    
    emailAddresses.forEach((email, index) => {

        const token = subs[index];
        const url = `https://tfm-app-icai.s3.eu-west-3.amazonaws.com/votar.html?token=${token}&encuestaId=${encuesta_id}`;
        
        encuestadosMap[token] = {
            "voto": "NSNC",
            "comentario": ""

        }

        
        let boundary = "NextPart";

        // Encabezados del mensaje
        let rawEmailMessage = `From: gestionfincas.tfm@gmail.com\r\n`;
        rawEmailMessage += `To: ${email}\r\n`;
        rawEmailMessage += "Subject: Encuesta\r\n";
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
                    <h1>Nueva Encuesta</h1>
                </div>
                <div class="content">
                    <p><strong>Motivo:</strong> ${motivo}</p>
                    <p><strong>Descripcion:</strong> ${descripcion}</p>
                    <br>
                    <p><strong>Activa hasta:</strong> ${ttl_legible}</p>
                    <br>
                    <p><a href="${url}" class="button">Votar</a></p>
                </div>
                <div class="footer">
                    <p>© 2024 tfm-app-icai.</p>
                </div>
            </div>
        </body>
        </html>
        `;
        rawEmailMessage += "\r\n";
        
        // Configurar los parámetros para el método sendRawEmail
        const params = {
            RawMessage: { Data: rawEmailMessage }
        };
    
        // Envía el correo electrónico con Amazon SES utilizando sendRawEmail
        try {
            const sendEmailResponse = ses.sendRawEmail(params).promise();
            console.log('Correo enviado correctamente.');
            
        } catch (error) {
            console.error('Error al enviar correo con SES', error);
            return { statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(error) };
        }
    //------------
    
    });
    let item = {
        TableName: "Encuestas",
        Item: {
            "ENCUESTA_ID": encuesta_id, 
            "Descripcion": descripcion,
            "Motivo": motivo,
            "Finca": finca_id,
            "Encuestados": encuestadosMap,
            "FechaCreacion": creationDateDynamo, 
            "FechaTTL": ttl 
        }
    };
    try {
        await dynamodb.put(item).promise();
        console.log("Encuesta creada con éxito con ID:", encuesta_id);
        return { statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
        body: JSON.stringify({message: "Correo enviado y evento guardado"}) };

    } catch (error) {
        console.error("Error al crear el evento:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Error al crear el evento",
                error: error.message
            })
        };
    }
}
const getCurrentFormattedDate = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
  
    return `${year}${month}${day}T${hours}${minutes}`;
};

function convertEpochToReadableDate(epoch) {
    const date = new Date(epoch * 1000); // Convertir de segundos a milisegundos
    return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
}
