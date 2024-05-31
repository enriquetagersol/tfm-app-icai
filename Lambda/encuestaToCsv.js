// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:encuestaToCsv
// Region --> eu-west-3 (París)

// Esta función convierte los resultados de una encuesta a CSV
// Recupera la información de una encuesta de tabla "Encuestas"
// Recupera la información de los encuestados de tabla "Users"
// Transforma la información en CSV donde cada fila corresponde a un encuestado
// Almacena el CSV en la carpeta /csv/resultadoEncuestas/finca_id/ de mi bucket de S3
// Devuelve la URL del archivo en S3 para descargar


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
        const encuesta_id = requestBody.surveyId;
        const finca_id = requestBody.fincaId;

        // Obtener el registro de DynamoDB
        const getParams = {
            TableName: 'Encuestas',
            Key: {
                'ENCUESTA_ID': encuesta_id
            }
        };

        const response = await dynamoDB.get(getParams).promise();
        const encuestaItem = response.Item;

        if (!encuestaItem) {
            return {
                statusCode: 404,
                headers: headers,
                body: JSON.stringify({ message: 'Encuesta no encontrada.' })
            };
        }

        // Obtener información de los encuestados
        const encuestadoIds = Object.keys(encuestaItem.Encuestados);
        const userPromises = encuestadoIds.map(encuestadoID => getUserData(encuestadoID));

        const usersData = await Promise.all(userPromises);

        // Convertir el registro a CSV
        const csvData = convertToCSV(encuestaItem, usersData);
        
        const bucketName = 'tfm-app-icai';
        const fileName = `encuesta_${encuesta_id}.csv`;
        const key = `csv/resultadoEncuestas/${finca_id}/${fileName}`;

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

function convertToCSV(encuestaItem, usersData) {
    const headers = [
        'ENCUESTA_ID', 'Descripcion', 'FechaCreacion', 'FechaTTL', 'Finca', 'Motivo',
        'EncuestadoID', 'Nombre', 'Apellido', 'Email', 'Telefono', 'Comentario', 'Voto'
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    const fechaCreacionReadable = convertEpochToReadableDate(encuestaItem.FechaCreacion);
    const fechaTTLReadable = convertEpochToReadableDate(encuestaItem.FechaTTL);

    usersData.forEach(userData => {
        if (userData) {
            const detalles = encuestaItem.Encuestados[userData.USER_ID];
            const row = [
                encuestaItem.ENCUESTA_ID,
                encuestaItem.Descripcion,
                fechaCreacionReadable,
                fechaTTLReadable,
                encuestaItem.Finca,
                encuestaItem.Motivo,
                userData.USER_ID,
                userData.first_name || '',
                userData.last_name || '',
                userData.email || '',
                userData.phone || '',
                detalles.comentario || '',
                detalles.voto || ''
            ];
            csvRows.push(row.join(','));
        }
    });

    return csvRows.join('\n');
}
