//=============== AWS IDs ==============//

var userPoolId = 'eu-west-3_LtzWUdHcG';
var clientId= 'mreo7c1jviop9b2i7qdqnr77u';
var region = 'eu-west-3';
var identityPoolId = 'eu-west-3:ea23633a-d0ae-4261-b208-53e7ad0600f1';

var cognitoUser;
var idToken;
var userPool;

var poolData = {
	UserPoolId: userPoolId,
	ClientId: clientId
};

//INICIO DE SESIÓN
function signIn(){

	//document.getElementById("btn_signOut_id").style.display = "inline";

	var username = document.getElementById("username_id").value;
    var password = document.getElementById("pass_id").value;


    var authenticationData = {
        Username: username,
        Password: password
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var userData = {
        Username: username,
        Pool: userPool
    }

    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {

        onSuccess: function (result) {
	        var idToken = result.getIdToken().getJwtToken();
	        var accessToken = result.getAccessToken().getJwtToken();
	        var refreshToken = result.getRefreshToken().getToken();

	        // Almacenar tokens en el almacenamiento local
	        localStorage.setItem('idToken', idToken);
	        localStorage.setItem('accessToken', accessToken);
	        localStorage.setItem('refreshToken', refreshToken);

	        //CONTROL-------------------------
	        console.log(localStorage);
	        //--------------------------------

	        var usuario = userPool.getCurrentUser();

	        //CONTROL-----------------------
	        console.log(usuario);
	        //--------------------------------

	       	// Crear una nueva sesión de Cognito
	        var sessionData = {
	            IdToken: new AmazonCognitoIdentity.CognitoIdToken({ IdToken: idToken }),
	            AccessToken: new AmazonCognitoIdentity.CognitoAccessToken({ AccessToken: accessToken }),
	            RefreshToken: new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refreshToken })
	        };

	        var userSession = new AmazonCognitoIdentity.CognitoUserSession(sessionData);

	        // Establecer la sesión del usuario en Cognito
	        cognitoUser.setSignInUserSession(userSession);

            //var idToken = result.getIdToken().getJwtToken();
            AWS.config.region = region;

            var loginMap = {};
            loginMap['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = idToken;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: identityPoolId,
                Logins: loginMap
            });

            // Intentar obtener las credenciales
            AWS.config.credentials.get(function (err) {
                if (err) {
                    console.log("Error al obtener credenciales: ", err);

                    // Refrescar las credenciales si hay un error
                    AWS.config.credentials.refresh(function (refreshErr) {
                        if (refreshErr) {
                            console.log("Error al refrescar credenciales: ", refreshErr);
                        } else {
                            // Intentar de nuevo obtener las credenciales
                            AWS.config.credentials.get(function (secondAttemptErr) {
                                if (secondAttemptErr) {
                                    console.log("Error en segundo intento: ", secondAttemptErr);
                                } else {
                                    // Continuar con la lógica 
                                    continueLoginProcess();
                                }
                            });
                        }
                    });
                } else {
                    // Si no hay errores, continuar con la lógica 
                    continueLoginProcess();
                }
            });
        },
        onFailure: function (err) {
            //alert(err.message || JSON.stringify(err));
            //Manejo de alerta
            document.getElementById("error_login_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+"Usuario o contraseña incorrecto";
            document.getElementById("error_login_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_login_alert_id").style.display = 'none';
            }, 5000);
        }
    });
}

function continueLoginProcess() { 	
	cognitoUser.getUserAttributes(function (err, attributes) {
	    if (err) {
	        // Manejar el error
	        console.error(err);
	        return;
	    }
	    var is_admin;

	    for (let attribute of attributes) {
	        if (attribute.getName() === "custom:ADMIN") {
	            is_admin = attribute.getValue();
                console.log(is_admin);
	        }
	    }

	    if (is_admin === "super") {
	    	cargarPaginaInicioAdmin();
            //alert("Hola");
	    } else {
	    	//Manejo de alerta
            document.getElementById("error_login_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+"Usted no tiene acceso a esta plataforma";
            document.getElementById("error_login_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_login_alert_id").style.display = 'none';
            }, 5000);
	    }
    });
}

//NUEVO SUPERADMIN
function newSuperAdmin(){

    var email = document.getElementById("email_id").value;
    var phone = document.getElementById("phone_id").value;
    var first_name = document.getElementById("first_name_id").value;
    var last_name = document.getElementById("last_name_id").value;


    var admin = "super";
    var group = "SuperAdmin";
    

    var char = '@'
    var username;
    var index = email.indexOf(char);
    if (index !== -1) {
        username = email.slice(0, index);
    }

    //CONTROL---------------
    console.log(username);
    //--------------------

    var params = {
        UserPoolId: userPoolId, 
        Username: username, 
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
            {
                Name: 'email',
                Value: email
            },
            {
                Name: 'phone_number',
                Value: phone
            },
            {
                Name: 'name',
                Value: first_name
            },
            {
                Name: 'family_name',
                Value: last_name
            },
            {
                Name: "custom:ADMIN",
                Value: admin
            }

        ]
    };

    AWS.config.update({
        region: region, 
        credentials: new AWS.Credentials({
            accessKeyId: 'AKIA2F5X4UUYBAWQKDEE', // Nueva: AKIA2F5X4UUYBAWQKDEE Antigua: AKIA2F5X4UUYB42FUJQC
            secretAccessKey: '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' //Nueva: YnN/MM6NJAgN/sxtnmaSYmi4QlNlZgit5gXexArN Antigua: InDm8+Tgii5VvNkfoP2IrzQYbX+S7Jl6eSaQli8o
        })
    });
    
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.adminCreateUser(params, function(err, data) {

        if (err) {
            //CONTROL-----------------------------
            console.log(err, err.stack);
            console.log('Error: ' + err.message);
            //------------------------------------
        } else {
            //Usuario creado correctamente

            //CONTROL----------------------------
            console.log(data);
            console.log('Invitación enviada a ' + email);
            //--------------------------------------

            var groupParams = {
                GroupName: group,
                Username: data.User.Username,
                UserPoolId: userPoolId 
            };

            cognitoidentityserviceprovider.adminAddUserToGroup(groupParams, function(err, response) {
                if (err) {
                    //CONTROL--------------------------
                    console.log(err, err.stack); // Error al agregar al usuario al grupo
                    //---------------------------------
                } else {
                    //CONTROL---------------------------
                    console.log("Usuario agregado al grupo " + group + " con éxito");
                    //----------------------------------
                }
            });
            
            cognitoUser = data.User;
            
            var userData = {

                email: cognitoUser.Attributes.find(attr => attr.Name === 'email').Value,
                sub: cognitoUser.Attributes.find(attr => attr.Name === 'sub').Value,
                name: cognitoUser.Attributes.find(attr => attr.Name === 'name').Value,
                family_name: cognitoUser.Attributes.find(attr => attr.Name === 'family_name').Value,
                phone_number: cognitoUser.Attributes.find(attr => attr.Name === 'phone_number').Value,
                username: cognitoUser.Username,
                isAdmin: cognitoUser.Attributes.find(attr => attr.Name === 'custom:ADMIN').Value
            };

            //CONTROL------------------------------
            console.log(JSON.stringify(userData));
            //------------------------------------

            //GUARDAR USUARIO EN BBDD
            //var url_userToBBDD = 'https://zl4qcuha2h.execute-api.eu-west-3.amazonaws.com/dev';
            var url_userToBBDD = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/addUserToBBDD';

            $.ajax({
                url: url_userToBBDD, 
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(userData),
                success: function(response) {
                    console.log('Respuesta de la API:', response);
                },
                error: function(error) {
                    console.error('Error en la llamada a la API:', error);
                    console.log(error);
                }
            });
        }
    }); 
}

//NUEVO ADMINISTRADOR ASOCIADO A UNA FINCA
function inviteAdmin(){

    var id_empresa = sessionStorage.getItem('empresaActual');

    var email = document.getElementById("email_id").value;
    var phone = document.getElementById("phone_id").value;
    var first_name = document.getElementById("first_name_id").value;
    var last_name = document.getElementById("last_name_id").value;

    var admin = "yes";
    var group = "Admin";

    var char = '@'
    var username;
    var index = email.indexOf(char);
    if (index !== -1) {
        username = email.slice(0, index);
    }

    var params = {
        UserPoolId: userPoolId, 
        Username: username, 
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
            {
                Name: 'email',
                Value: email
            },
            {
                Name: 'phone_number',
                Value: phone
            },
            {
                Name: 'name',
                Value: first_name
            },
            {
                Name: 'family_name',
                Value: last_name
            },
            {
                Name: "custom:ADMIN",
                Value: admin
            }

        ]
    };

    AWS.config.update({
        region: region, 
        credentials: new AWS.Credentials({
            accessKeyId: 'AKIA2F5X4UUYBAWQKDEE', // Nueva: AKIA2F5X4UUYBAWQKDEE Antigua: AKIA2F5X4UUYB42FUJQC
            secretAccessKey: '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' //Nueva: YnN/MM6NJAgN/sxtnmaSYmi4QlNlZgit5gXexArN Antigua: InDm8+Tgii5VvNkfoP2IrzQYbX+S7Jl6eSaQli8o
        })
    });

    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.adminCreateUser(params, function(err, data) {

        if (err) {
            //CONTROL-----------------------------
            console.log(err, err.stack);
            console.log('Error: ' + err.message);
            //------------------------------------
        } else {
            //Usuario creado correctamente

            //CONTROL----------------------------
            console.log(data);
            console.log('Invitación enviada a ' + email);
            //--------------------------------------

            var groupParams = {
                GroupName: group,
                Username: data.User.Username,
                UserPoolId: userPoolId 
            };

            cognitoidentityserviceprovider.adminAddUserToGroup(groupParams, function(err, response) {
                if (err) {
                    //CONTROL--------------------------
                    console.log(err, err.stack); // Error al agregar al usuario al grupo
                    //---------------------------------
                } else {
                    //CONTROL---------------------------
                    console.log("Usuario agregado al grupo " + group + " con éxito");
                    //----------------------------------
                }
            });
            
            cognitoUser = data.User;
            
            var userData = {

                email: cognitoUser.Attributes.find(attr => attr.Name === 'email').Value,
                sub: cognitoUser.Attributes.find(attr => attr.Name === 'sub').Value,
                name: cognitoUser.Attributes.find(attr => attr.Name === 'name').Value,
                family_name: cognitoUser.Attributes.find(attr => attr.Name === 'family_name').Value,
                phone_number: cognitoUser.Attributes.find(attr => attr.Name === 'phone_number').Value,
                username: cognitoUser.Username,
                isAdmin: cognitoUser.Attributes.find(attr => attr.Name === 'custom:ADMIN').Value,
                empresa: id_empresa
            };

            //CONTROL------------------------------
            console.log(JSON.stringify(userData));
            //------------------------------------

            //GUARDAR USUARIO EN BBDD
            //var url_userToBBDD = 'https://zl4qcuha2h.execute-api.eu-west-3.amazonaws.com/dev';
            var url_userToBBDD = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/addUserToBBDD';
            $.ajax({
                url: url_userToBBDD, 
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(userData),
                success: function(response) {
                    console.log('Respuesta de la API:', response);
                    //Manejo de alerta
                    document.getElementById("assignAdmin_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Invitación enviada";
                    document.getElementById("assignAdmin_OK_alert_id").style.display="inline";
                    setTimeout(function() {
                        document.getElementById("assignAdmin_OK_alert_id").style.display = 'none';
                    }, 5000);
                },
                error: function(error) {
                    console.error('Error en la llamada a la API:', error);
                    console.log(error);

                    //Manejo de alerta
                    document.getElementById("error_assignAdmin_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al enviar invitación, inténtelo más tarde";
                    document.getElementById("error_assignAdmin_alert_id").style.display="inline";
                    setTimeout(function() {
                        document.getElementById("error_assignAdmin_alert_id").style.display = 'none';
                    }, 5000);
                }
            });

        }
    });

}

}

