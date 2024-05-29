const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Establece los encabezados de CORS para la respuesta
    const headers = {
        "Access-Control-Allow-Origin": "*", // Cambia esto por el dominio específico en producción
        "Access-Control-Allow-Credentials": true, // Si estás manejando sesiones con cookies
        "Content-Type": "application/json"
    };

    if (!event.body) {
        console.log("El event.body es null o undefined");
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: "El event.body es null o undefined" })
        };
    }

    try {
        let requestBody = JSON.parse(event.body);
        const estateId = requestBody.estate;
        
        const params = {
            TableName: "Properties",
            IndexName: "Estate", // Asegúrate de que este sea el nombre correcto del GSI en DynamoDB
            KeyConditionExpression: "Estate = :estateId",
            ExpressionAttributeValues: {
                ":estateId": estateId
            }
        };
        const data = await dynamoDB.query(params).promise();
        var n = data.Count + 1;
        var property_id = n.toString() + '-' + estateId;

        let item = {
            TableName: "Properties",
            Item: {
                "PROPERTY_ID": property_id, // Asegúrate de que este ID sea único para cada entrada
                "Description": requestBody.descripcion,
                "Estate": requestBody.estate,
                "Num": requestBody.num,
                "Piso": requestBody.piso,
                "Share": requestBody.share,
                "Type": requestBody.tipo,
                "IBAN": requestBody
            }
        };

        await dynamoDB.put(item).promise();

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: "Datos almacenados correctamente" })
        };
    } catch (error) {
        console.error("Error en la función Lambda:", error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
    }
};
