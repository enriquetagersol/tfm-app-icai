var userPoolId = 'eu-west-3_LtzWUdHcG';
var clientId= 'mreo7c1jviop9b2i7qdqnr77u';
var region = 'eu-west-3';
var identityPoolId = 'eu-west-3:ea23633a-d0ae-4261-b208-53e7ad0600f1';

var poolData = {
	UserPoolId: userPoolId,
	ClientId: clientId
};

var sub_user;

function restoreCognitoSession_Users(callback) {
   	var pool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = pool.getCurrentUser();

    if (cognitoUser) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                console.error("Error obteniendo la sesión: ", err);
                return;
            } 

            if (session.isValid()) {
                console.log("Sesión de Cognito restaurada con éxito");

                cognitoUser.getUserAttributes(function(err, attributes) {
                    if (err) {
                        console.error("Error obteniendo atributos del usuario: ", err);
                        return;
                    }

                    sub_user = attributes.find(attribute => attribute.getName() === 'sub');
                    if (sub_user) {
                        console.log("Sub del usuario:", sub_user.getValue());
                        callback();
                        // Aquí puedes usar el valor de 'sub' según necesites
                    } else {
                        console.log("Atributo 'sub' no encontrado");
                    }
                });
            } else {
                console.log("La sesión de Cognito no es válida");
            }
        });
    } else {
        console.log("No se encontró el usuario actual");
    }
}

function contactAdmin(){
    var user_id = sessionStorage.getItem('usuarioActual');
    var prop_id = sessionStorage.getItem('propiedadActual');
    var finca_id = sessionStorage.getItem('fincaActual');

    var admin_id = sessionStorage.getItem('adminActual');
    var asunto = document.getElementById("titulo_contact_id").value;
    var mensaje = document.getElementById("descripcion_contact_id").value;

    var dataToSend = {
        "asunto": asunto,
        "mensaje": mensaje,
        "user_id": user_id,
        "prop_id": prop_id,
        "finca_id": finca_id,
        "admin_id": admin_id
    }

    var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/contactAdmin';

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function(response){
            //Manejo de alerta
            document.getElementById("contact_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Mensaje enviado con éxito";
            document.getElementById("contact_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("contact_OK_alert_id").style.display = 'none';
            }, 5000);
        },
        error: function(xhr, status, error){
            //Manejo de alerta
            document.getElementById("error_contact_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al enviar, inténtelo más tarde";
            document.getElementById("error_contact_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_contact_alert_id").style.display = 'none';
            }, 5000);

        }

    });

}
