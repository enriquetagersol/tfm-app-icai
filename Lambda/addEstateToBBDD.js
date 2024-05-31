// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:addEstateToBBDD
// Region --> eu-west-3 (París)

// Esta función crea un nuevo registro en la tabla "Estates" de DynamoDB

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
        const adminUserId = requestBody.admin_user_id;
        //------------------------------------------------------------------
        //Buscar administrador en la tabla de usuarios para ver a que empresa pertenece
        const paramsAdmin = {
            TableName: 'Users',
            Key: {
                USER_ID: adminUserId
            }
        }
        
        const dataAdmin = await dynamoDB.get(paramsAdmin).promise();
        const empresa_id = dataAdmin.Item.empresa;
        
        
        //-----------------------------------------------------------
        
        const params = {
            TableName: "Estates",
            IndexName: "admin_user_id", // Asegúrate de que este sea el nombre correcto del GSI en DynamoDB
            KeyConditionExpression: "admin_user_id = :adminUserId",
            ExpressionAttributeValues: {
                ":adminUserId": adminUserId
            }
        };
        const data = await dynamoDB.query(params).promise();
        var n = data.Count + 1;
        //var estate_id = n.toString() + '-' + adminUserId;
        
        //----------
        var estate_id = n.toString() + '-' + empresa_id;
        //---------

        let item = {
            TableName: "Estates",
            Item: {
                "ESTATE_ID": estate_id, // Asegúrate de que este ID sea único para cada entrada
                "address": requestBody.address,
                "city": requestBody.city,
                "region": requestBody.region,
                "admin_user_id": requestBody.admin_user_id,
                "name": requestBody.name,
                "zip": requestBody.zip
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

