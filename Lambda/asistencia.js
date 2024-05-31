// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:asistencia
// Region --> eu-west-3 (París)

// Esta función actualiza el estado de asistencia de los invitados al evento

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
      const evento_id = requestBody.eventoId;
      const asistencia = requestBody.response;
      const comentario = requestBody.comentarios;

      
      //Definir el parámetro para la consulta de DynamoDB
      const getParams = {
        TableName: 'Events',
        Key: {
            'EVENT_ID': evento_id
        }
      };
      //Obtener encuesta de DynamoDB
      const response = await dynamoDB.get(getParams).promise();
      const evtItem = response.Item;
      
      //Comprobar si el token está en el mapa de invitados
      if (evtItem && evtItem.Invitados && evtItem.Invitados[token]) {
        //Actualizar el estado de asistencia en el mapa de invitados
        const updateParams = {
          TableName: 'Events',
          Key: {
            'EVENT_ID': evento_id
          },
          UpdateExpression: 'SET Invitados.#token.asistencia = :asistencia, Invitados.#token.comentario = :comentario',
          ExpressionAttributeNames: {
          '#token': token
          },
          ExpressionAttributeValues: {
            ':asistencia': asistencia,
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
