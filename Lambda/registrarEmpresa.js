// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:registrarEmpresa
// Region --> eu-west-3 (Paris)

// Esta función crea un nuevo registro en la tabla "Admins" de DynamoDB

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
        const empresa_id = requestBody.empresa_id;
        const telf = requestBody.telf;
        const email = requestBody.email;
        const nombre_empresa = requestBody.nombre;

        let item = {
            TableName: "Admins",
            Item: {
                "ADMIN_ID": empresa_id, 
                "nombre": nombre_empresa,
                "email": email,
                "telf": telf
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
