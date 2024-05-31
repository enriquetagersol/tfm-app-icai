// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:marcarLeido
// Region --> eu-west-3 (Paris)

// Esta función actualiza el atributo "Estado" de un registro de la tabla "Sugerencias" de DynamoDB

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
            ":estado": "Leído"
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
            body: JSON.stringify({ message: "El estado se actualizó correctamente a 'Leído'." })
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
