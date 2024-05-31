// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listadoPropiedades
// Region --> eu-west-3 (París)

// Esta función recupera las propiedades pertenecientes a una finca de la tabla "Properties" de DynamoDB

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const estate_id = requestBody.estate_id;
    
    if (!estate_id) {
        return {
            statusCode: 400,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "El campo 'estate_id' está vacío o no se proporcionó." })
        };
    }

    const paramsProperties = {
        TableName: "Properties",
        IndexName: "Estate",
        KeyConditionExpression: "Estate = :estate_id",
        ExpressionAttributeValues: {":estate_id": estate_id}
    };

    try {
        const propertiesData = await dynamoDB.query(paramsProperties).promise();
        const properties = propertiesData.Items;
       
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Para producción especifica el dominio en lugar de usar *
                    "Access-Control-Allow-Credentials": true, // Si es necesario para tus credenciales
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(properties)
            };
    } catch (error) {
        console.error("Error al consultar DynamoDB: ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Para producción especifica el dominio en lugar de usar *
                "Access-Control-Allow-Credentials": true, // Si es necesario para tus credenciales
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
    }
};

