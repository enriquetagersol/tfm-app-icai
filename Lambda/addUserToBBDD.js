// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:addUserToBBDD
// Region --> eu-west-3 (París)

// Almacena en la tabla "Users" el nuevo usuario creado en Cognito

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    console.log("Evento recibido:", event);
    const data = JSON.parse(event.body);
    console.log(data);
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
        
        if(!data.empresa)
        {

            item = {
                TableName: "Users",
                Item: {
                    "USER_ID": data.sub, 
                    "email": data.email,
                    "first_name": data.name,
                    "last_name": data.family_name,
                    "IS_ADMIN": data.isAdmin,
                    "phone": data.phone_number,
                    "username": data.username
     
                }
            }
        }else{
            item = {
                TableName: "Users",
                Item: {
                    "USER_ID": data.sub, 
                    "email": data.email,
                    "first_name": data.name,
                    "last_name": data.family_name,
                    "IS_ADMIN": data.isAdmin,
                    "phone": data.phone_number,
                    "username": data.username,
                    "empresa": data.empresa
     
                }
            }
            
        }


        await dynamoDB.put(item).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE" // Métodos permitidos
            },
            body: JSON.stringify('Usuario agregado a la base de datos')
        };
    } catch (error) {
        console.error("Error:", error);
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE" // Métodos permitidos
            },
            body: JSON.stringify('Error al procesar la solicitud')
        };
    }
};

