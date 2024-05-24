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
    
    
    const paramsMsg = {
        TableName: "Sugerencias",
        IndexName: "Finca_id",
        KeyConditionExpression: "Finca_id = :estate_id",
        ExpressionAttributeValues: {":estate_id": estate_id}
    };
    
    try {
        const result = await dynamoDB.query(paramsMsg).promise();
        let msgs = result.Items;

        // Ordenar los mensajes por estado y fecha
        msgs.sort((a, b) => {
            if (a.Estado === "Pendiente" && b.Estado !== "Pendiente") {
                return -1;
            } else if (a.Estado !== "Pendiente" && b.Estado === "Pendiente") {
                return 1;
            } else {
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
                messages: userInformation 
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

