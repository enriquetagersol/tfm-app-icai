// ARN: arn:aws:lambda:eu-west-3:699928454448:function:urlPrefirmada
//Region: eu-west-3 (Paris)

//Solicita URL prefirmada para descarga segura desde S3

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const requestBody = JSON.parse(event.body);
    const filePath = requestBody.key;
    
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json"
    };
    
    const params = {
        Bucket: 'tfm-app-icai', 
        Key: filePath,
        Expires: 60 // Tiempo de expiración de la URL en segundos
    };
    
    try {
        const url = s3.getSignedUrl('getObject', params);
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ url: url })
        };
    } catch (error) {
        console.error('Error al generar la URL pre-firmada:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ message: 'Error al generar la URL pre-firmada.' })
        };
    }
};
