// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listDocs
// Region --> eu-west-3 (París)

// Esta función lista los documentos asociados a una finca recuperandolos de la carpeta correcta de S3

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const estate_id = requestBody.estate_id;
    const bucketName = 'miprueba8';
    const prefix = 'docs/'+estate_id+'/'; // Si quieres listar archivos en una subcarpeta específica

    const params = {
        Bucket: bucketName,
        Prefix: prefix,
    };

    try {
        const listedObjects = await s3.listObjectsV2(params).promise();
        const files = listedObjects.Contents.map(file => ({
            fileName: file.Key.split('/').pop(),
            LastModified: new Date(file.LastModified).toLocaleString('es-ES', { year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false // Usar formato de 24 horas
            }),
            Size: file.Size,
            Key: file.Key,
            // Agrega aquí otros metadatos que desees incluir
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Para producción especifica el dominio en lugar de usar *
                "Access-Control-Allow-Credentials": true, // Si es necesario para tus credenciales
                "Content-Type": "application/json"
            },
            body: JSON.stringify(files),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // Para producción especifica el dominio en lugar de usar *
                "Access-Control-Allow-Credentials": true, // Si es necesario para tus credenciales
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: "Error al listar archivos" }),
        };
    }
};
