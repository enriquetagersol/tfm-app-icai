// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listarUsuarios
// Region --> eu-west-3 (París)

// Esta función recupera los propietarios o inquilinos de una propiedad

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const user_ids = requestBody.lista; // La lista de USER_ID
    
    if (!user_ids || !Array.isArray(user_ids)) {
        return {
            statusCode: 400,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "El campo 'user_ids' está vacío o no se proporcionó correctamente." })
        };
    }

    try {
        const userInformation = await Promise.all(user_ids.map(async (user_id) => {
            const userParams = {
                TableName: "Users",
                Key: {
                    "USER_ID": user_id
                }
            };
            try {
                const userResult = await dynamoDB.get(userParams).promise();
                return userResult.Item;
            } catch (error) {
                console.error(`Error al obtener información del usuario ${user_id}: `, error);
            }
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userInformation.filter(item => item)) // Filtramos los posibles valores nulos
        };
    } catch (error) {
        console.error("Error al obtener información de los usuarios: ", error);
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
