const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const userId = requestBody.user_id;

    try {
       
        
        const propertiesParams = {
            TableName: 'Properties'
        };
        
        const propertiesResult = await dynamoDB.scan(propertiesParams).promise();
        console.log(propertiesResult);
        const properties = propertiesResult.Items.filter(property => {
            // Verificar si Propietarios o Inquilinos están definidos, no son nulos y no están vacíos
            if (
                (property.Propietarios && Array.isArray(property.Propietarios) && property.Propietarios.length > 0) ||
                (property.Inquilinos && Array.isArray(property.Inquilinos) && property.Inquilinos.length > 0)
            ) {
                // Verificar si el userId está presente en Propietarios o Inquilinos
                return (
                    (property.Propietarios && property.Propietarios.includes(userId)) ||
                    (property.Inquilinos && property.Inquilinos.includes(userId))
                );
            } else {
                
                return false;
            }
        });
        

        console.log(properties);

        const propertiesWithAdminEmails = await Promise.all(properties.map(async (property) => {
            if (property.Estate) {
                const estateParams = {
                    TableName: "Estates",
                    Key: {
                        "ESTATE_ID": property.Estate 
                    }
                };

                const estateResult = await dynamoDB.get(estateParams).promise();
                property.EstateDetails = estateResult.Item;

                // Consulta el email del administrador si existe en el estate
                if (estateResult.Item && estateResult.Item.admin_user_id) {
                    const userParams = {
                        TableName: "Users",
                        Key: {
                            "USER_ID": estateResult.Item.admin_user_id
                        }
                    };
                    
                    
                    const userResult = await dynamoDB.get(userParams).promise();
                    // Añade el email y nombre del admin a los detalles de la propiedad
                    if (userResult.Item) {
                        property.EstateDetails.adminEmail = userResult.Item.email;
                        property.EstateDetails.adminFirstName = userResult.Item.first_name;
                        property.EstateDetails.adminLastName = userResult.Item.last_name;
                        //AÑADIDO
                        property.EstateDetails.adminID = userResult.Item.USER_ID;
                    } else {
                        property.EstateDetails.adminEmail = 'Email no disponible';
                        property.EstateDetails.adminFirstName = 'No disponible';
                        property.EstateDetails.adminLastName = '';

                        property.EstateDetails.adminID = '';
                    }
                }
            }
            
            return property;
        }));
    console.log(propertiesWithAdminEmails);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(propertiesWithAdminEmails)
        };
    } catch (error) {
        console.error("Error al procesar la solicitud: ", error);
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
