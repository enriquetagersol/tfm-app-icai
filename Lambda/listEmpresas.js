// ARN --> arn:aws:lambda:eu-west-3:699928454448:function:listEmpresas
// Region --> eu-west-3 (París)

//Esta función recupera los elementos de la tabla "Admins" de DynamoDB


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: 'Admins'
  };
  
  try{
    const data = await dynamoDB.scan(params).promise();
    return{
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", /
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data.Items)
    };
  } catch(error){
    return{
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Credentials": true, 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({message: 'Error', error: error.message}),
    };
  }
};
