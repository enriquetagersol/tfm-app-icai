const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    
    const requestBody = JSON.parse(event.body);
    const estate_id = requestBody.estate_id;
    
    if (!estate_id) {
        return {
            statusCode: 400,
            headers: {"Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({ message: "El campo 'estate_id' está vacío o no se proporcionó." })
        };
    }
    
    const paramsEvents = {
        TableName: "Encuestas",
        IndexName: "Finca",
        KeyConditionExpression: "Finca = :estate_id",
        ExpressionAttributeValues: {":estate_id": estate_id}
    };
    
    try {
        const result = await dynamoDB.query(paramsEvents).promise();
        const encuestas = result.Items;
        
        //CONTROL-------------
        console.log(encuestas);
        //--------------------
        

        // Obtener la fecha actual en formato epoch
        const currentDateEpoch = Math.floor(Date.now() / 1000);

        // Filtrar encuestas cuya fecha en epoch es posterior a la fecha actual en epoch
        const futureEncuestas = encuestas.filter(encuesta => encuesta.Fecha > currentDateEpoch);
        
        //encuestas.forEach(encuesta => {
        futureEncuestas.forEach(encuesta => {
            let totales = {
                totalEncuestados: 0,
                totalSi: 0,
                totalNo: 0,
                totalNSNC: 0
            };

            if(encuesta.Encuestados) {
                totales.totalEncuestados = Object.keys(encuesta.Encuestados).length;
                Object.values(encuesta.Encuestados).forEach(encuestado => {
                    switch (encuestado.voto) {
                        case "SI":
                            totales.totalSi++;
                            break;
                        case "NSNC":
                            totales.totalNSNC++;
                            break;
                        case "NO":
                            totales.totalNo++;
                            break;
                    }
                });
            }
            encuesta.Totales = totales;
        });


        //const count = encuestas.length; 
        const count = futureEncuestas.length; 

        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                count: count,
                encuestas: futureEncuestas
                //encuestas: encuestas
            })
        };
    } catch (error) {
        console.error("Error al obtener eventos: ", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Error al procesar la solicitud", error: error.message })
        };
    }
};

