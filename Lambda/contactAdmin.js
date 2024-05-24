const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
  let body;
  if (event.body) {
      body = JSON.parse(event.body); 
  } else {
    console.error('No se recibió un cuerpo válido');
    return { statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json"
      },
      body: 'No se recibió un cuerpo válido' 
    };
  }
  const userId = body.user_id;
  const finca_id = body.finca_id;
  const prop_id = body.prop_id;
  const asunto = body.asunto;
  const mensaje = body.mensaje;
  //----------------------
  const admin_id = body.admin_id;
  
  
  const paramsQuery = {
    TableName: "Sugerencias",
    IndexName: "Finca_id", //GSI en DynamoDB
    KeyConditionExpression: "Finca_id = :Finca_id",
    ExpressionAttributeValues: {
      ":Finca_id": finca_id
    }
  };
  const data = await dynamodb.query(paramsQuery).promise();
  var n = data.Count + 1;
  var sugestion_id = n.toString() + '-' + finca_id;
  
  const dateForDynamo = getCurrentFormattedDate();
  
  let item = {
    TableName: "Sugerencias",
    Item: {
      "SUGESTION_ID": sugestion_id, 
      "Mensaje": mensaje,
      "Asunto": asunto,
      "Finca_id": finca_id,
      "Prop_id": prop_id,
      "User_id": userId,
      "Estado": "Pendiente",
      "Fecha": dateForDynamo,
      "Admin_id": admin_id
    }
  };
  try {
    await dynamodb.put(item).promise();
    console.log("Sugerencia almacenada con éxito con ID:", sugestion_id);
    return { statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Credentials": true, 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({message: "Correo enviado y evento guardado"}) };
    }catch (error) {
        console.error("Error al crear sugerencia:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Credentials": true, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Error al crear sugerencia",
                error: error.message
            })
        };
    }
}
const getCurrentFormattedDate = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
  
    return `${year}${month}${day}T${hours}${minutes}`;
};
