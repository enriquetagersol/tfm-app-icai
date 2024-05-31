// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:userToProperty
// Region --> eu-west-3 (París)

// Esta función vincula un usuario a una propiedad como propietario o inquilinio

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json"
    };

    if (!event.body) {
        return {
            statusCode: 400,
            headers: headers,
            body: JSON.stringify({ message: "El event.body es null o undefined" })
        };
    }

    try {
        let requestBody = JSON.parse(event.body);
        const user_id = requestBody.user_id;
        const property_id = requestBody.property_id;
        const rol = requestBody.rol;
        const email = requestBody.email;
        let at='';
        
        //-----------
        if (rol == 'owner')
        {
            at = 'Propietarios';
        }else{
            at = 'Inquilinos';
        }
        //----------
        
        const getParams = {
            TableName: 'Properties',
            Key: {
                'PROPERTY_ID': property_id
            }
        };

        // Obtener datos actuales para ver si el mapa ya existe
        const getResult = await dynamoDB.get(getParams).promise();
        

        let currentUsers = getResult.Item && getResult.Item[at] ? getResult.Item[at] : [];

        // Añadir el user_id a la lista
        currentUsers.push(user_id);

        const params = {
            TableName: 'Properties',
            Key: {
                'PROPERTY_ID': property_id
            },
            UpdateExpression: `set #field = :newList`, 
            ExpressionAttributeNames: {
                '#field': at
            },
            ExpressionAttributeValues: {
                ':newList': currentUsers
            },
            ReturnValues: 'UPDATED_NEW'
        };

        const updateResult = await dynamoDB.update(params).promise();

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: "Datos almacenados correctamente", updateResult: updateResult })
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



