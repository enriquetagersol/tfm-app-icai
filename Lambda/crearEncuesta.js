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
  

    //Paso 1: Recuperar inquilinos y propietarios
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
    //----------------
    
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

    //------------------
    console.log(emailAddresses);
    console.log(subs);
    //------------------
  
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
    //-----------------
    console.log(encuesta_id);
    //------------------
    
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
        rawEmailMessage += "<html>\r\n<body>\r\n";
        rawEmailMessage += `<h3>${motivo}</h3>\r\n`;
        rawEmailMessage += `<p>${descripcion}</p>\r\n`;
        rawEmailMessage +=  `<p>
                    <a href="${url}">Votar</a>
                </p>\r\n`;
        rawEmailMessage += "</body>\r\n</html>\r\n";
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
