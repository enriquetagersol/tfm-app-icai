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
        "Access-Control-Allow-Origin": "*", 
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
