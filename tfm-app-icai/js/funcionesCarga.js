function cargarBuscadorUsuario(){
	document.getElementById("botonBuscar").style.display="inline";
	document.getElementById("botonInvitar").style.display="none";
	var url_buscadorUsuarios = 'https://tfm-app-icai.s3.eu-west-3.amazonaws.com/buscadorUser.html';
	$.ajax({
		type : 'GET',
	    url : url_buscadorUsuarios,
	    success: function(response)
	    {
			document.getElementById("modal_Invite_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_Invite_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
	});
}

function cargarFormularioInvitacion(){
	document.getElementById("botonInvitar").style.display="inline";
	document.getElementById("botonBuscar").style.display="none";
	var url_FormInvite = 'https://tfm-app-icai.s3.eu-west-3.amazonaws.com/inviteUser.html';
	$.ajax({
	    type : 'GET',
	    url : url_FormInvite,
	    success: function(response)
	    {
			document.getElementById("modal_Invite_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_Invite_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });
}

function cargarFormularioFinca(){
	var url_FormFinca = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/registerEstate.html";
	$.ajax({
	    type : 'GET',
	    url : url_FormFinca,
	    success: function(response)
	    {
			document.getElementById("modal_RegFinca_body_id").innerHTML=response;
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });
}

function cargarFormularioPropiedad(){
	var url_FormProp = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/registerProp.html";
	$.ajax({
	    type : 'GET',
	    url : url_FormProp,
	    success: function(response)
	    {
			document.getElementById("modal_RegProp_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_RegProp_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });
}

function cargarFormularioUploadFile(){
	var url_FormUpload = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/uploadFiles.html";
	$.ajax({
		type: 'GET',
		url: url_FormUpload,
		success: function(response)
		{
			document.getElementById("modal_uploadArchivos_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_uploadArchivos_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}

	});
}

function cargarNuevoEvento(){
	var url_FormEvent = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/nuevoEvento.html";
	$.ajax({
		type: 'GET',
		url: url_FormEvent,
		success: function(response)
		{
			document.getElementById("modal_crearEvento_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_crearEvento_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}

	});
}

function cargarEnviarArchivo(){
	var url_EnviarArchivo = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/enviarArchivo.html";
	$.ajax({
		type: 'GET',
		url: url_EnviarArchivo,
		success: function(response){
			document.getElementById("modal_mandar_archivo_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_mandar_archivo_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}
	});
}

function cargarContactAdmin(){
	var url_ContactAdmin = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/contactAdmin.html";
	$.ajax({
		type: 'GET',
		url: url_ContactAdmin,
		success: function(response){
			document.getElementById("modal_contactAdmin_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_contactAdmin_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}
	});
}

function cargarMensaje(){
	var msg = JSON.parse(sessionStorage.getItem('msgActual'));
	console.log(msg);
	var url_messageDetail = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/contenidoMsg.html";
	$.ajax({
		type: 'GET',
		url: url_messageDetail,
		success: function(response){
			document.getElementById("modal_msg_body_id").innerHTML=response;
			var asunto = document.getElementById("titulo_msg_id");
			var contenido = document.getElementById("descripcion_contact_id");
			asunto.innerHTML = msg.Asunto;
			contenido.innerHTML = msg.Mensaje;
			var modal = new bootstrap.Modal(document.getElementById('modal_msg_id'));
			modal.show();
		}, 
		error:function(response)
		{
			console.log(response);
			alert(response);
		}

	});
}

function cargarInfoEvento(){
	var evento = JSON.parse(sessionStorage.getItem('evtActual'));
	var url_eventDetail = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/infoEvento.html";
	$.ajax({
		type: 'GET',
		url: url_eventDetail,
		success: function(response){
			document.getElementById("modal_info_evento_body_id").innerHTML=response;
			var titulo = document.getElementById("titulo_evento_id");
			var descripcion = document.getElementById("descripcion_evento_id");
			titulo.innerHTML = evento.Titulo;
			descripcion.innerHTML = evento.Descripcion;

			var total = evento.Totales.totalInvitados;
			var confirmados = evento.Totales.totalConfirmados;
			var declinados = evento.Totales.totalDeclinados;
			var pendientes = evento.Totales.totalSinConfirmar;

			var conf_prct = (confirmados/total)*100;
			var pen_prct = (pendientes/total)*100;
			var dec_prct = (declinados/total)*100;

			var conf_bar = document.getElementById("progress_confirmed_id");
			var dec_bar = document.getElementById("progress_declined_id");
			var pen_bar = document.getElementById("progress_pending_id");
			var p_total = document.getElementById("total_invitados_id");

			conf_bar.style.width = conf_prct + '%';
			dec_bar.style.width = dec_prct + '%';
			pen_bar.style.width = pen_prct + '%';

			conf_bar.innerHTML="<strong>"+confirmados+"/"+total+" ("+conf_prct.toFixed(1)+"%)</strong>";
			dec_bar.innerHTML="<strong>"+declinados+"/"+total+" ("+dec_prct.toFixed(1)+"%)</strong>";
			pen_bar.innerHTML="<strong>"+pendientes+"/"+total+" ("+pen_prct.toFixed(1)+"%)</strong>";
			p_total.innerHTML="<strong>Total invitados: </strong>"+total;


			var modal = new bootstrap.Modal(document.getElementById('modal_info_evento_id'));
			modal.show();
		},
		error: function(response){
			console.log(response);
			alert(response);
		}

	});
}

function cargarInfoEvento_User(){
	var evento = JSON.parse(sessionStorage.getItem('evtActual'));
	var user_id = sessionStorage.getItem('userActual');
	var url_eventDetail = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/infoEvento.html";
	$.ajax({
		type: 'GET',
		url: url_eventDetail,
		success: function(response){
			document.getElementById("modal_info_evento_user_body_id").innerHTML=response;
			var titulo = document.getElementById("titulo_evento_id");
			var descripcion = document.getElementById("descripcion_evento_id");
			titulo.innerHTML = evento.Titulo;
			descripcion.innerHTML = evento.Descripcion;
			var modal = new bootstrap.Modal(document.getElementById('modal_info_evento_user_id'));

			var total = evento.Totales.totalInvitados;
			var confirmados = evento.Totales.totalConfirmados;
			var declinados = evento.Totales.totalDeclinados;
			var pendientes = evento.Totales.totalSinConfirmar;

			var conf_prct = (confirmados/total)*100;
			var pen_prct = (pendientes/total)*100;
			var dec_prct = (declinados/total)*100;

			var conf_bar = document.getElementById("progress_confirmed_id");
			var dec_bar = document.getElementById("progress_declined_id");
			var pen_bar = document.getElementById("progress_pending_id");
			var p_total = document.getElementById("total_invitados_id");

			conf_bar.style.width = conf_prct + '%';
			dec_bar.style.width = dec_prct + '%';
			pen_bar.style.width = pen_prct + '%';

			conf_bar.innerHTML="<strong>"+confirmados+"/"+total+" ("+conf_prct.toFixed(1)+"%)</strong>";
			dec_bar.innerHTML="<strong>"+declinados+"/"+total+" ("+dec_prct.toFixed(1)+"%)</strong>";
			pen_bar.innerHTML="<strong>"+pendientes+"/"+total+" ("+pen_prct.toFixed(1)+"%)</strong>";
			p_total.innerHTML="<strong>Total invitados: </strong>"+total;

			var invitados = evento.Invitados;

			var boton_asistencia = document.getElementById('boton_asistencia_id');

			var asistencia = invitados[user_id].asistencia;
			var evento_id = evento.EVENT_ID;
			console.log(evento_id);
			console.log(asistencia);
			if(asistencia != "Sin confirmar"){
				boton_asistencia.disabled=true;
			}
			else{
				boton_asistencia.disabled=false;
			}

			url = `https://tfm-app-icai.s3.eu-west-3.amazonaws.com/asistencia.html?token=${user_id}&eventoId=${evento_id}`;
			console.log(url);

			boton_asistencia.onclick = function(){
				window.open(url, '_blank');
				cargarListadoPropiedades_Users();
				modal.hide();

			}

			modal.show();
		},
		error: function(response){
			console.log(response);
			alert(response);
		}

	});

}

function cargarInfoEncuesta(){
	var encuesta = JSON.parse(sessionStorage.getItem('encActual'));
	var url_info_Encuesta = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/infoEncuesta.html";
	$.ajax({
		type: 'GET',
		url: url_info_Encuesta,
		success: function(response){
			document.getElementById("modal_info_encuestas_body_id").innerHTML=response;
			var motivo = document.getElementById("motivo_encuesta_id");
			var descripcion = document.getElementById("descripcion_encuesta_id");
			motivo.innerHTML = encuesta.Motivo;
			descripcion.innerHTML = encuesta.Descripcion;

			var total =  encuesta.Totales.totalEncuestados;
			var si = encuesta.Totales.totalSi;
			var no = encuesta.Totales.totalNo;
			var nsnc = encuesta.Totales.totalNSNC;

			var si_prct = (si/total)*100;
			var nsnc_prct = (nsnc/total)*100;
			var no_prct = (no/total)*100;

			var si_bar = document.getElementById("progress_si_id");
			var nsnc_bar = document.getElementById("progress_nsnc_id");progress_nsnc_id
			var no_bar = document.getElementById("progress_no_id");
			var p_total = document.getElementById("total_encuestados_id");

			si_bar.style.width = si_prct + '%';
			no_bar.style.width = no_prct + '%';
			nsnc_bar.style.width = nsnc_prct + '%';

			si_bar.innerHTML="<strong>"+si+"/"+total+" ("+si_prct.toFixed(1)+"%)</strong>";
			no_bar.innerHTML="<strong>"+no+"/"+total+" ("+no_prct.toFixed(1)+"%)</strong>";
			nsnc_bar.innerHTML="<strong>"+nsnc+"/"+total+" ("+nsnc_prct.toFixed(1)+"%)</strong>";
			p_total.innerHTML="<strong>Total encuestados: </strong>"+total;


			var modal = new bootstrap.Modal(document.getElementById('modal_info_encuestas_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}
	});

}

function cargarInfoEncuesta_User(){
	var encuesta = JSON.parse(sessionStorage.getItem('encActual'));
	console.log(encuesta);
	var user_id = sessionStorage.getItem('userActual');
	//CONTROL-----
	console.log(user_id);
	//--------
	var url_info_Encuesta = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/infoEncuesta.html";
	$.ajax({
		type: 'GET',
		url: url_info_Encuesta,
		success: function(response){
			document.getElementById("modal_info_encuestas_user_body_id").innerHTML=response;
			var motivo = document.getElementById("motivo_encuesta_id");
			var descripcion = document.getElementById("descripcion_encuesta_id");
			motivo.innerHTML = encuesta.Motivo;
			descripcion.innerHTML = encuesta.Descripcion;
			var modal = new bootstrap.Modal(document.getElementById('modal_info_encuestas_user_id'));

			var total =  encuesta.Totales.totalEncuestados;
			var si = encuesta.Totales.totalSi;
			var no = encuesta.Totales.totalNo;
			var nsnc = encuesta.Totales.totalNSNC;

			var si_prct = (si/total)*100;
			var nsnc_prct = (nsnc/total)*100;
			var no_prct = (no/total)*100;

			var si_bar = document.getElementById("progress_si_id");
			var nsnc_bar = document.getElementById("progress_nsnc_id");
			var no_bar = document.getElementById("progress_no_id");
			var p_total = document.getElementById("total_encuestados_id");

			si_bar.style.width = si_prct + '%';
			no_bar.style.width = no_prct + '%';
			nsnc_bar.style.width = nsnc_prct + '%';

			si_bar.innerHTML="<strong>"+si+"/"+total+" ("+si_prct.toFixed(1)+"%)</strong>";
			no_bar.innerHTML="<strong>"+no+"/"+total+" ("+no_prct.toFixed(1)+"%)</strong>";
			nsnc_bar.innerHTML="<strong>"+nsnc+"/"+total+" ("+nsnc_prct.toFixed(1)+"%)</strong>";
			p_total.innerHTML="<strong>Total encuestados: </strong>"+total;

			var encuestados = encuesta.Encuestados;

			var boton_votar = document.getElementById('boton_votar_id');

			var voto = encuestados[user_id].voto;
			var encuesta_id = encuesta.ENCUESTA_ID;
			console.log(encuesta_id);
			console.log(voto);
			if(voto != "NSNC"){
				boton_votar.disabled=true;
			}
			else{
				boton_votar.disabled=false;
			}

			url = `https://tfm-app-icai.s3.eu-west-3.amazonaws.com/votar.html?token=${user_id}&encuestaId=${encuesta_id}`;
			console.log(url);

			boton_votar.onclick = function(){
				window.open(url, '_blank');
				cargarListadoPropiedades_Users();
				modal.hide();

			}

			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}
	});
}

function cargarFormularioEncuestas(){
	var url_Encuesta = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/crearEncuesta.html";
	$.ajax({
		type: 'GET',
		url: url_Encuesta,
		success: function(response){
			document.getElementById("modal_encuestas_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_encuestas_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}
	});
}

function cargarFormularioDifundido(){
	var url_Difundido = 'https://tfm-app-icai.s3.eu-west-3.amazonaws.com/difundido.html';
	$.ajax({
		type: 'GET',
		url: url_Difundido,
		success: function(response){
			document.getElementById("modal_difundido_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_difundido_id'));
			modal.show();
		},
		error:function(response)
		{
			console.log(response);
			alert(response);
		}

	});
}

function cargarListadoFincas(){
	//Buscar en la bbdd las fincas del administrador que ha iniciado sesión
	restoreCognitoSession(function(){
		var admin_user_id = sub_admin.getValue(); 

		var data = {
            "admin_user_id": admin_user_id
        };

        //CONTROL-----------------------------------
        var dataRequest = JSON.stringify(data);
        //-------------------------------------------

        var url_listadoFincas = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listadoFincas';

		$.ajax({
            type: 'POST',
            url: url_listadoFincas,
            dataType: 'json', 
            contentType: 'application/json', 
            data: dataRequest, 
            success: function(response) {

                // CONTROL-----------------------------------
                console.log("Respuesta recibida: ", response);
                //-------------------------------------------
               
                var contenedor = document.getElementById('contenido-ajax');
                contenedor.innerHTML = '';
                contenedor.style.marginTop = '30px';

                var contenedorTarjetas = document.createElement('div');
                contenedorTarjetas.className = 'row justify-content-center'; 

                response.forEach(function(finca) {
                    var tarjeta = document.createElement('div');
                    tarjeta.className = 'card col-lg-5 mx-2'; 
                    tarjeta.style.marginBottom = '20px';

                    var cuerpoTarjeta = document.createElement('div');
                    cuerpoTarjeta.className = 'card-body';

                    var tituloTarjeta = document.createElement('h5');
                    tituloTarjeta.className = 'card-title';
                    tituloTarjeta.textContent = finca.name;
                    tituloTarjeta.onclick = function() {

                    	//CREAMOS VARIABLE DE SESIÓN CON EL ID DE LA FINCA PARA CUANDO CREEMOS USUARIOS O SUBAMOS ARCHIVOS
                    	sessionStorage.setItem('fincaActual', finca.ESTATE_ID);
                    	sessionStorage.setItem('fincaActual_object', JSON.stringify(finca));

                    	// CONTROL-----------------------------------
                    	console.log(sessionStorage.getItem('fincaActual'));
                    	//-------------------------------------------

				        cargarPaginaFinca(finca);
				    };

                    var espacioColor = document.createElement('div');
                    espacioColor.style.backgroundColor = '#295E7E';
                    espacioColor.style.height = '100px'; 
                    espacioColor.style.marginBottom = '20px';
                    
                    //Botón Registrar Propiedad-------------------------------------------------------------------------------------
					var iconAddProp= document.createElement('i');
					iconAddProp.className = 'bi bi-house-add';
					var botonAddProp = document.createElement('button');
                    botonAddProp.className = 'btn btn-secondary';
					botonAddProp.innerHTML = '';
					botonAddProp.appendChild(iconAddProp);
					botonAddProp.style.marginRight = '5px';
					botonAddProp.onclick = function(){
                    	sessionStorage.setItem('fincaActual', finca.ESTATE_ID);
                    	cargarFormularioPropiedad();
                    };
                    //----------------------------------------------------------------------------------------------------------------

                    //Boton subir documento-------------------------------------------------------------------------------------------
                    var iconUploadFila = document.createElement('i');
					iconUploadFila.className = 'bi bi-cloud-upload';
					var botonUploadFile = document.createElement('button');
                    botonUploadFile.className = 'btn btn-secondary';
					botonUploadFile.innerHTML = '';
					botonUploadFile.appendChild(iconUploadFila);
					botonUploadFile.style.marginRight = '5px';
					botonUploadFile.onclick = function(){
                    	sessionStorage.setItem('fincaActual', finca.ESTATE_ID);
                    	cargarFormularioUploadFile();
                    };
                    //----------------------------------------------------------------------------------------------------------------

                    //Boton crear evento----------------------------------------------------------------------------------------------
                    var iconSetEvent = document.createElement('i');
					iconSetEvent.className = 'bi bi-calendar-plus';
					var botonSetEvent = document.createElement('button');
                    botonSetEvent.className = 'btn btn-secondary';
					botonSetEvent.innerHTML = '';
					botonSetEvent.appendChild(iconSetEvent);
					botonSetEvent.style.marginRight = '5px';
					botonSetEvent.onclick = function(){
                    	sessionStorage.setItem('fincaActual', finca.ESTATE_ID);
                    	cargarNuevoEvento();
                    };
                    //----------------------------------------------------------------------------------------------------------------

                    //Boton crear encuesta-------------------------------------------------------------------------------------------
                    var iconEncuesta = document.createElement('i');
                    iconEncuesta.className = 'bi bi-bar-chart-steps';
                    var botonEncuesta = document.createElement('button');
                    botonEncuesta.className = 'btn btn-secondary';
					botonEncuesta.innerHTML = '';
					botonEncuesta.appendChild(iconEncuesta);
					botonEncuesta.style.marginRight = '5px';
					botonEncuesta.onclick = function(){
                    	sessionStorage.setItem('fincaActual', finca.ESTATE_ID);
                    	cargarFormularioEncuestas();
					};
					//----------------------------------------------------------------------------------------------------------------

					//Boton nuevo mensaje difusión--------------------------------------------------------------------------------------
					var iconDifusion = document.createElement('i');
                    iconDifusion.className = 'bi bi-megaphone';
                    var botonDifusion = document.createElement('button');
                    botonDifusion.className = 'btn btn-secondary';
					botonDifusion.innerHTML = '';
					botonDifusion.appendChild(iconDifusion);
					botonDifusion.onclick = function(){
                    	sessionStorage.setItem('fincaActual', finca.ESTATE_ID);
                    	cargarFormularioDifundido();
					};
					//----------------------------------------------------------------------------------------------------------------


                    cuerpoTarjeta.appendChild(tituloTarjeta);
                    cuerpoTarjeta.appendChild(espacioColor);
                    cuerpoTarjeta.appendChild(botonAddProp);
                    cuerpoTarjeta.appendChild(botonUploadFile);
                    cuerpoTarjeta.appendChild(botonSetEvent);
                    cuerpoTarjeta.appendChild(botonEncuesta);
                    cuerpoTarjeta.appendChild(botonDifusion);

                    tarjeta.appendChild(cuerpoTarjeta);

                    contenedorTarjetas.appendChild(tarjeta);

                });

                contenedor.appendChild(contenedorTarjetas);

                var inputfile = document.createElement('input');
                inputfile.type = 'file';
                inputfile.id = 'fileInput';
                inputfile.style.display = 'none';
                document.body.appendChild(inputfile);

            },
            error: function(xhr, status, error) {
                console.error("Error en la respuesta: ", xhr.responseText);
                console.error("Detalle del error: ", status, error);
            }
        });

	});
}

function cargarMensajesAdmin(){

	restoreCognitoSession(function(){
		var admin_user_id = sub_admin.getValue();
		var dataRequest = {
        "admin_user_id": admin_user_id
	    };

	    var url_api_listaMsg = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listaMsgAdmin';

	    $.ajax({

	        type: 'POST',
	        url: url_api_listaMsg,
	        contentType: 'application/json',
	        data: JSON.stringify(dataRequest),
	        success: function(response) {

	            var dropdownMenuMensajes = document.getElementById('dropdownMenu_msg_id');
	            var contador_msg = document.getElementById('count_mensajes_admin_id');
	            contador_msg.textContent = response.count; 

	            dropdownMenuMensajes.innerHTML = '';

	            response.messages.forEach(function(msg) {

					//Conversión fecha----------------------------------------------------------------------------------------------------
	                var dateString = msg.Fecha;
					const year = dateString.substring(0, 4);
					const month = dateString.substring(4, 6);
					const day = dateString.substring(6, 8);
					const hour = dateString.substring(9, 11);
					const minute = dateString.substring(11, 13);

					const date = new Date(year, month - 1, day, hour, minute);
					var fecha = date.toLocaleString();
					//---------------------------------------------------------------------------------------------------------------------

	                var nombre_usuario = msg.userInfo.first_name;
	                var apellido_usuario = msg.userInfo.last_name;

	                //Crear el elemento del mensaje--------------------------------------------------------------------------------------
	                var msgElement = document.createElement('li');
	                var msgAnchor = document.createElement('a');
	                msgAnchor.className = 'dropdown-item';
	                msgAnchor.href = '#';
	                //---------------------------------------------------------------------------------------------------------------------

	                // Crear y añadir el icono del mensaje--------------------------------------------------------------------------------
	                var msgIcon = document.createElement('i');
	                msgIcon.className = msg.Estado == "Pendiente" ? 'bi bi-envelope-fill' : 'bi bi-envelope-open';
	                msgAnchor.appendChild(msgIcon);
	                //---------------------------------------------------------------------------------------------------------------------

	                //Añadir el nombre del usuario al mensaje------------------------------------------------------------------------------
	                msgAnchor.appendChild(document.createTextNode(` ${nombre_usuario} ${apellido_usuario}`));
	                //---------------------------------------------------------------------------------------------------------------------
	                
	                //Añadir la fecha al mensaje-----------------------------------------------------------------------------------------
	                var msgSmall = document.createElement('small');
	                msgSmall.textContent = ` - ${fecha}`;
	                msgAnchor.appendChild(msgSmall);
	                //---------------------------------------------------------------------------------------------------------------------

	                //Asignar la función onclick------------------------------------------------------------------------------------------
	                msgAnchor.onclick = function() {
	                    sessionStorage.setItem('msgActual', JSON.stringify(msg));
	                    cargarMensaje();
	                };
	                //---------------------------------------------------------------------------------------------------------------------

	                msgElement.appendChild(msgAnchor);
	                dropdownMenuMensajes.appendChild(msgElement);

	            });
	        },
	        error: function(error) {
	            console.error('Error al cargar los mensajes: ', error);
	        }
	    });
	});
}

function cargarPaginaFinca(finca) {

    var url_PagFinca = "https://tfm-app-icai.s3.eu-west-3.amazonaws.com/paginaFinca.html";
    sessionStorage.setItem('fincaActual', finca.ESTATE_ID);


    $.ajax({
        type: 'GET',
        url: url_PagFinca,
        success: function(response) {
            document.getElementById("contenido-ajax").innerHTML = response;
            document.getElementById("titulo_finca_id").innerHTML = finca.name;
            document.getElementById("dir_finca_id").innerHTML = finca.address;
            document.getElementById("reg_finca_id").innerHTML = finca.region;
            document.getElementById("cp_finca_id").innerHTML = finca.zip;

            var data = {
                "estate_id": finca.ESTATE_ID
            };
            var dataRequest = JSON.stringify(data);

            //CARGAR LISTADO DE EVENTOS-----------------------------------------------------------------------------------------------------------------------------------------------
            var url_api_listaEventos = "https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listaEventos";

            $.ajax({
            	type: 'POST',
            	url: url_api_listaEventos,
            	contentType: 'application/json',
            	data: dataRequest,
            	success: function(response) {

            		var contenedor_eventos = document.getElementById('div_listaEventos_id');
            		var contador_eventos = document.getElementById('count_eventos_id');
            		contador_eventos.innerHTML = response.count;
                    contenedor_eventos.innerHTML = '';
                    contenedor_eventos.style.marginTop = '10px';

                    response.futureEvents.forEach(function(evento){

                    	var startDate_epoch = evento.Start*1000;
						var endDate_epoch = evento.End*1000;

						var startDate = new Date(startDate_epoch).toLocaleDateString("es-ES", {
					        year: 'numeric', month: '2-digit', day: '2-digit',
					        hour: '2-digit', minute: '2-digit', 
					        hour12: false
					    });

					    var endDate = new Date(endDate_epoch).toLocaleDateString("es-ES", {
					        year: 'numeric', month: '2-digit', day: '2-digit',
					        hour: '2-digit', minute: '2-digit', 
					        hour12: false
					    });

                        var eventItem = document.createElement('a');
                        eventItem.className = 'list-group-item list-group-item-action';
                        var evtTitle = document.createElement('h5');
                        evtTitle.innerHTML += evento.Titulo;
						var evtFechaStart = document.createElement('p');
						evtFechaStart.innerHTML="<strong>Fecha inicio:</strong> "+startDate;
						var evtFechaEnd = document.createElement('p');
						evtFechaEnd.innerHTML="<strong>Fecha inicio:</strong> "+endDate;


                        eventItem.href = '#';
                        eventItem.appendChild(evtTitle);
                        eventItem.appendChild(evtFechaStart);
                        eventItem.appendChild(evtFechaEnd);

                        eventItem.onclick = function(){
                        	sessionStorage.setItem('evtActual', JSON.stringify(evento));
                        	cargarInfoEvento();
                        }

                        contenedor_eventos.appendChild(eventItem);

                    });
            	},
            	error: function(response){
            		console.log(response);
                    console.error(response.responseText);
            	}

            });
            //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

            //CARGAR LISTADO DE ENCUESTAS-------------------------------------------------------------------------------------------------------------------------------------------------
            var url_api_listaEncuestas = "https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listEncuestas";

            $.ajax({
            	type: 'POST',
            	url: url_api_listaEncuestas,
            	contentType: 'application/json',
            	data: dataRequest,
            	success: function(response){
            		var contenedor_enc = document.getElementById('div_listaEncuestas_id');
            		var contador_enc = document.getElementById('count_encuestas_id');
            		contador_enc.innerHTML = response.count;
                    contenedor_enc.innerHTML = '';
                    contenedor_enc.style.marginTop = '10px';

                    response.encuestas.forEach(function(enc){
						var creationDate_epoch = enc.FechaCreacion*1000;
						var ttlDate_epoch = enc.FechaTTL*1000;

						var creationDate = new Date(creationDate_epoch).toLocaleDateString("es-ES", {
					        year: 'numeric', month: '2-digit', day: '2-digit',
					        hour: '2-digit', minute: '2-digit', second: '2-digit',
					        hour12: false
					    });

					    var ttlDate = new Date(ttlDate_epoch).toLocaleDateString("es-ES", {
					        year: 'numeric', month: '2-digit', day: '2-digit',
					        hour: '2-digit', minute: '2-digit', second: '2-digit',
					        hour12: false
					    });


					    var fechaActual = new Date();
					    var fechaActual_epoch = Math.floor(fechaActual.getTime()/1000);

					    var diferencia = ttlDate_epoch - fechaActual_epoch*1000;
					    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

					    var motivo = enc.Motivo;
					   
                        var encItem = document.createElement('a');
                        encItem.className = 'list-group-item list-group-item-action';
                        encItem.href = '#';

                    
						var encTitle = document.createElement('h5');
						var enc_tiempoRestante = document.createElement('p');
						enc_tiempoRestante.style.color = 'red'; 
						if(dias!=0)
						{
							enc_tiempoRestante.innerHTML="Esta encuesta caduca en "+dias+" días";
						}else{
							enc_tiempoRestante.innerHTML="Esta encuesta caduca hoy";
						}						
						
						encTitle.innerHTML += motivo;

                        encItem.appendChild(encTitle);
                        encItem.appendChild(enc_tiempoRestante);

                        encItem.onclick = function(){
                        	//cargarMensaje(msg);
                        	
                        	sessionStorage.setItem('encActual', JSON.stringify(enc));
                        	//CONTROL------
                        	console.log(enc);
                        	//-------------
                        	cargarInfoEncuesta();
 
                        }
    
                        contenedor_enc.appendChild(encItem);

                    });

            	},
            	error: function(response){
            		console.log(response);
                    console.error(response.responseText);

            	}

            });
			//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

            //CARGAR LISTADO DE PROPIEDADES-----------------------------------------------------------------------------------------------------------------------------------------------

            var url_api_listaProp = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listadoPropiedades';

            $.ajax({
                type: 'POST',
                url: url_api_listaProp,
                contentType: 'application/json',
                data: dataRequest,
                success: function(response) {
                    var contenedor = document.getElementById('div_listaProp_id');
                    contenedor.innerHTML = '';
                    contenedor.style.marginTop = '30px';

                    response.forEach(function(prop) {

                    	var accordionItem = document.createElement('div');
    					accordionItem.className = 'accordion accordion-flush';

    					var accordionHeader = document.createElement('h2');
    					accordionHeader.className = 'accordion-header';
    					accordionHeader.id = 'heading' + prop.PROPERTY_ID;

					    var accordionButton = document.createElement('button');
					    accordionButton.className = 'accordion-button collapsed';
					    accordionButton.setAttribute('type', 'button');
					    accordionButton.setAttribute('data-bs-toggle', 'collapse');
					    accordionButton.setAttribute('data-bs-target', '#collapse' + prop.PROPERTY_ID);
					    accordionButton.setAttribute('aria-expanded', 'true');
					    accordionButton.setAttribute('aria-controls', 'collapse' + prop.PROPERTY_ID);
					    accordionButton.innerHTML = '<h6>Propiedad ' + prop.Piso + prop.Num + '</h6>';

					    var accordionCollapse = document.createElement('div');
					    accordionCollapse.id = 'collapse' + prop.PROPERTY_ID;
					    accordionCollapse.className = 'accordion-collapse collapse';
					    accordionCollapse.setAttribute('aria-labelledby', 'heading' + prop.PROPERTY_ID);
					    accordionCollapse.setAttribute('data-bs-parent', '#accordionParent');


					    var accordionBody = document.createElement('div');
					    accordionBody.className = 'accordion-body d-flex justify-content-between align-items-center';

    					var propertyInfoContainer = document.createElement('div');
					    
					    var descriptionInfo = document.createElement('p');
					    //descriptionInfo.innerHTML = '<strong>Tipo: </strong>' + prop.Type; 
					    descriptionInfo.innerHTML = `

                        <strong>Tipo:</strong> ${prop.Type}<br>
                        <strong>Descripción:</strong> ${prop.Description}<br>
                        <strong>Share:</strong> ${prop.Share}%<br>
                        <strong>IBAN:</strong> ${prop.IBAN}
                        
                    	`;

					    propertyInfoContainer.appendChild(descriptionInfo);
					  
					    
					    accordionBody.appendChild(propertyInfoContainer);

    					var inviteButtonContainer = document.createElement('div');

					    var iconAddUser = document.createElement('i');
					    iconAddUser.className = 'bi bi-person-add';

					    var botonInvite = document.createElement('button');
					    botonInvite.className = 'btn btn-secondary align-self-center dropdown-toggle';
					    botonInvite.setAttribute('data-bs-toggle', 'dropdown');
					    botonInvite.setAttribute('aria-expanded', 'false');
					    botonInvite.appendChild(iconAddUser);

					    var dropdownMenu = document.createElement('ul');
					    dropdownMenu.className = 'dropdown-menu';
					    dropdownMenu.setAttribute('aria-labelledby', 'dropdownMenuButton');

					    var dropdownItem1 = document.createElement('li');
					    var dropdownLink1 = document.createElement('a');
					    dropdownLink1.className = 'dropdown-item';
					    dropdownLink1.href = '#';
					    dropdownLink1.textContent = 'Añadir Usuario Existente';
					    dropdownLink1.onclick = function() {
					        sessionStorage.setItem('propiedadActual', prop.PROPERTY_ID);
					        cargarBuscadorUsuario();
					    };

					    var dropdownItem2 = document.createElement('li');
					    var dropdownLink2 = document.createElement('a');
					    dropdownLink2.className = 'dropdown-item';
					    dropdownLink2.href = '#';
					    dropdownLink2.textContent = 'Invitar Nuevo Usuario';
					    dropdownLink2.onclick = function() {
					        sessionStorage.setItem('propiedadActual', prop.PROPERTY_ID);
					        cargarFormularioInvitacion();
					    };

					    dropdownItem1.appendChild(dropdownLink1);
					    dropdownMenu.appendChild(dropdownItem1);
					    dropdownItem2.appendChild(dropdownLink2);
					    dropdownMenu.appendChild(dropdownItem2);

					    botonInvite.appendChild(dropdownMenu);
					    inviteButtonContainer.appendChild(botonInvite);

					    accordionBody.appendChild(inviteButtonContainer);

					    accordionHeader.appendChild(accordionButton);
					    accordionCollapse.appendChild(accordionBody);
					    accordionItem.appendChild(accordionHeader);
					    accordionItem.appendChild(accordionCollapse);

					    contenedor.appendChild(accordionItem);

                    });
                },
                error: function(response) {
                    console.log(response);
                    console.error(response.responseText);
                }
            });
			//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

			//CARGAR LISTADO DE DOCUMENTOS------------------------------------------------------------------------------------------------------------------------------------------------

			
			var url_api_listaDocs='https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listDocs';

			$.ajax({

				type: 'POST',
                url: url_api_listaDocs,
                contentType: 'application/json',
                data: dataRequest,
                success: function(response){
                	var contenedor_2 = document.getElementById('div_listaDocs_id');
                    contenedor_2.innerHTML = '';
                    contenedor_2.style.marginTop = '30px';

                    response.forEach(function(doc) {
                        var elementoLista_2 = document.createElement('div');
                        elementoLista_2.className = 'list-group-item d-flex justify-content-between'; 
                        elementoLista_2.style.borderBottom = '1px solid #eaeaea';
                        elementoLista_2.style.paddingBottom = '5px';
                        elementoLista_2.style.marginBottom = '5px';

                        var textContainer_2 = document.createElement('div');
                        textContainer_2.className = 'me-auto'; 
                        var nombre_file_div = document.createElement('div');
                        nombre_file_div.innerHTML = "<strong>Nombre:</strong> " + doc.fileName;
                        textContainer_2.appendChild(nombre_file_div);

                        var ult_mod_div = document.createElement('div');
                        ult_mod_div.innerHTML = "<strong>Fecha de subida:</strong> " + doc.LastModified;
                        textContainer_2.appendChild(ult_mod_div);

                        elementoLista_2.appendChild(textContainer_2); 

                        var buttonsContainer = document.createElement('div'); 


			            var enlaceDownload = document.createElement('a');
			            var iconDownloadFile = document.createElement('i');
			            iconDownloadFile.className = 'bi bi-file-earmark-arrow-down';
			            enlaceDownload.className = 'btn btn-secondary btn-sm';
			            enlaceDownload.innerHTML = 'Descargar ';
			            enlaceDownload.href = '#';
			            var ruta = doc.Key;
			            enlaceDownload.appendChild(iconDownloadFile);
			            enlaceDownload.setAttribute('data-key', ruta); 
                       
						enlaceDownload.onclick = function(event) {
						    event.preventDefault(); 
						    var archivoKey = this.getAttribute('data-key'); 
						    
						    $.ajax({
						        method: 'POST',
						        url: 'https://jaj6pl44sf.execute-api.eu-west-3.amazonaws.com/dev',
						        contentType: 'application/json',
						        data: JSON.stringify({ key: archivoKey }),
						        success: function(response) {

						        	var newTab = window.open(response.urlPreFirmada, '_blank');
							        if (newTab) {
							            newTab.focus();
							        } else {
							            alert('Por favor, desactiva el bloqueador de ventanas emergentes para descargar el archivo.');
							        }
						        },
						        error: function(xhr, status, error) {
						            console.error('Error al solicitar la URL pre-firmada: ', error);
						        }
						    });
						};
						buttonsContainer.appendChild(enlaceDownload); 
            			elementoLista_2.appendChild(buttonsContainer); 
						contenedor_2.appendChild(elementoLista_2);

                    });
                },
                error: function(response){
                	console.log(response);
                    console.error(response.responseText);
                }

			});	
			//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------				
        },
        error: function(response) {
            console.log(response);
            alert(response.responseText);
        }
    });
	
}


function cargarListadoPropiedades_Users() {

    restoreCognitoSession_Users(function() {

        var user_id = sub_user.getValue();
        sessionStorage.setItem('userActual', user_id);
        var data = {
            "user_id": user_id
        };

        var dataRequest = JSON.stringify(data);

        var url_listPropUser = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listadoPropiedades_Users';

        $.ajax({
            type: 'POST',
            url: url_listPropUser,
            contentType: 'application/json',
            data: dataRequest,
            success: function(response) {
                var contenedor = document.getElementById('contenido-ajax');
                contenedor.innerHTML = '';

                response.forEach(function(prop, index) {
                    // Creación de la tarjeta de la finca
                    var card = document.createElement('div');
                    card.className = 'card';
                    card.style.marginBottom = '10px';
                    contenedor.appendChild(card);

                    var cardBody = document.createElement('div');
                    cardBody.className = 'card-body';
                    card.appendChild(cardBody);

                    var fincaTitle = document.createElement('h4');
                    fincaTitle.className = 'card-title';
                    if(!prop.Piso){
                    	fincaTitle.textContent = `${prop.EstateDetails.name} - ${prop.Num}`;
                    }
                    else{
                    	fincaTitle.textContent = `${prop.EstateDetails.name} - ${prop.Piso}º${prop.Num}`;
	                 }
                    
                    cardBody.appendChild(fincaTitle);

                    var admin_info_div = document.createElement('div');
                    admin_info_div.className = 'd-flex justify-content-between align-items-center';

                    //Info del Admin y contactar-----------------------------------------------------------------------------------------------------------------
                    var admin_name_div = document.createElement('div');
                    //admin_info.innerHTML=prop.EstateDetails.adminEmail;
                    var admin_info = document.createElement('h7');
                    admin_info.innerHTML= '<strong>Administrador: </strong>' + prop.EstateDetails.adminFirstName + ' ' + prop.EstateDetails.adminLastName;
                    admin_name_div.appendChild(admin_info);

                    var admin_contact_button_div = document.createElement('div');
                    var contact_button = document.createElement('button');
                    var contact_icon = document.createElement('i');
                    contact_icon.className = 'bi bi-envelope';
                    contact_button.innerHTML = 'Contactar   ';
                    contact_button.className = 'btn btn-secondary align-self-center';
                    contact_button.appendChild(contact_icon);

                    contact_button.onclick = function(){
                    	sessionStorage.setItem('usuarioActual', user_id);
                    	sessionStorage.setItem('fincaActual', prop.EstateDetails.ESTATE_ID);
                    	sessionStorage.setItem('propiedadActual', prop.PROPERTY_ID);
                    	sessionStorage.setItem('adminActual', prop.EstateDetails.adminID);
                    	cargarContactAdmin();
                    }

                    admin_contact_button_div.appendChild(contact_button);

                    admin_info_div.appendChild(admin_name_div);
                    admin_info_div.appendChild(admin_contact_button_div);

                    cardBody.appendChild(admin_info_div);
                    //------------------------------------------------------------------------------------------------------------------------------------------

                   	//Botones eventos y mensajes---------------------------------------------------------------------------------------------------------------

                    //----Eventos-----------------------------------------------------
					var row_msg_evt = document.createElement('div');
					row_msg_evt.className = 'row mt-3';

					var colEventos = document.createElement('div');
					colEventos.className = 'col-6';

					var btnEventos = document.createElement('button');
					btnEventos.className = 'btn btn-outline-secondary w-100';
					btnEventos.setAttribute('type', 'button');
					btnEventos.setAttribute('data-bs-toggle', 'collapse');
					btnEventos.setAttribute('data-bs-target', `#div_listaEventos_id${index}`);
					btnEventos.textContent = 'Próximos Eventos ';

					var badgeEventos = document.createElement('span');
					badgeEventos.className = 'badge text-bg-secondary rounded-pill';
					badgeEventos.id = `count_eventos_id${index}`;					
					btnEventos.appendChild(badgeEventos);

					var divListaEventos = document.createElement('div');
					divListaEventos.id = `div_listaEventos_id${index}`;
					divListaEventos.className = 'collapse overflow-auto';
					divListaEventos.style.maxHeight = '500px';

					colEventos.appendChild(btnEventos);
					colEventos.appendChild(divListaEventos);
					//---------------------------------------------------------------

					//----Encuestas--------------------------------------------------
					var colEnc = document.createElement('div');
					colEnc.className = 'col-6';
					
					var btnEnc = document.createElement('button');
					btnEnc.className = 'btn btn-outline-secondary w-100';
					btnEnc.setAttribute('type', 'button');
					btnEnc.setAttribute('data-bs-toggle', 'collapse');
					btnEnc.setAttribute('data-bs-target', `#div_listaEnc_id${index}`);
					btnEnc.textContent = 'Encuestas Activas ';
					
					var badgeEnc = document.createElement('span');
					badgeEnc.className = 'badge text-bg-secondary rounded-pill';
					badgeEnc.id = `count_enc_id${index}`;					
					btnEnc.appendChild(badgeEnc);
					
					var divListaEnc = document.createElement('div');
					divListaEnc.id = `div_listaEnc_id${index}`;
					divListaEnc.className = 'collapse overflow-auto';
					divListaEnc.style.maxHeight = '500px';
		
					colEnc.appendChild(btnEnc);
					colEnc.appendChild(divListaEnc);
					//---------------------------------------------------------------

					row_msg_evt.appendChild(colEventos);
					row_msg_evt.appendChild(colEnc);
					cardBody.appendChild(row_msg_evt);
					
					var data = {
		                "estate_id": prop.EstateDetails.ESTATE_ID
		            };

		            var dataRequest = JSON.stringify(data);

		            //Listado de eventos-----------------------------------------------------------------------------------------------------
					var url_api_listaEventos = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listaEventos';

		            $.ajax({
		            	type: 'POST',
		            	url: url_api_listaEventos,
		            	contentType: 'application/json',
		            	data: dataRequest,
		            	success: function(response) {
		            		var contenedor_eventos = document.getElementById(`div_listaEventos_id${index}`);
		            		var contador_eventos = document.getElementById(`count_eventos_id${index}`);
		            		contador_eventos.innerHTML = response.count;
		                    contenedor_eventos.innerHTML = '';
		                    contenedor_eventos.style.marginTop = '10px';

		                    response.futureEvents.forEach(function(evento){
		                    	var startDate_epoch = evento.Start*1000;
								var endDate_epoch = evento.End*1000;

								var startDate = new Date(startDate_epoch).toLocaleDateString("es-ES", {
							        year: 'numeric', month: '2-digit', day: '2-digit',
							        hour: '2-digit', minute: '2-digit', 
							        hour12: false
							    });

							    var endDate = new Date(endDate_epoch).toLocaleDateString("es-ES", {
							        year: 'numeric', month: '2-digit', day: '2-digit',
							        hour: '2-digit', minute: '2-digit', 
							        hour12: false
					    		});

		                        var eventItem = document.createElement('a');
		                        eventItem.className = 'list-group-item list-group-item-action';
		                        eventItem.href = '#';

		                        var evtTitle = document.createElement('h5');
                        		evtTitle.innerHTML += evento.Titulo;

								var evtFechaStart = document.createElement('p');
								evtFechaStart.innerHTML="<strong>Fecha:</strong> "+startDate;
								var evtFechaEnd = document.createElement('p');
								evtFechaEnd.innerHTML="<strong>Fecha:</strong> "+endDate;
								eventItem.appendChild(evtTitle);
                        		eventItem.appendChild(evtFechaStart);
                        		eventItem.appendChild(evtFechaEnd);

                        		var eventResponse = document.createElement('p');

                        		const invitados = evento.Invitados;

                        		if (invitados.hasOwnProperty(user_id)) {
								    const datosInv = invitados[user_id];
								    const asistencia = datosInv.asistencia || 'No disponible';
								    if (asistencia === 'Sin confirmar') {
								      //CONTROL---------	
								      console.log(`Sin confirmar`);
								      //--------
								      
								      eventResponse.style.color = 'red';
								      eventResponse.style.fontWeight = 'bold';
								      eventResponse.innerHTML="Asistencia pendiente de confirmar";

								    } else {
								       //CONTROL------	
								      console.log(`El voto del encuestado con ID ${user_id} es: ${asistencia}`);
								      //-------
								      
								      eventResponse.style.fontWeight = 'bold';
								      eventResponse.innerHTML="Su respuesta: "+asistencia;
								    }
								  } else {
								    console.log(`El encuestado con ID ${user_id} no se encontró en el mapa.`);
								}

								eventItem.appendChild(eventResponse);

                        		eventItem.onclick = function(){
                        			sessionStorage.setItem('eventoActual', JSON.stringify(evento));
                        			sessionStorage.setItem('evtActual', JSON.stringify(evento));
                        			cargarInfoEvento_User();

                        		}

		                        contenedor_eventos.appendChild(eventItem);

		                    });
		            	},
		            	error: function(response){
		            		console.log(response);
		                    console.error(response.responseText);
		            	}

		            });
					//------------------------------------------------------------------------------------------------------------------------------

		            //Lista encuestas---------------------------------------------------------------------------------------------------------------

		            var url_api_listaEncuestas = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listEncuestas'
		            $.ajax({
		            	type: 'POST',
		            	url: url_api_listaEncuestas,
		            	contentType: 'application/json',
		            	data: dataRequest,
		            	success: function(response){
		            		var contenedor_enc = document.getElementById(`div_listaEnc_id${index}`);
		            		var contador_enc = document.getElementById(`count_enc_id${index}`);
		            		contador_enc.innerHTML = response.count;
		                    contenedor_enc.innerHTML = '';
		                    contenedor_enc.style.marginTop = '10px';

		                    response.encuestas.forEach(function(enc){

							    var motivo = enc.Motivo;
		                        var encItem = document.createElement('a');
		                        encItem.className = 'list-group-item list-group-item-action';
		                        encItem.href = '#';

								var encTitle = document.createElement('h6');

								var creationDate_epoch = enc.FechaCreacion*1000;
								var ttlDate_epoch = enc.FechaTTL*1000;

								var creationDate = new Date(creationDate_epoch).toLocaleDateString("es-ES", {
							        year: 'numeric', month: '2-digit', day: '2-digit',
							        hour: '2-digit', minute: '2-digit', second: '2-digit',
							        hour12: false
							    });

							    var ttlDate = new Date(ttlDate_epoch).toLocaleDateString("es-ES", {
							        year: 'numeric', month: '2-digit', day: '2-digit',
							        hour: '2-digit', minute: '2-digit', second: '2-digit',
							        hour12: false
							    });


							    var fechaActual = new Date();
							    var fechaActual_epoch = Math.floor(fechaActual.getTime()/1000);

							    var diferencia = ttlDate_epoch - fechaActual_epoch*1000;
							    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

							    var motivo = enc.Motivo;
							   
		                        var encItem = document.createElement('a');
		                        encItem.className = 'list-group-item list-group-item-action';
		                        encItem.href = '#';

		                    
								var encTitle = document.createElement('h5');
								var enc_tiempoRestante = document.createElement('p');
								
								if(dias!=0){
									enc_tiempoRestante.innerHTML="Esta encuesta caduca en "+dias+" días";
								}else{
									enc_tiempoRestante.innerHTML="Esta encuesta caduca en hoy";
								}

								var encVoto = document.createElement('p');
								


								//-----------------
								const encuestados = enc.Encuestados;

								if (encuestados.hasOwnProperty(user_id)) {
								    const datos = encuestados[user_id];
								    const voto = datos.voto || 'No disponible';
								    if (voto === 'NSNC') {
								      //CONTROL---------	
								      console.log(`El voto del encuestado con ID ${user_id} es NSNC.`);
								      //--------
								      enc_tiempoRestante.style.color = 'red';
								      encVoto.style.color = 'red';
								      encVoto.style.fontWeight = 'bold';
								      encVoto.innerHTML="Usted aún no ha votado";

								    } else {
								       //CONTROL------	
								      console.log(`El voto del encuestado con ID ${user_id} es: ${voto}`);
								      //-------
								      //encVoto.style.color = 'green';
								      enc_tiempoRestante.style.color = 'red';
								      encVoto.style.fontWeight = 'bold';
								      encVoto.innerHTML="Usted ha votado: "+voto;
								    }
								  } else {
								    console.log(`El encuestado con ID ${user_id} no se encontró en el mapa.`);
								}

								//----------------

								encTitle.innerHTML += motivo;

		                        encItem.appendChild(encTitle);
		                        encItem.appendChild(enc_tiempoRestante);
		                        encItem.appendChild(encVoto);

		                        encItem.onclick = function(){
		                        	//cargarMensaje(msg);
		                        	sessionStorage.setItem('encActual', JSON.stringify(enc));
		                        	console.log(enc);
		                        	//cargarInfoEncuesta();
		                        	cargarInfoEncuesta_User();
		 
		                        }
		    
		                        contenedor_enc.appendChild(encItem);


		                    });

		            	},
		            	error: function(response){
		            		console.log(response);
		                    console.error(response.responseText);

		            	}

		            });
					//-----------------------------------------------------------------------------------------------------------------------------

                    // Creación y adición del botón de Información de la Finca---------------------------------------------------------------------
                    var infoButton = document.createElement('button');
                    infoButton.className = 'btn btn-outline-secondary mt-3 w-100';
                    infoButton.type = 'button';
                    infoButton.setAttribute('data-bs-toggle', 'collapse');
                    infoButton.setAttribute('data-bs-target', `#infoFinca${index}`);
                    infoButton.textContent = 'Información de la Finca';
                    cardBody.appendChild(infoButton);

                    var infoCollapse = document.createElement('div');
                    infoCollapse.id = `infoFinca${index}`;
                    infoCollapse.className = 'collapse';
                    cardBody.appendChild(infoCollapse);

                    var infoBody = document.createElement('div');
                    infoBody.className = 'card-body';
                    infoBody.innerHTML = `
                        <strong>Dirección:</strong> ${prop.EstateDetails.address}<br>
                        <strong>Ciudad:</strong> ${prop.EstateDetails.city}<br>
                        <strong>Tipo:</strong> ${prop.Type}<br>
                        <strong>Descripción:</strong> ${prop.Description}<br>
                        <strong>Share:</strong> ${prop.Share}%<br>
                        <strong>IBAN:</strong> ${prop.IBAN}
                        
                    `;
                    infoCollapse.appendChild(infoBody);
                    //-------------------------------------------------------------------------------------------------------------------------------

                    // Creación y adición del botón de Documentos Asociados--------------------------------------------------------------------------
                    var docsButton = document.createElement('button');
                    docsButton.className = 'btn btn-outline-secondary mt-3 w-100';
                    docsButton.type = 'button';
                    docsButton.setAttribute('data-bs-toggle', 'collapse');
                    docsButton.setAttribute('data-bs-target', `#docsFinca${index}`);
                    docsButton.textContent = 'Documentos Asociados';
                    cardBody.appendChild(docsButton);

                    var docsCollapse = document.createElement('div');
                    docsCollapse.id = `docsFinca${index}`;
                    docsCollapse.className = 'collapse';
                    cardBody.appendChild(docsCollapse);

                    var docsList = document.createElement('div');
                    docsList.className = 'p-3';
                    docsCollapse.appendChild(docsList);
                    //-------------------------------------------------------------------------------------------------------------------------------

                    //Cargar listado documentos-------------------------------------------------------------------------------------------------------
                    var data_2 = {
		                "estate_id": prop.EstateDetails.ESTATE_ID
		            };

		            var url_listaDocs = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listDocs';

		            var dataRequest_2 = JSON.stringify(data_2);
                    $.ajax({
                        type: 'POST',
                        url: url_listaDocs,
                        contentType: 'application/json',
                        data: dataRequest_2, 
                        success: function(docsResponse) {
                        	var contenedor_2 = document.createElement('div');
                    		contenedor_2.innerHTML = '';
                    		contenedor_2.style.marginTop = '30px';
                            
                            docsResponse.forEach(function(doc) {
                            	//Creación de la lista de documentos
                                var docItem = document.createElement('a');
                                docItem.className = 'list-group-item list-group-item-action';
                                docItem.textContent = doc.fileName;
                                docItem.href = '#';
                                docItem.setAttribute('data-key', doc.Key);
                                docItem.onclick = function(event) {
                                    event.preventDefault();
                                    var archivoKey = this.getAttribute('data-key');
                                    // Solicitar la URL pre-firmada
									    $.ajax({
									        method: 'POST',
									        url: 'https://jaj6pl44sf.execute-api.eu-west-3.amazonaws.com/dev',
									        contentType: 'application/json',
									        data: JSON.stringify({ key: archivoKey }),
									        success: function(response) {

									        	var newTab = window.open(response.urlPreFirmada, '_blank');

										
										        if (newTab) {
										            newTab.focus();
										        } else {
										            
										            alert('Por favor, desactiva el bloqueador de ventanas emergentes para descargar el archivo.');
										        }
									        },
									        error: function(xhr, status, error) {
									            console.error('Error al solicitar la URL pre-firmada: ', error);
									    }
									});
                                };
                                docsList.appendChild(docItem);
                            });
                        },
                        error: function(xhr, status, error) {
                            console.error('Error al cargar los documentos:', error);
                        }
                    });
                });
				//------------------------------------------------------------------------------------------------------------------------------------
            },
            error: function(xhr, status, error) {
                console.error('Error al cargar las propiedades:', error);
            }
        });
    });
}


