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
        TableName: "Events",
        IndexName: "Finca",
        KeyConditionExpression: "Finca = :estate_id",
        ExpressionAttributeValues: {":estate_id": estate_id}
    };
    
    try {
        const result = await dynamoDB.query(paramsEvents).promise();
        const events = result.Items;

        // Filtrar eventos cuya fecha de inicio es posterior a la fecha actual
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().replace(/[-:.]/g, '').slice(0, 15); // Formato: YYYYMMDDTHHmmss

        const futureEvents = events.filter(event => event.Start > currentDateString);
        
        // Añadir los totales de asistencia a cada evento futuro
        futureEvents.forEach(event => {
            let totales = {
                totalInvitados: 0,
                totalConfirmados: 0,
                totalSinConfirmar: 0,
                totalDeclinados: 0
            };

            if(event.Invitados) {
                totales.totalInvitados = Object.keys(event.Invitados).length;
                Object.values(event.Invitados).forEach(invitado => {
                    switch (invitado.asistencia) {
                        case "Confirmada":
                            totales.totalConfirmados++;
                            break;
                        case "Sin confirmar":
                            totales.totalSinConfirmar++;
                            break;
                        case "Declinada":
                            totales.totalDeclinados++;
                            break;
                    }
                });
            }
            event.Totales = totales;
        });

        const count = futureEvents.length; // Contar los eventos futuros

        // Devolver los eventos futuros y su cantidad
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                count: count,
                futureEvents: futureEvents
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
