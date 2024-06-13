// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:borrarUsuario
// Region --> eu-west-3 (París)

// Esta función desvincula a un usuario de una propiedad

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const propertyId = requestBody.property_id;
    const userId = requestBody.user_id;
    const tipo = requestBody.tipo;

    if (!propertyId || !userId || !tipo) {
        return {
            statusCode: 400,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "Faltan parámetros en la solicitud." })
        };
    }

    let attributeName = tipo === "Propietarios" ? "Propietarios" : "Inquilinos";

    // Obtener la lista actual
    const getParams = {
        TableName: "Properties",
        Key: {
            PROPERTY_ID: propertyId
        }
    };

    try {
        const propertyData = await dynamoDB.get(getParams).promise();
        let list = propertyData.Item[attributeName];

        // Eliminar el userId de la lista
        list = list.filter(id => id !== userId);

        // Actualizar la lista en la tabla Properties
        const updateParams = {
            TableName: "Properties",
            Key: {
                PROPERTY_ID: propertyId
            },
            UpdateExpression: `SET ${attributeName} = :updatedList`,
            ExpressionAttributeValues: {
                ":updatedList": list
            }
        };

        await dynamoDB.update(updateParams).promise();

        return {
            statusCode: 200,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "Usuario eliminado correctamente." })
        };

    } catch (error) {
        console.error("Error al actualizar la propiedad: ", error);
        return {
            statusCode: 500,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "Error al actualizar la propiedad", error: error.message })
        };
    }
};
