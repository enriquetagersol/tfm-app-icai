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

        const emails = Object.values(eventItem.Invitados).map(invitado => invitado.email);

        //Enviar email de cancelación
        const sendPromises = emails.map(email => sendCancellationEmail(email, eventItem.Titulo));

        await Promise.all(sendPromises);

        //Borrar el evento de la tabla de DynamoDB
        const deleteParams = {
            TableName: 'Events',
            Key: {
                'EVENT_ID': eventId
            }
        };
        await dynamoDB.delete(deleteParams).promise();

        return { statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: 'Evento cancelado y borrado con éxito.' })}
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
