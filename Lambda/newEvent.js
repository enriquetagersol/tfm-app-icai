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
    const fincaId = body.finca_evento;
    if (!body.start_evento || !body.end_evento) {
        console.error('start_evento o end_evento están undefined');
        return { statusCode: 400, 
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: 'Los campos de inicio y fin del evento son requeridos.' 
        };
    }
    const start = body.start_evento.replace(/[-:]/g, ''); // Formato: YYYYMMDDTHHMMSS
    const end = body.end_evento.replace(/[-:]/g, ''); // Formato: YYYYMMDDTHHMMSS
    const titulo = body.titulo_evento;
    const descripcion = body.descripcion_evento;
    //const finca = body.finca_evento;
    
    const propertiesParams = {
        TableName: 'Properties',
        IndexName: 'Estate',
        KeyConditionExpression: 'Estate = :Estate',
        ExpressionAttributeValues: { ':Estate': fincaId }
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
    
    //CONTROL----
    console.log(userIds);
    //-----

    // Paso 2: Obtener los emails de la tabla Users
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
    
    //CONTROL----
    console.log(emailAddresses);
    //-------
    
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
    

    const timestamp = Date.now();
    let event_id = `${timestamp}-${fincaId}`;
    
    //CONTROL----
    console.log(event_id);
    //------
    
    //Creación del evento iCal
    const icalContent = generateICalEvent(start, end, titulo, descripcion);
    const encodedICalContent = Buffer.from(icalContent).toString('base64');
    
    // Preparar el mapa de invitados y envio de correo con token
    let invitadosMap = {};
    emailAddresses.forEach((email, index) => {
        // Generar un token único para cada invitado (su id de usuario)

        const token = subs[index];

        const confirmUrl = `https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/asistencia/confirmar?token=${token}&eventoId=${event_id}`;
        
        const declineUrl = `https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/asistencia/declinar?token=${token}&eventoId=${event_id}`;

        invitadosMap[token] = {
            "asistencia": "Sin confirmar",
            "decline_url": declineUrl,
            "confirm_url": confirmUrl
        }
        
        let boundary = "NextPart";
    
       // Encabezados del mensaje
        let rawEmailMessage = `From: gestionfincas.tfm@gmail.com\r\n`;
        rawEmailMessage += `To: ${email}\r\n`;
        rawEmailMessage += "Subject: Nuevo Evento\r\n";
        rawEmailMessage += "MIME-Version: 1.0\r\n";
        rawEmailMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
        rawEmailMessage += "\r\n";
        
        // Cuerpo del mensaje en HTML
        rawEmailMessage += `--${boundary}\r\n`;
        rawEmailMessage += "Content-Type: text/html; charset=UTF-8\r\n";
        rawEmailMessage += "Content-Transfer-Encoding: 7bit\r\n";
        rawEmailMessage += "\r\n";
        rawEmailMessage += "<html>\r\n<body>\r\n";
        rawEmailMessage += `<h3>${titulo}</h3>\r\n`;
        rawEmailMessage += `<p>${descripcion}</p>\r\n`;
        rawEmailMessage +=  `<p>
                    <a href="${confirmUrl}">Confirmar Asistencia</a>
                    |
                    <a href="${declineUrl}">Declinar Asistencia</a>
                </p>\r\n`;
        rawEmailMessage += "</body>\r\n</html>\r\n";
        rawEmailMessage += "\r\n";
        
        // Archivo iCal adjunto
        rawEmailMessage += `--${boundary}\r\n`;
        rawEmailMessage += "Content-Type: text/calendar; method=REQUEST; name=\"evento.ics\"\r\n";
        rawEmailMessage += "Content-Transfer-Encoding: base64\r\n";
        rawEmailMessage += `Content-Disposition: attachment; filename=\"evento.ics\"\r\n`;
        rawEmailMessage += "\r\n";
        rawEmailMessage += `${encodedICalContent}\r\n`;
        rawEmailMessage += "\r\n";
        rawEmailMessage += `--${boundary}--\r\n`;
    
    
        // Configurar los parámetros para sendRawEmail
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
    
    const start_epoch = convertirFechaAEpoch(start);
    let end_epoch = convertirFechaAEpoch(end);
    
    let item = {
        TableName: "Events",
        Item: {
            "EVENT_ID": event_id, 
            "Descripcion": descripcion,
            "Titulo": titulo,
            //"Start": start,
            "Start": start_epoch,
            "End": end_epoch,
            "Finca": fincaId,
            "Invitados": invitadosMap,
            "Cancelado": "No"
            //"TTL": ttl
        }
    };
    try {
        await dynamodb.put(item).promise();
        console.log("Evento creado con éxito con ID:", event_id);
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
};

function generateICalEvent(start, end, summary, description) {
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//hacksw/handcal//NONSGML v1.0//EN',
        'BEGIN:VEVENT',
        `UID:${new Date().toISOString()}`, // UID único para el evento
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`, // Fecha de creación del evento en UTC
        `DTSTART;TZID=Europe/Madrid:${start}`, // Especifica la zona horaria de inicio
        `DTEND;TZID=Europe/Madrid:${end}`, // Especifica la zona horaria de fin
        `SUMMARY:${summary}`, 
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

function convertirFechaAEpoch(fechaStr) {
    // Parsear la fecha en formato YYYYMMDDTHHMM
    var anio = parseInt(fechaStr.substring(0, 4), 10);
    var mes = parseInt(fechaStr.substring(4, 6), 10) - 1; // Los meses en JavaScript son 0-indexados
    var dia = parseInt(fechaStr.substring(6, 8), 10);
    var hora = parseInt(fechaStr.substring(9, 11), 10);
    var minuto = parseInt(fechaStr.substring(11, 13), 10);

    // Crear un objeto Date
    var fecha = new Date(Date.UTC(anio, mes, dia, hora, minuto));

    // Convertir a epoch (segundos desde el 1 de enero de 1970)
    var epoch = Math.floor(fecha.getTime() / 1000);

    return epoch;
}

