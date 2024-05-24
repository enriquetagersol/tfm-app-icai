
//FORMULARIO PARA REGISTRAR EMPRESA ADMINISTRADORA
function cargarFormularioRegAdmin(){
	var url_FormReg = 'https://tfm-app-icai-admins.s3.eu-west-3.amazonaws.com/registerEmpresa.html';
	$.ajax({
	    type : 'GET',
	    url : url_FormReg,
	    success: function(response)
	    {
			document.getElementById("modal_RegAdminEmpresa_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_RegAdminEmpresa_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });
}

//FORMULARIO PARA REGISTRAR SUPERADMIN
function cargarFormularioRegSuperAdmin(){
	var url_Form = 'https://tfm-app-icai-admins.s3.eu-west-3.amazonaws.com/registerSuperAdmin.html';
	$.ajax({
	    type : 'GET',
	    url : url_Form,
	    success: function(response)
	    {
			document.getElementById("modal_RegSuperAdmin_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_RegSuperAdmin_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });

}


//FORMULARIO PARA ASIGNAR ADMIN A EMPRESA
function cargarFormularioAssignAdmin(){
	var url_Form = 'https://tfm-app-icai-admins.s3.eu-west-3.amazonaws.com/registerAdmin.html';
	$.ajax({
	    type : 'GET',
	    url : url_Form,
	    success: function(response)
	    {
			document.getElementById("modal_assignAdmin_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_assignAdmin_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });
}

//FORMULARIO PARA CONTACTAR EMPRESA
function cargarFormularioMensaje(){
	var url_Form = 'https://tfm-app-icai-admins.s3.eu-west-3.amazonaws.com/contactarEmpresa.html';
	$.ajax({
	    type : 'GET',
	    url : url_Form,
	    success: function(response)
	    {
			document.getElementById("modal_contactEmpresa_body_id").innerHTML=response;
			var modal = new bootstrap.Modal(document.getElementById('modal_contactEmpresa_id'));
    		modal.show();
		},
	    error:function(response)
	    {
	    	console.log(response);
	    	alert(response);
	    }
  });


}

function cargarPaginaInicioAdmin(){

	var url_Inicio = "https://tfm-app-icai-admins.s3.eu-west-3.amazonaws.com/inicioSuperAdmin.html";
	$.ajax({
		type: 'GET',
		url: url_Inicio,
		success: function(response){
			document.getElementById("contenido-ajax").innerHTML = response;

			//CARGAR LISTADO EMPRESAS-----------------------------------------------------------------------------------------------------------------------------------------------------------
			//var url_api_listEmpresas = 'https://13ixcoycb2.execute-api.eu-west-3.amazonaws.com/dev';
			var url_api_listEmpresas = 'https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/listEmpresas';
			$.ajax({
				type: 'POST',
				url: url_api_listEmpresas,
				//contentType: 'application/json',
				//data: dataRequest,
				success: function(response){
					var contenedor = document.getElementById('div_listEmpresas_id');
					contenedor.innerHTML = '';
					contenedor.style.marginTop = '30px';

					response.forEach(function(e){
						var elementoLista = document.createElement('div');
                        elementoLista.className = 'list-group-item d-flex justify-content-between'; // 'd-flex' y 'justify-content-between' para alinear los elementos
                        elementoLista.style.borderBottom = '1px solid #eaeaea';
                        elementoLista.style.paddingBottom = '5px';
                        elementoLista.style.marginBottom = '5px';

                        var textContainer = document.createElement('div'); // Contenedor para el texto
                        textContainer.className = 'me-auto'; // Alineación a la izquierda y margen a la derecha AÑADIDO
                        var nombre_empresa = document.createElement('div');
                        nombre_empresa.innerHTML = "<strong>Nombre:</strong> " + e.nombre;
                        textContainer.appendChild(nombre_empresa);

                        var telf = document.createElement('div');
                        telf.innerHTML = "<strong>Teléfono:</strong> " + e.telf;
                        textContainer.appendChild(telf);

                        var email = document.createElement('div');
                        email.innerHTML = "<strong>Email:</strong> " + e.email;
                        textContainer.appendChild(email);

                        elementoLista.appendChild(textContainer); 

                        var buttonsContainer = document.createElement('div');

                        var enlaceMail = document.createElement('a');
			            enlaceMail.className = 'btn btn-secondary btn-sm me-2';
			            enlaceMail.innerHTML = 'Enviar Mensaje ';
			            enlaceMail.href = '#';
			            enlaceMail.onclick = function(event) {
			                //alert('enviar mail');
			                sessionStorage.setItem('empresaActual', e.ADMIN_ID);
			                cargarFormularioMensaje();
			            }
			            var iconMail = document.createElement('i');
			            iconMail.className = 'bi bi-envelope';
			            enlaceMail.appendChild(iconMail);
			            buttonsContainer.appendChild(enlaceMail);

			            var enlaceAddAdmin= document.createElement('a');
			            var iconAddAdmin = document.createElement('i');
			            iconAddAdmin.className = 'bi bi-person-add';
			            enlaceAddAdmin.className = 'btn btn-secondary btn-sm';
			            enlaceAddAdmin.innerHTML = 'Asignar Administrador ';
			            enlaceAddAdmin.href = '#';
			            enlaceAddAdmin.appendChild(iconAddAdmin);
			            enlaceAddAdmin.onclick = function(event){
			            	//alert('agregar usuario administrador');
			            	sessionStorage.setItem('empresaActual', e.ADMIN_ID);
			            	cargarFormularioAssignAdmin();
			            }
			            buttonsContainer.appendChild(enlaceAddAdmin); 

            			elementoLista.appendChild(buttonsContainer); 
						contenedor.appendChild(elementoLista);
					});					

				},
				error: function(error){
					console.log(response);
                    console.error(response.responseText);
				}

			});

		},
		error: function(response){
			console.error(response);
		}
	})

}