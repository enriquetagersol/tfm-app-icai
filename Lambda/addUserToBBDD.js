// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:addUserToBBDD
// Region --> eu-west-3 (París)

// Almacena en la tabla "Users" el nuevo usuario creado en Cognito

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    console.log("Evento recibido:", event);
    try {
        
        let cognitoUser = {};
        const properties = ['email', 'sub', 'name', 'family_name', 'phone_number', 'username', 'isAdmin', 'empresa'];

        properties.forEach(prop => {
            if (event.hasOwnProperty(prop)) {
                cognitoUser[prop] = event[prop];
            } else {
                console.log(`Propiedad ${prop} no encontrada en el evento.`);
            }
        });
        let item;
        
        if(!cognitoUser.empresa)
        {

            item = {
                TableName: "Users",
                Item: {
                    "USER_ID": cognitoUser.sub, 
                    "email": cognitoUser.email,
                    "first_name": cognitoUser.name,
                    "last_name": cognitoUser.family_name,
                    "IS_ADMIN": cognitoUser.isAdmin,
                    "phone": cognitoUser.phone_number,
                    "username": cognitoUser.username
     
                }
            }
        }else{
            item = {
                TableName: "Users",
                Item: {
                    "USER_ID": cognitoUser.sub, 
                    "email": cognitoUser.email,
                    "first_name": cognitoUser.name,
                    "last_name": cognitoUser.family_name,
                    "IS_ADMIN": cognitoUser.isAdmin,
                    "phone": cognitoUser.phone_number,
                    "username": cognitoUser.username,
                    "empresa": cognitoUser.empresa
     
                }
            }
            
        }
        //};

        await dynamoDB.put(item).promise();

        return {
            statusCode: 200,
            body: JSON.stringify('Usuario agregado a la base de datos')
        };
    } catch (error) {
        console.error("Error:", error);
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify('Error al procesar la solicitud')
        };
    }
};
