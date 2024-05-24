var userPoolId = 'eu-west-3_LtzWUdHcG';
var clientId= 'mreo7c1jviop9b2i7qdqnr77u';
var region = 'eu-west-3';
var identityPoolId = 'eu-west-3:ea23633a-d0ae-4261-b208-53e7ad0600f1';

var poolData = {
	UserPoolId: userPoolId,
	ClientId: clientId
};

var sub_admin;

function restoreCognitoSession(callback) {
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

                    sub_admin = attributes.find(attribute => attribute.getName() === 'sub');
                    if (sub_admin) {
                        console.log("Sub del usuario:", sub_admin.getValue());
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

function registerEstate(){
    restoreCognitoSession(function(){
        var admin_user_id = sub_admin.getValue(); 

        var address = document.getElementById("address_id").value;
        var city = document.getElementById("city_id").value;
        var region = document.getElementById("region_id").value;
        var zip = document.getElementById("zip_id").value;
        var name = document.getElementById("name_id").value;

        if(!address||!city||!region||!zip||!name){
            //Manejo de alerta
            document.getElementById("error_newEstate_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Por favor, rellene todos los campos";
            document.getElementById("error_newEstate_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_newEstate_alert_id").style.display = 'none';
            }, 5000); 
            return;
        }

        var dataEstate = {
            "address": address,
            "city": city,
            "region": region,
            "zip": zip,
            "name": name,
            "admin_user_id": admin_user_id
        };


        var data = JSON.stringify(dataEstate);

        // CONTROL-------
        console.log("Datos enviados a la API: ", data);
        //---------------
        
        var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/addEstateToBBDD';

        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json', 
            contentType: 'application/json', 
            data: data, 
            success: function(response) {
                //CONTROL
                console.log("Respuesta recibida: ", response);
                cargarListadoFincas();
                //Manejo de alerta
                document.getElementById("newEstate_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Finca registrada correctamente";
                document.getElementById("newEstate_OK_alert_id").style.display="inline";
                setTimeout(function() {
                    document.getElementById("newEstate_OK_alert_id").style.display = 'none';
                }, 5000);
                cargarListadoFincas();
            },
            error: function(xhr, status, error) {
                //CONTROL
                console.error("Error en la respuesta: ", xhr.responseText);
                console.error("Detalle del error: ", status, error);

                //Manejo de alerta
                document.getElementById("error_newEstate_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al registrar finca, inténtelo más tarde";
                document.getElementById("error_newEstate_alert_id").style.display="inline";
                setTimeout(function() {
                    document.getElementById("error_newEstate_alert_id").style.display = 'none';
                }, 5000);
            }
        });
    });
}

function registerProperty(){
	
   
	var id_finca = sessionStorage.getItem('fincaActual');

    //CONTROL------------------
	console.log(id_finca);
    //------------------------

    var piso = document.getElementById("piso_id").value;
    var num = document.getElementById("num_id").value;
    var descripcion = document.getElementById("descripcion_id").value;
    var tipo = document.getElementById("tipo_id").value;

    if(!piso||!num||!descripcion||!tipo){
        //Manejo de alerta
        document.getElementById("error_newProp_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Por favor, rellene todos los campos";
        document.getElementById("error_newProp_alert_id").style.display="inline";
        setTimeout(function() {
            document.getElementById("error_newProp_alert_id").style.display = 'none';
        }, 5000); 
        return; //Detiene la ejecución 

    }

	var dataProp = {
		"piso": piso,
		"num": num,
		"descripcion": descripcion,
		"tipo": tipo,
		"estate": id_finca
	};

	var data = JSON.stringify(dataProp);

    // CONTROL 
    console.log("Datos enviados a la API: ", data);

    
    var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/addPropertytoBBDD';


    $.ajax({
    	type: 'POST',
    	url: url,
    	dataType: 'json',
    	contentType: 'application/json',
    	data: data,
    	success: function(response){
            //CONTROL--------
        		console.log("Respuesta recibida: ", response);
            //-----------------
            //Manejo de alerta
            document.getElementById("newProp_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Propiedad registrada correctamente";
            document.getElementById("newProp_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("newProp_OK_alert_id").style.display = 'none';
            }, 5000);
            cargarListadoFincas();
    	},
    	error: function(xhr, status, error){
    		
            //CONTROL-------
            console.error("Error en la respuesta: ", xhr.responseText);
            console.error("Detalle del error: ", status, error);
            //-----------
            //Manejo de alerta
            document.getElementById("error_newProp_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al registrar propiedad, inténtelo más tarde";
            document.getElementById("error_newProp_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_newProp_alert_id").style.display = 'none';
            }, 5000); 
    	}
    });
}

function upload(){
    $('#fileInputcsv').click();

    $('#fileInputcsv').change(function() {
        var file = this.files[0];

        if (file) {
            const reader = new FileReader();
            var name_file = sessionStorage.getItem('fincaActual');
            console.log(name_file);

            reader.onload = function(e) {
                const content = e.target.result;

                
                var url_uploadcsv = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/uploadcsv';

                // Realizar la llamada AJAX
                $.ajax({
                    url: url_uploadcsv,
                    type: 'POST',
                    data: content, 
                    processData: false, 
                    contentType: 'text/csv; charset=utf-8', 
                    headers: {
                        'X-File-Name': name_file 
                    },
                    success: function(response) {
                        console.log('Archivo subido con éxito:', response);
                     
                    },
                    error: function(xhr, status, error) {
                        console.error('Error al subir archivo:', error);
                       
                    }
                });
            };

            reader.readAsText(file, 'UTF-8'); 
        }
    })
}

function selectFile(){
    document.getElementById('fileInput').click();

    document.getElementById('fileInput').onchange = function(){
        if (this.files.length > 0) {
            document.getElementById('uploadFileButton').disabled = false;
        } else {
            document.getElementById('uploadFileButton').disabled = true;
        }
    };
}

function uploadFile(){
    var file = document.getElementById('fileInput').files[0]; // Asegúrate de que este es tu input para archivos PDF
    if (file) {
        //alert("Hay fileeee"+file);
        var name_file = sessionStorage.getItem('fincaActual');
        var type_doc = document.getElementById("tipo_file_id").value;

        if(!type_doc){
            //Manejo de alerta
            document.getElementById("error_upFile_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Por favor, indique tipo de archivo";
            document.getElementById("error_upFile_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_upFile_alert_id").style.display = 'none';
            }, 5000);
        }

        var reader = new FileReader();
        reader.onload = function(event) {
            var base64String = event.target.result.split(',')[1];

            var url_uploadFile = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/uploadFile_2';

            $.ajax({
                url: url_uploadFile,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    base64String: base64String,
                    fileName: name_file,
                    typeDoc: type_doc
                }),
                success: function(response) {
                    //CONTROL---------------------------------------------
                    console.log('Respuesta del servidor:', response);
                    console.log('Evento creado con éxito', response);
                    //-----------------------------------------------------

                    //Manejo de alerta---------------------------------------------------------------------
                    document.getElementById("upFile_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Archivo subido con éxito";
                    document.getElementById("upFile_OK_alert_id").style.display="inline";
                    setTimeout(function() {
                        document.getElementById("upFile_OK_alert_id").style.display = 'none';
                    }, 5000); 
                    //------------------------------------------------------------------------------------
                },
                error: function(xhr, status, error) {
                    console.error('Error al subir el PDF:', error);
                    //Manejo de alerta--------------------------------------------------------------------
                    document.getElementById("error_upFile_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al subir archivo, inténtelo más tarde";
                    document.getElementById("error_upFile_alert_id").style.display="inline";
                    setTimeout(function() {
                        document.getElementById("error_upFile_alert_id").style.display = 'none';
                    }, 5000);
                    //------------------------------------------------------------------------------------
                }
            });
        };
        reader.readAsDataURL(file);
    }
    else {
        //Manejo de alerta--------------------------------------------------------------------------------------
        document.getElementById("error_upFile_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Por favor, seleccione un archivo";
        document.getElementById("error_upFile_alert_id").style.display="inline";
        setTimeout(function() {
            document.getElementById("error_upFile_alert_id").style.display = 'none';
        }, 5000);
        //------------------------------------------------------------------------------------------------------
    }
}

function userToProperty(user_id, rol, email){

	var property = sessionStorage.getItem('propiedadActual');

    //CONTROL---------------------------------------------
	console.log("PROPIEDAD: "+ property);
    //----------------------------------------------------

	var dataToBBDD = {
		"property_id": property,
		"user_id": user_id,
		"rol": rol,
        "email": email
		//faltaria añadir el rol del usuario
	};

	var data = JSON.stringify(dataToBBDD);
	//alert(data);

    //var url_userToProp = 'https://231boxpcv4.execute-api.eu-west-3.amazonaws.com/dev';
    var url_userToProp = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/userToProperty';


	$.ajax({
		type: 'POST',
		url: url_userToProp, 
    	dataType: 'json',
    	contentType: 'application/json',
    	data: data,
    	success: function(response){
    		console.log("Respuesta recibida: ", response);
    	},
    	error: function(xhr, status, error){
            console.error("Error en la respuesta: ", xhr.responseText);
            console.error("Detalle del error: ", status, error);
    	}
	});
}

function crearEvento(){

    document.getElementById("error_evento_alert_id").style.display="none";
    document.getElementById("evento_OK_alert_id").style.display="none";

    var titulo = document.getElementById("titulo_evento_id").value;
    var descripcion = document.getElementById("descripcion_evento_id").value;
    var inicio = document.getElementById("start_evento_id").value;
    var fin = document.getElementById("end_evento_id").value;
    var fincaEvento = sessionStorage.getItem('fincaActual');

    if(!titulo||!descripcion||!inicio||!fin){
        //Manejo de alerta--------------------------------------------------------------------------------------------------
        document.getElementById("error_evento_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Por favor, rellene todos los campos";
        document.getElementById("error_evento_alert_id").style.display="inline";
        setTimeout(function() {
            document.getElementById("error_evento_alert_id").style.display = 'none';
        }, 5000); 
        return; 
        //-----------------------------------------------------------------------------------------------------------------
    }

    //CONTROL----------------------------------
    console.log(inicio);
    console.log(fin);
    console.log(fincaEvento);
    //----------------------------------------

    var inicioDate = Date.parse(inicio);
    var finDate = Date.parse(fin);

    // Comprobar si la fecha de inicio es posterior a la fecha de fin
    if (inicioDate >= finDate) {
        //Manejo de alerta--------------------------------------------------------------------------------------------------- 
        document.getElementById("error_evento_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" La fecha de inicio no es válida";
        document.getElementById("error_evento_alert_id").style.display="inline";
        setTimeout(function() {
            document.getElementById("error_evento_alert_id").style.display = 'none';
        }, 5000);
        return;
        //-----------------------------------------------------------------------------------------------------------------
    }

    var dataToSend = {
        "titulo_evento": titulo,
        "descripcion_evento": descripcion,
        "start_evento": inicio,
        "end_evento": fin,
        "finca_evento": fincaEvento
    };

    //CONTROL----------------------------------
    console.log(dataToSend);
    //----------------------------------------

    document.getElementById("error_evento_alert_id").style.display="none"; 

    var url_newEvent = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/newEvent';

    $.ajax({
        url: url_newEvent,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function(response) {

            //CONTROL--------------------------------
            console.log('Evento creado con éxito', response);
            //----------------------------------------

            //Manejo de alerta--------------------------------------------------------------------------------------------------------
            document.getElementById("evento_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Evento creado con éxito";
            document.getElementById("evento_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("evento_OK_alert_id").style.display = 'none';
            }, 5000); 
            //-----------------------------------------------------------------------------------------------------------------

        },
        error: function(xhr, status, error) {

            //CONTROL---------------------------------------
            console.error('Error al crear el evento', error);
            //----------------------------------------

            //Manejo de alerta--------------------------------------------------------------------------------------------------------------
            document.getElementById("error_evento_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al crear evento, inténtelo más tarde";
            document.getElementById("error_evento_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_evento_alert_id").style.display = 'none';
            }, 5000); 
            //-------------------------------------------------------------------------------------------------------------------------------
        }
    });
}


function marcarLeido(){
    var msg = JSON.parse(sessionStorage.getItem('msgActual'));
    var id = msg.SUGESTION_ID;
    var finca = JSON.parse(sessionStorage.getItem('fincaActual_object'));

    var dataToSend = {
        "id": id
    };

    var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/marcarLeido';

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'applicaton/json',
        data: JSON.stringify(dataToSend),
        success: function(response){
            cargarPaginaFinca(finca);
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------
            document.getElementById("leido_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Mensaje leido";
            document.getElementById("leido_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("leido_OK_alert_id").style.display = 'none';
            }, 5000);
            //------------------------------------------------------------------------------------------------------------------------------------------
        },
        error: function(xhr, status, error){
            //Manejo de alerta-------------------------------------------------------------------------------------------------------------------------
            document.getElementById("error_leido_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al marcar como leido inténtelo más tarde";
            document.getElementById("error_leido_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_leido_alert_id").style.display = 'none';
            }, 5000);
            //------------------------------------------------------------------------------------------------------------------------------------------
        }

    });
}

function cancelarEvento(){

    var evento = JSON.parse(sessionStorage.getItem('evtActual'));
    var id = evento.EVENT_ID;
    var finca = JSON.parse(sessionStorage.getItem('fincaActual_object'));

    var dataToSend = {
        "id": id
    };

    var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/cancelEvent';

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function(response){
            cargarPaginaFinca(finca);
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------------------------
            document.getElementById("canc_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Evento cancelado";
            document.getElementById("canc_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("canc_OK_alert_id").style.display = 'none';
            }, 5000);
            //--------------------------------------------------------------------------------------------------------------------------------------------------------

        },
        error: function(xhr, status, error){
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------------------------
            document.getElementById("error_canc_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al cancelar evento inténtelo más tarde";
            document.getElementById("error_canc_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_canc_alert_id").style.display = 'none';
            }, 5000);
            //--------------------------------------------------------------------------------------------------------------------------------------------------------
        }

    });
}

function crearEncuesta(){
    var finca_id = sessionStorage.getItem('fincaActual');
    var motivo = document.getElementById("motivo_encuesta_id").value;
    var desc = document.getElementById("descripcion_encuesta_id").value;

    var dataToSend = {
        "motivo": motivo,
        "desc": desc,
        "finca_id": finca_id
    }

    var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/crearEncuesta';

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function(response){
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------------------------
            document.getElementById("encuesta_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Mensaje enviado con éxito";
            document.getElementById("encuesta_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("encuesta_OK_alert_id").style.display = 'none';
            }, 5000);
            //--------------------------------------------------------------------------------------------------------------------------------------------------------
        },
        error: function(xhr, status, error){
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------------------------
            document.getElementById("error_encuesta_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al enviar encuesta, inténtelo más tarde";
            document.getElementById("error_encuesta_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_encuesta_alert_id").style.display = 'none';
            }, 5000);
            //--------------------------------------------------------------------------------------------------------------------------------------------------------

        }

    });
}

function difundirMensaje(){
    var finca_id = sessionStorage.getItem('fincaActual');
    var asunto = document.getElementById('titulo_difundido_id').value;
    var mensaje =  document.getElementById('descripcion_difundido_id').value;
    var destinatarios = document.getElementById('dest_id').value;
    
    var dataToSend = {
        "asunto": asunto,
        "mensaje": mensaje,
        "finca_id": finca_id,
        "destinatarios": destinatarios
    }

    var url = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/contactAdmin'
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function(response){
            document.getElementById("difundido_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Mensaje enviado con éxito";
            document.getElementById("difundido_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("difundido_OK_alert_id").style.display = 'none';
            }, 5000);
        },
        error: function(xhr, status, error){
            //CONTROL------------------
            console.error(error);
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------------------------
            document.getElementById("error_difundido_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al enviar mensaje, inténtelo más tarde";
            document.getElementById("error_difundido_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_difundido_alert_id").style.display = 'none';
            }, 5000);
            //--------------------------------------------------------------------------------------------------------------------------------------------------------

        }
    });
}
