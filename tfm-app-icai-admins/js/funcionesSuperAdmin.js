//REGISTRAR NUEVA EMPRESA ADMINISTRADORA
function regEmpresaAdmin(){
	//alert("Vamos a registrar una empresa de administradores");
	var nombre = document.getElementById('nombre_empresa_id').value;
	var telf = document.getElementById('phone_id').value;
	var email =document.getElementById('email_id').value;

	if(!nombre||!telf||!email){
        //Manejo de alerta
        document.getElementById("error_regEmpresa_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Por favor, rellene todos los campos";
        document.getElementById("error_regEmpresa_alert_id").style.display="inline";
        setTimeout(function() {
            document.getElementById("error_regEmpresa_alert_id").style.display = 'none';
        }, 5000); 
        return; //Detiene la ejecución de la función si falta algún dato

    }
    var empresa_id = generarIdEmpresa(nombre, 15);

    var data = {
		"nombre": nombre,
		"telf": telf,
		"email": email,
		"empresa_id": empresa_id
	};
	var dataToSend = JSON.stringify(data);

	//var url = "https://3f4prbxck6.execute-api.eu-west-3.amazonaws.com/dev";
	var url = "https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/registerEmpresa";

	$.ajax({
		type: 'POST',
		url: url,
		dataType:'json',
		contentType:'application/json',
		data: dataToSend,
		success: function(response){
			//Manejo de alerta
            document.getElementById("regEmpresa_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Registrado correctamente";
            document.getElementById("regEmpresa_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("regEmpresa_OK_alert_id").style.display = 'none';
            }, 5000);
            cargarPaginaInicioAdmin();

		},
		error: function(error){
			//Manejo de alerta
	        document.getElementById("error_regEmpresa_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error, por favor intentelo más tarde";
	        document.getElementById("error_regEmpresa_alert_id").style.display="inline";
	        setTimeout(function() {
	            document.getElementById("error_regEmpresa_alert_id").style.display = 'none';
	        }, 5000); 
		}
	});
}

function generarIdEmpresa(nombre_empresa, l){

	var nombre_simple = nombre_empresa.replace(/\s+/g, ''); //quitar espacios
	var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	var comb = nombre_simple + caracteres;
	var result = '';


	/*for(let i = 0; i<l; i++){
		const i_aleatorio = Math.floor(Math.random()*comb.length);
		result += nombre_simple.charAt(i_aleatorio);
	}*/

	while (result.length < l) {
        const j = Math.floor(Math.random() * comb.length);
        result += comb.charAt(j);
    }

    if (result.length > l) {
        result = result.substring(0, l);
    }

	return result;

}

//MENSAJE A EMPRESA ADMINISTRADORA
function contactarEmpresa(){
	var asunto = document.getElementById('titulo_mensaje_id').value;
	var msg = document.getElementById('contenido_mensaje_id').value;
	var admin_id = sessionStorage.getItem('empresaActual');

	var data = {
		"asunto": asunto,
		"msg": msg, 
		"admin_id": admin_id
	}
	//var url = "https://owr3arlfe6.execute-api.eu-west-3.amazonaws.com/dev";
	var url = "https://8grvzt4bs5.execute-api.eu-west-3.amazonaws.com/dev/contactEmpresa";

	$.ajax({
		url: url,
		type:'POST',
		contentType: 'application/json',
		data: JSON.stringify(data),
		success: function(response){
			document.getElementById("mensaje_OK_alert_id").innerHTML = '<i class="bi bi-check-circle-fill"></i>'+" Mensaje enviado con éxito";
            document.getElementById("mensaje_OK_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("mensaje_OK_alert_id").style.display = 'none';
            }, 5000);
		},
		error: function(xhr, status, error){
			//CONTROL------------------
            console.error(error);
            //Manejo de alerta-----------------------------------------------------------------------------------------------------------------------------------------
            document.getElementById("error_mensaje_alert_id").innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i>'+" Error al enviar mensaje, inténtelo más tarde";
            document.getElementById("error_mensaje_alert_id").style.display="inline";
            setTimeout(function() {
                document.getElementById("error_mensaje_alert_id").style.display = 'none';
            }, 5000);
            //--------------------------------------------------------------------------------------------------------------------------------------------------------

		}
	});

}
