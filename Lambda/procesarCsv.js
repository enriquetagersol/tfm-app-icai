const AWS = require('aws-sdk');
const parse = require('csv-parse').parse;
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Bucket y la key del archivo subido a S3
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const filename = key.split('/').pop();
    console.log('Nombre del archivo con extensión:', filename);

    const estateId = filename.replace(/\.csv$/, '');

    console.log('Nombre del archivo sin extensión:',estateId);

    try {
        // Descargamos el archivo CSV del bucket de S3
        const params = {
            Bucket: bucket,
            Key: key,
        };
        const s3Object = await s3.getObject(params).promise();
        
        // Convertimos el contenido del archivo CSV en una cadena de texto
        const csvData = s3Object.Body.toString('utf-8');
        
        // Procesamos el archivo CSV con csv-parse
        const records = await new Promise((resolve, reject) => {
            parse(csvData, {
                columns: true,
                trim: true,
                delimiter: ';'  
            }, (err, output) => {
                if (err) {
                    return reject(err);
                }
                resolve(output);
            });
        });

        //CONTROL
        console.log(records);
 
        const params2 = {
            TableName: "Properties",
            IndexName: "Estate", 
            KeyConditionExpression: "Estate = :estateId",
            ExpressionAttributeValues: {
                ":estateId": estateId
            }
        };
        const data = await dynamoDB.query(params2).promise();
        var n = data.Count; 
        
        
        for (const record of records) {
            n=n+1;
            var property_id = n.toString() + '-' + estateId;
            const putParams = {
                TableName: 'Properties',
                Item: {
                    "PROPERTY_ID": property_id, 
                    "Description": record.Description,
                    "Estate": estateId,
                    "Num": record.Num,
                    "Piso": record.Piso,
                    //"Share": record.Share,
                    "Type": record.Type

                }
            };
            await dynamoDB.put(putParams).promise();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Archivo CSV procesado correctamente', records }),
        };
    } catch (error) {
        console.error('Error al procesar el archivo CSV:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error al procesar el archivo CSV', error: error.toString() }),
        };
    }
};
