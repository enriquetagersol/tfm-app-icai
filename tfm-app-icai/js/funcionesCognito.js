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

	document.getElementById("btn_signOut_id").style.display = "inline";

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
            alert(err.message || JSON.stringify(err));
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
	        }
	    }

	    if (is_admin === "yes") {
	    	cargarListadoFincas();
	    	cargarMensajesAdmin();
	    	document.getElementById("inbox_admin_id").style.display="inline";
	    	document.getElementById("btn_add_finca_id").style.display="inline";
	    	document.getElementById("titulo_app_id").onclick = function() {
			    cargarListadoFincas();
			};

	    } else {
	    	cargarListadoPropiedades_Users();
	    }
	    cargarListadoPropiedades_Users();
    });
}

//COMPROBAR SI EL USUARIO ESTÁ REGISTRADO

function comprobarUser(){
	document.getElementById("user_not_found_alert_id").style.display="none";
	document.getElementById("user_found_alert_id").style.display="none";
	var email = document.getElementById("mailSearch_id").value;

	checkIfUserExists(email, userPoolId, function(err, exists, sub) {
	    if (err) {
	        console.error('Error al verificar el usuario:', err);
	    } else if (exists) {
	    	document.getElementById("user_found_alert_id").style.display="inline";
	    	//CONTROL------------------------------------------------
	        console.log('El usuario está registrado en Cognito.');
	        console.log('sub del usuario: '+ sub);
	        //-------------------------------------------------------
	        var rol = document.getElementById("search_rol_id").value;
	        var link = document.getElementById("user_found_alert_link_id");
	        link.onclick = function(){
	        	userToProperty(sub, rol, email);
	        };

	    } else {
	    	document.getElementById("user_not_found_alert_id").style.display="inline";
	    	//CONTROL------------------------------------------------
	        console.log('El usuario no está registrado en Cognito.');
	        //-------------------------------------------------------
	    }
	});
}

function checkIfUserExists(email, userPoolId, callback) {
    const params = {
        UserPoolId: userPoolId,
        Filter: 'email = "' + email + '"',
        Limit: 1
    };
    const cognito = new AWS.CognitoIdentityServiceProvider();
    cognito.listUsers(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callback(err, null);
        } else {
            const users = data.Users || [];
            const userExists = users.length > 0;
            if (userExists) {

                const user = users[0];

                const subAttribute = user.Attributes.find(attr => attr.Name === 'sub');
                const userSub = subAttribute ? subAttribute.Value : null;

                callback(null, userExists, userSub);
            } else {
                // No se encontraron usuarios
                callback(null, userExists, null);
            }
        }
    });
}


//INVITAR USUARIO
function inviteUser(){

	var email = document.getElementById("email_id").value;
	var phone = document.getElementById("phone_id").value;
	var first_name = document.getElementById("first_name_id").value;
	var last_name = document.getElementById("last_name_id").value;
	var rol = document.getElementById("rol_id").value; //Esto es para la tabla de PROPERTIES


	var admin = "No";
	var group = "User";
	

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
		    accessKeyId: 'AKIA2F5X4UUYB42FUJQC',
		    secretAccessKey: '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'
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
    		
    		var url_userToBBDD = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/addUserToBBDD';
            $.ajax({
		        url: url_userToBBDD, 
		        type: 'POST',
		        contentType: 'application/json',
		        data: JSON.stringify(userData),
		        success: function(response) {
		        	//CONTROL------------------------------------
		            console.log('Respuesta de la API:', response);
		            //------------------------------------------
		            //Manejo de alerta
		            document.getElementById("inviteUser_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Invitación enviada correctamente";
		            document.getElementById("inviteUser_OK_alert_id").style.display="inline";
		            setTimeout(function() {
		                document.getElementById("inviteUser_OK_alert_id").style.display = 'none';
		            }, 5000);
		        },
		        error: function(error) {
		        	//CONTROL--------------------------------------------
		            console.error('Error en la llamada a la API:', error);
		            console.log(error);
		            //-------------------------------------------------

		            //Manejo de alerta
		            document.getElementById("error_inviteUser_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al enviar invitación, inténtelo más tarde";
		            document.getElementById("error_inviteUser_alert_id").style.display="inline";
		            setTimeout(function() {
		                document.getElementById("error_inviteUser_alert_id").style.display = 'none';
		            }, 5000);
		        }
		    });

		    //ASIGNAR USUARIO A LA PROPIEDAD
		    var user_id = cognitoUser.Attributes.find(attr => attr.Name === 'sub').Value;
		    //control
		    alert(user_id);
		    userToProperty(user_id, rol, email); //está en funcionesAdmin.js
        }
    });	
}

//CAMBIO CONTRASEÑA TEMPORAL
function changeTempPass(){

	AWS.config.update({
	    region: region,
	    credentials: new AWS.Credentials({
		    accessKeyId: 'AKIA2F5X4UUYB42FUJQC',
		    secretAccessKey: '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'
	    })
	});

	userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	var username = document.getElementById('user_login_id').value;
    var temp_password = document.getElementById('temp_pass_id').value;
    var new_pass = document.getElementById('new_pass_id').value;

    var authenticationData = {
        Username: username,
        Password: temp_password
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    console.log(authenticationDetails);

    var userData = {
        Username: username,
        Pool: userPool
    };

    //CONTROL-------------------
    console.log(userData);
    //---------------------------

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    //CONTROL--------------------
    console.log(cognitoUser);
    //--------------------------

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            //CONTROL-------------------------------
            console.log('Successful authentication');
            //-------------------------------------
        },
        onFailure: function(err) {
        	//CONTROL-------------------------------
            console.log(err.message || JSON.stringify(err));
            //-------------------------------------
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {

            delete userAttributes.email;
            delete userAttributes.email_verified;
            delete userAttributes.phone_number;

            cognitoUser.completeNewPasswordChallenge(new_pass, userAttributes, {
                onSuccess: function(result) {
                    
                     // Obtener los atributos del usuario
                    cognitoUser.getUserAttributes(function(err, attributes) {
                        if (err) {
                            console.log(err.message || JSON.stringify(err));
                            return;
                        }

                        // Buscar el atributo 'custom:ADMIN'
                        const adminAttribute = attributes.find(attr => attr.getName() === 'custom:ADMIN');
                        const adminValue = adminAttribute ? adminAttribute.getValue() : null;

                       
                        let redirectURL;
                        if (adminValue === 'super') {
                            redirectURL = 'http://tfm-app-icai-admins.s3-website.eu-west-3.amazonaws.com';
                        } else {
                            
                            redirectURL = 'http://tfm-app-icai.s3-website.eu-west-3.amazonaws.com';
                        }

                        
                        window.location.href = redirectURL;
                    });
                },
                onFailure: function(err) {
                	//CONTROL-----------------------------------
                    console.log(err.message || JSON.stringify(err));
                    //-----------------------------------------------
                }
            });
        }
    });
}

//SIGN OUT
function signOut(){
	userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.signOut();
        
  
        alert("Sesión cerrada");
        
        window.location.href = 'http://tfm-app-icai.s3-website.eu-west-3.amazonaws.com'
    }
}
