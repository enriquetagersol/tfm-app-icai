const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'eu-west-3' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    //Obtener ID evento
    const data = JSON.parse(event.body);
    const eventId = data.id;

    //Parámetro para consulta
    const getParams = {
        TableName: 'Events',
        Key: {
            'EVENT_ID': eventId
        }
    };

    try {
        //Consulta
        const response = await dynamoDB.get(getParams).promise();
        const eventItem = response.Item;

        if (!eventItem) {
            return { statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: 'Evento no encontrado.' };
        }
        
        //const emails = Object.values(eventItem.Invitados).map(invitado => invitado.email);
        const ids_users = Object.keys(eventItem.Invitados);
        let emails = await getEmailsForUserIds(ids_users);
        // Eliminar correos electrónicos duplicados
        emails = [...new Set(emails)];
        
        //CONTROL---
        console.log(emails);
        //------

        //Enviar email de cancelación
        const sendPromises = emails.map(email => sendCancellationEmail(email, eventItem.Titulo));

        await Promise.all(sendPromises);

        //Actualizar el estado del flag de eventos cancelados
        /*const deleteParams = {
            TableName: 'Events',
            Key: {
                'EVENT_ID': eventId
            }
        };
        await dynamoDB.delete(deleteParams).promise();*/
        const updateParams = {
            TableName: 'Events',
            Key: {
                'EVENT_ID': eventId
            },
            UpdateExpression: 'set Cancelado = :cancelStatus',
            ExpressionAttributeValues: {
                ':cancelStatus': 'Si'
            },
            ReturnValues: 'UPDATED_NEW'
        };
        await dynamoDB.update(updateParams).promise();

        return { statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: 'Evento cancelado con éxito.' })
        }
            
    } catch (error) {
        console.error('Error: ', error);
        return { statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: 'Error al procesar la solicitud.' })}
        //body: 'Error al procesar la solicitud.' };
    }
};

function sendCancellationEmail(email, eventName) {
    
    const params = {
        Source: 'gestionfincas.tfm@gmail.com',
        Destination: { ToAddresses: [email] },
        Message: {
            Subject: { Data: `Cancelación del evento: ${eventName}` },
            Body: {
                Text: { Data: `Lamentamos informarle que el evento '${eventName}' ha sido cancelado.` }
            }
        }
    };

    return ses.sendEmail(params).promise();
}

// Función para obtener correos electrónicos de la tabla de usuarios
async function getEmailsForUserIds(userIds) {
    const userTable = 'Users'; // Nombre de la tabla de usuarios
    const emailPromises = userIds.map(async userId => {
        const params = {
            TableName: userTable,
            Key: {
                'USER_ID': userId
            }
        };

        const response = await dynamoDB.get(params).promise();
        return response.Item ? response.Item.email : null;
    });

    const emails = await Promise.all(emailPromises);
    return emails.filter(email => email !== null); // Filtrar valores nulos
}
