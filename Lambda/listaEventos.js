// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listaEventos
// Region --> eu-west-3 (París)

// Esta función recupera los eventos futuros y activos de la tabla "Events" para una finca
// Recupera eventos asociados a una finca
// Filtra por aquellos que no han empezado (start > current date)
// Filtra por aquellos que no han sido cancelados

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
        
        // Obtener la fecha actual en formato epoch
        const currentDateEpoch = Math.floor(Date.now() / 1000);
        // Filtrar eventos
        const futureEvents = events.filter(event => event.Start > currentDateEpoch);
        const activeEvents = futureEvents.filter(event => event.Cancelado == "No");
        
        // Añadir los totales de asistencia a cada evento futuro
        activeEvents.forEach(event => {
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

        const count = activeEvents.length; // Contar los eventos futuros no cancelados

        // Devolver los eventos futuros y su cantidad
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                count: count,
                futureEvents: activeEvents
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
