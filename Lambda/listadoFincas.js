// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listadoFincas
// Region --> eu-west-3 (París)

// Esta función recupera registros de la tabla "Estates" filtrando por id del administrador
// Recupera las fincas gestionadas por un administrador

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {

    const requestBody = JSON.parse(event.body);
    const adminUserId = requestBody.admin_user_id;

    const params = {
        TableName: "Estates",
        IndexName: "admin_user_id", //GSI en DynamoDB
        KeyConditionExpression: "admin_user_id = :adminUserId",
        ExpressionAttributeValues: {
            ":adminUserId": adminUserId
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data.Items)
        };
    } catch (error) {
        console.error("Error al consultar DynamoDB: ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
    }
};

