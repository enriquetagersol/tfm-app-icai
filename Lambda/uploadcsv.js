const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        
        const fileName = event.headers['x-file-name'];
        console.log(event.headers);
        console.log(fileName);
        const csvContent = event.body;

        
        const params = {
            Bucket: 'tfm-app-icai',
            Key: 'csv/' + fileName + '.csv', 
            Body: csvContent,
            ContentType: 'text/csv; charset=utf-8'
        };

        
        await s3.putObject(params).promise();

        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify({ message: 'Archivo CSV subido correctamente a S3' }),
        };
    } catch (error) {
        console.error('Error al subir el archivo a S3:', error);

        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify({ message: 'Error al subir el archivo a S3', error: error.toString() }),
        };
    }
};



