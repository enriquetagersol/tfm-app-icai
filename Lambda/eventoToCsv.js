// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:eventoToCsv
// Region --> eu-west-3 (Paris)

// Esta función recupera la información de un evento y la transforma a csv
// Busca evento en tabla "Events"
// Busca la información de cada invitado en la tabla "Users"
// Transforma la información del evento a CSV donde cada fila corresponde a un invitado
// Almacena el CSV en S3 en /csv/resultadoEventos de mi bucket
// Devuelve URL del archivo en S3 para su descarga


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

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
        const evt_id = requestBody.evtId;
        const finca_id = requestBody.fincaId;

        // Obtener el registro de DynamoDB
        const getParams = {
            TableName: 'Events',
            Key: {
                'EVENT_ID': evt_id
            }
        };

        const response = await dynamoDB.get(getParams).promise();
        const evtItem = response.Item;

        if (!evtItem) {
            return {
                statusCode: 404,
                headers: headers,
                body: JSON.stringify({ message: 'Evento no encontrado.' })
            };
        }

        // Obtener información de los invitados
        const invitadoIds = Object.keys(evtItem.Invitados);
        const userPromises = invitadoIds.map(invitadoID => getUserData(invitadoID));

        const usersData = await Promise.all(userPromises);

        // Convertir el registro a CSV
        const csvData = convertToCSV(evtItem, usersData);
        
        const bucketName = 'tfm-app-icai';
        const fileName = `evento_${evt_id}.csv`;
        const key = `csv/resultadoEvent/${finca_id}/${fileName}`;

        // Guardar el archivo CSV en S3
        const s3Params = {
            Bucket: bucketName,
            Key: key,
            Body: csvData,
            ContentType: 'text/csv'
        };

        await s3.putObject(s3Params).promise();

        // Generar URL de descarga
        const downloadUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: 'CSV generado correctamente', downloadUrl: downloadUrl })
        };
    } catch (error) {
        console.error('Error al procesar la solicitud: ', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ message: 'Error al procesar la solicitud.' })
        };
    }
};

async function getUserData(userId) {
    const getParams = {
        TableName: 'Users',
        Key: {
            'USER_ID': userId
        }
    };

    try {
        const response = await dynamoDB.get(getParams).promise();
        return response.Item;
    } catch (error) {
        console.error(`Error al obtener datos del usuario ${userId}: `, error);
        return null;
    }
}

function convertEpochToReadableDate(epoch) {
    const date = new Date(epoch * 1000); // Convertir de segundos a milisegundos
    return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
}

function convertToCSV(eventItem, usersData) {
    const headers = [
        'EVENT_ID', 'Descripcion', 'Start', 'End', 'Finca', 'Titulo',
        'InvitadoID', 'Nombre', 'Apellido', 'Email', 'Telefono', 'Asistencia', 'Comentario'
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    const fechaStartReadable = convertEpochToReadableDate(eventItem.Start);
    const fechaEndReadable = convertEpochToReadableDate(eventItem.End);

    usersData.forEach(userData => {
        if (userData) {
            const detalles = eventItem.Invitados[userData.USER_ID];
            const row = [
                eventItem.EVENT_ID,
                eventItem.Descripcion,
                fechaStartReadable,
                fechaEndReadable,
                eventItem.Finca,
                eventItem.Titulo,
                userData.USER_ID,
                userData.first_name || '',
                userData.last_name || '',
                userData.email || '',
                userData.phone || '',
                detalles.asistencia || '',
                detalles.comentario || ''
            ];
            csvRows.push(row.join(','));
        }
    });

    return csvRows.join('\n');
}
