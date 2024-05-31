//ARN --> arn:aws:lambda:eu-west-3:699928454448:function:borrarMsg
//Region --> eu-west-3 (París)

//Esta función se emplea para eliminar los mensajes del usuario al administrador
//Modifica el atributo 'Estado' de la tabla de DynamoDB

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const suggestionId = data.id;

    if (!suggestionId) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE" // Métodos permitidos
            },
            body: JSON.stringify({ message: "El campo 'id' está vacío o no se proporcionó." })
        };
    }

    const params = {
        TableName: "Sugerencias",
        Key: {
            "SUGESTION_ID": suggestionId
        },
        UpdateExpression: "set Estado = :estado",
        ExpressionAttributeValues: {
            ":estado": "Eliminado"
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        await dynamoDB.update(params).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE" // Métodos permitidos
            },
            body: JSON.stringify({ message: "El estado se actualizó correctamente a 'Eliminado'." })
        };
    } catch (error) {
        console.error("Error al actualizar el estado: ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE" // Métodos permitidos
            },
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
    }
};


