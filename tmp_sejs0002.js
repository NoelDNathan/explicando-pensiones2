// /////////////////////////////////////////////////////////////////
// FUNCIONES SOBRE CADENAS DE TEXTO
// /////////////////////////////////////////////////////////////////
// Función que devuelve una cadena de longitud "long", con valor "valor" y ceros a la izquieda
 function ponCeros(valor, long){
 	resul = valor.toString().substring(valor.length-long);
 	while(resul.length < long ){
 		resul = "0" + resul;
 	}
 	return resul;			 	 	  
}
	
//Función trim
function trim(cadena)
{
	for(i=0; i<cadena.length; )
	{
		if(cadena.charAt(i)==" ")
			cadena=cadena.substring(i+1, cadena.length);
		else
			break;
	}

	for(i=cadena.length-1; i>=0; i=cadena.length-1)
	{
		if(cadena.charAt(i)==" ")
			cadena=cadena.substring(0,i);
		else
			break;
	}
	
  return cadena;
} 

	// Función para validar que una cadena no contenga caracteres extraños
	function isAlfaNumerico(cad){
		cad = trim(cad);
		if(cad == '.') return false;
		var filter = /^[a-z0-9_\-\.\,\ \á\é\í\ó\ú\[\]\(\)]+$/i;
		return filter.test(cad);
	}
	
	// Función para validar que una cadena sólo contien letras
	function isLetras(cad){
		var filter = /^[a-z]+$/i;
		return filter.test(trim(cad));
	}
	
	// Función para validar que una cadena es válida como nombre de usuario
	function isAlfaCompact(cad){
		cad = trim(cad);
		if(cad == '.') return false;
		var filter = /^[a-z0-9_\-\.\,\á\é\í\ó\ú\[\]\(\)]+$/i;
		return filter.test(cad);
	}
	
	// Función para validar que una cadena es válida como password
	function isPassword(cad){
		cad = trim(cad);
		if(cad == '.') return false;
		var filter = /^[a-z0-9_\-\.\,\á\é\í\ó\ú\[\]\(\)]+$/i;
		return filter.test(cad);
	}


// /////////////////////////////////////////////////////////////////
// FUNCIONES NUMÉRICAS
// /////////////////////////////////////////////////////////////////

// Función que comprueba que un valor pasado es entero
 function isEntero(valor){
 	return ( !isNaN(parseInt(valor, 10)) && !isNaN(valor) && (valor.indexOf(".")<0) );
}

 function isOrden(valor){
 	if (!isEntero(valor)) return false;
 	return (valor >= 0) ;
}


// /////////////////////////////////////////////////////////////////
// FUNCIONES SOBRE CAMPOS DEL FORMULARIO
// /////////////////////////////////////////////////////////////////

// Función que borra todas las opciones de un combo
 function vaciaCombo(combo, valor, descripcion){
  combo.length=0;
   if(valor!="" || descripcion!=""){
 	addCombo(combo, valor, descripcion, true);
 }
}
	 
// Funcion que añade una nueva opción a un combo
 function addCombo(combo, valor, descripcion, sel){
   var i = combo.length;
   combo.options[i]=new Option(descripcion,valor,0);
 	if(sel){
	 	combo[i].selected = true;
 	}
}
	 
// Funcion que selecciona un cambo según un valor
 function selCombo(combo, valor){
   for(i=0; i<combo.length; i++){
   	if(combo[i].value == valor){
   		combo[i].selected = true;
   		i = combo.length;
   	}
  }
}


// /////////////////////////////////////////////////////////////////
// FUNCIONES VISUALES
// /////////////////////////////////////////////////////////////////

	function redimensiona(){
		top.resizeIframe(document.body.scrollHeight) ;
	}
	
///////////////////////////////////////////////////////////////////
// FUNCION PARA EL DRILLDOWN
// /////////////////////////////////////////////////////////////////
	function submitir(anio)
{
	var urlActual = document.location.href;
  var urlNueva  = urlActual + '&ANIO='+anio + '&VAL_PER_INF='+'1'+'&VAL_PER_INF='+'2'+'&VAL_PER_INF='+'3'+
                                              '&VAL_PER_INF='+'4'+'&VAL_PER_INF='+'5'+'&VAL_PER_INF='+'6'+
                                              '&VAL_PER_INF='+'7'+'&VAL_PER_INF='+'8'+'&VAL_PER_INF='+'9'+
                                              '&VAL_PER_INF='+'10'+'&VAL_PER_INF='+'11'+'&VAL_PER_INF='+'12';
  // alert(urlNueva);
  document.location.href = urlNueva;
}
	
