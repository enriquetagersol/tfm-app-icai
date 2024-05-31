// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:votar
// Region --> eu-west-3 (París)

//Esta función actualiza el voto de los encuestados



const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json"
    };

    if (!event.body) {
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: "El event.body es null o undefined" })
        };
    }

    try {
      let requestBody = JSON.parse(event.body);
      const token = requestBody.userId;
      const encuesta_id = requestBody.surveyId;
      const voto = requestBody.response;
      const comentario = requestBody.comentarios;

      
      //Definir el parámetro para la consulta de DynamoDB
      const getParams = {
        TableName: 'Encuestas',
        Key: {
            'ENCUESTA_ID': encuesta_id
        }
      };
      //Obtener encuesta de DynamoDB
      const response = await dynamoDB.get(getParams).promise();
      const encuestaItem = response.Item;
      
      //Comprobar si el token está en el mapa de invitados
      if (encuestaItem && encuestaItem.Encuestados && encuestaItem.Encuestados[token]) {
        //Actualizar el estado de asistencia en el mapa de invitados
        const updateParams = {
          TableName: 'Encuestas',
          Key: {
            'ENCUESTA_ID': encuesta_id
          },
          UpdateExpression: 'SET Encuestados.#token.voto = :voto, Encuestados.#token.comentario = :comentario',
          ExpressionAttributeNames: {
          '#token': token
          },
          ExpressionAttributeValues: {
            ':voto': voto,
            ':comentario': comentario
          },
          ReturnValues: 'UPDATED_NEW'
        };
            
        //Actualización en DynamoDB
        await dynamoDB.update(updateParams).promise();
    
        //Redireccionar a una página de confirmación 
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Credentials": true,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: 'OK.' })
        };
      } else {
        //Token no encontrado o evento no existente
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
        //Error
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
