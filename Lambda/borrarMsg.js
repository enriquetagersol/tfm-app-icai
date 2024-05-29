const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: 'eu-west-3' });

exports.handler = async (event) => {
    let body;
    if (event.body) {
        body = JSON.parse(event.body); 
    } else {
        console.error('No se recibió un cuerpo válido');
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: 'No se recibió un cuerpo válido'
        };
    }

    const userId = body.user_id;
    const finca_id = body.finca_id;
    const prop_id = body.prop_id;
    const asunto = body.asunto;
    const mensaje = body.mensaje;
    const admin_id = body.admin_id;

    // Buscar el email del administrador en la tabla users
    const getUserParams = {
        TableName: 'Users',
        Key: {
            'USER_ID': admin_id
        }
    };

    try {
        const userResponse = await dynamodb.get(getUserParams).promise();
        const adminUser = userResponse.Item;

        if (!adminUser) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: 'Administrador no encontrado.' })
            };
        }

        const adminEmail = adminUser.email;

        // Realizar la consulta para contar sugerencias existentes
        const paramsQuery = {
            TableName: "Sugerencias",
            IndexName: "Finca_id", // GSI en DynamoDB
            KeyConditionExpression: "Finca_id = :Finca_id",
            ExpressionAttributeValues: {
                ":Finca_id": finca_id
            }
        };

        const data = await dynamodb.query(paramsQuery).promise();
        var n = data.Count + 1;
        var sugestion_id = n.toString() + '-' + finca_id;
        const dateForDynamo = getCurrentFormattedDate();

        // Crear el nuevo ítem en la tabla Sugerencias
        let item = {
            TableName: "Sugerencias",
            Item: {
                "SUGESTION_ID": sugestion_id, 
                "Mensaje": mensaje,
                "Asunto": asunto,
                "Finca_id": finca_id,
                "Prop_id": prop_id,
                "User_id": userId,
                "Estado": "Pendiente",
                "Fecha": dateForDynamo,
                "Admin_id": admin_id
            }
        };

        await dynamodb.put(item).promise();
        console.log("Sugerencia almacenada con éxito con ID:", sugestion_id);
        // Enviar email al administrador
        await sendAdminEmail(adminEmail, asunto, mensaje);
        

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Sugerencia almacenada con éxito"})
        };

    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Error al procesar la solicitud",
                error: error.message
            })
        };
    }
};

const getCurrentFormattedDate = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}`;
};

const sendAdminEmail = async (email, subject, message) => {
    const params = {
        Source: 'gestionfincas.tfm@gmail.com',
        Destination: { ToAddresses: [email] },
        Message: {
            Subject: { Data: `Notificación de mensaje` },
            Body: {
                Text: { Data: `Ha recibido un nuevo mensaje.\n\nAsunto: ${subject}\nMensaje: ${message} \n\nPuede ver el detalle accediendo a la plataforma` }
            }
        }
    };

    try {
        await ses.sendEmail(params).promise();
        console.log(`Correo enviado a ${email}`);
    } catch (error) {
        console.error(`Error al enviar el correo a ${email}:`, error);
        throw new Error(`Error al enviar el correo a ${email}`);
    }
};


