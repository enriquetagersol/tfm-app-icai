// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:uploadFile
// Region --> eu-west-3 (París)

// Esta función recibe un archivo y lo almacena en mi bucket de S3 en /docs/fileName (fileName es el id de la finca en cada caso)

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        // Parsea el cuerpo de la solicitud JSON entrante
        const now = new Date();
         // Formatear la fecha y hora en una cadena
        
        const dateStr = now.toISOString().replace(/[:.-]/g, '');
        
        const body = JSON.parse(event.body);
        const base64String = body.base64String;
        const fileName = body.fileName;
        const typeDoc = body.typeDoc;
       
        const bucketName = 'tfm-app-icai';
        const key = 'docs/'+fileName+'/'+typeDoc+'_'+dateStr+'.pdf';
        console.log(key);

       
        const decodedFile = Buffer.from(base64String, 'base64');

        
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: decodedFile,
            ContentType: 'application/pdf',
           
        };

        // Sube el archivo a S3
        await s3.upload(params).promise();

        // Respuesta exitosa
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: 'PDF subido correctamente' }),
        };
    } catch (error) {
        console.log(error);
        // Respuesta en caso de error
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: 'Error al subir el PDF' }),
        };
    }
};
