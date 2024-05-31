// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listaMsgAdmin
// Region --> eu-west-3 (París)

// Esta función recupera los mensajes dirigidos a un administrador de la tabla "Sugerencias" en DynamoDB


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const admin_user_id = requestBody.admin_user_id;
    
    if (!admin_user_id) {
        return {
            statusCode: 400,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "El campo 'admin_user_id' está vacío o no se proporcionó." })
        };
    }
    
    
    const paramsMsg = {
        TableName: "Sugerencias",
        IndexName: "Admin_id",
        KeyConditionExpression: "Admin_id = :admin_user_id",
        ExpressionAttributeValues: {":admin_user_id": admin_user_id}
    };
    
    try {
        const result = await dynamoDB.query(paramsMsg).promise();
        let msgs = result.Items;
        msgs = msgs.filter(msg => msg.Estado != "Eliminado");

        // Ordenar los mensajes por estado y fecha
        msgs.sort((a, b) => {
            if (a.Estado === "Pendiente" && b.Estado !== "Pendiente") {
                return -1;
            } else if (a.Estado !== "Pendiente" && b.Estado === "Pendiente") {
                return 1;
            } else {
                // Ambos mensajes tienen el mismo estado, ordenar por fecha
                return b.Fecha.localeCompare(a.Fecha);
            }
        });

        const count = msgs.filter(msg => msg.Estado === "Pendiente").length;

        // Realizar la consulta para cada usuario
        const userInformation = await Promise.all(msgs.map(async (msg) => {
            const userParams = {
                TableName: "Users",
                Key: {
                    "USER_ID": msg.User_id 
                }
            };
            try {
                const userResult = await dynamoDB.get(userParams).promise();
                
                msg.userInfo = userResult.Item;
                return msg;
            } catch (error) {
                console.error(`Error al obtener información del usuario ${msg.user_id}: `, error);
            }
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                count: count,
                messages: userInformation // Ya están ordenados correctamente
            })
        };
    } catch (error) {
        console.error("Error al obtener mensajes: ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
    }
};

