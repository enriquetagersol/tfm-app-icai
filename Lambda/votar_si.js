const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    const token = event.queryStringParameters.token;
    const encuesta_id = event.queryStringParameters.encuestaId;

    //Parámetro para la consulta de DynamoDB
    const getParams = {
        TableName: 'Encuestas',
        Key: {
            'ENCUESTA_ID': encuesta_id
        }
    };

    try {
        // Obtener el evento de DynamoDB
        const response = await dynamoDB.get(getParams).promise();
        const encuestaItem = response.Item;

        // Comprobar si el token está en el mapa de invitados
        if (encuestaItem && encuestaItem.Encuestados && encuestaItem.Encuestados[token]) {
            // Actualizar el estado de asistencia en el mapa de invitados
            const updateParams = {
                TableName: 'Encuestas',
                Key: {
                    'ENCUESTA_ID': encuesta_id
                },
                UpdateExpression: 'SET Encuestados.#token.voto = :voto',
                ExpressionAttributeNames: {
                    '#token': token
                },
                ExpressionAttributeValues: {
                    ':voto': 'SI'
                },
                ReturnValues: 'UPDATED_NEW'
            };
            
            //Actualización en DynamoDB
            await dynamoDB.update(updateParams).promise();
            
            //Redireccionar 
            return {
                statusCode: 302,
                headers: {
                    Location: 'https://tfm-app-icai.s3.eu-west-3.amazonaws.com/voto_si.html',
                    
                }
            };
        } else {
            //Manejar el caso de token no encontrado o evento no existente
            return {
                statusCode: 404,
                headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
              },
                body: JSON.stringify({ message: 'Persona o encuesta no encontrado.' })
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
