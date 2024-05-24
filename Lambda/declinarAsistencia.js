const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Extraer token y eventoId de la URL
    const token = event.queryStringParameters.token;
    const eventoId = event.queryStringParameters.eventoId;

    //Parámetro para la consulta de DynamoDB
    const getParams = {
        TableName: 'Events',
        Key: {
            'EVENT_ID': eventoId
        }
    };

    try {
        // Obtener el evento de DynamoDB
        const response = await dynamoDB.get(getParams).promise();
        const eventItem = response.Item;

        // Comprobar si el token está en el mapa de invitados
        if (eventItem && eventItem.Invitados && eventItem.Invitados[token]) {
            // Actualizar el estado de asistencia en el mapa de invitados
            const updateParams = {
                TableName: 'Events',
                Key: {
                    'EVENT_ID': eventoId
                },
                UpdateExpression: 'SET Invitados.#token.asistencia = :asistencia',
                ExpressionAttributeNames: {
                    '#token': token
                },
                ExpressionAttributeValues: {
                    ':asistencia': 'Declinada'
                },
                ReturnValues: 'UPDATED_NEW'
            };
            
            // Realizar la actualización en DynamoDB
            await dynamoDB.update(updateParams).promise();
            
            // Redireccionar 
            return {
                statusCode: 302,
                headers: {
                    Location: 'https://miprueba8.s3.eu-west-3.amazonaws.com/asistenciaDeclinada.html',
                    
                }
            };
        } else {
            // Manejar el caso de token no encontrado o evento no existente
            return {
                statusCode: 404,
                headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
              },
                body: JSON.stringify({ message: 'Invitado o evento no encontrado.' })
            };
        }
    } catch (error) {
        console.error('Error al actualizar DynamoDB: ', error);
        // Respuesta de error
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: 'Error al procesar la solicitud.' })
        };
    }
};
