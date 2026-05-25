/* Funciones exclusivas para el frontoffice */
/* Javascript deedicado exclusivamente al frontOffice.
funciones iniciales y otro tipo de funciones */


if("SI" == "!IBI.AMP.CLOSEEXT;"){
	alert("No se han encontrado registros que cumplan esos criterios.");
	window.open('','_self','');
	window.close();
}
		
function cargarCombos (verInforme)
{		
var formulario = document.getElementById ('form1'); 
document.getElementById ('INFORME').value = 'NO' ;
document.getElementById ('INFORME1').value = 'NO' ;
formulario.target='_self' ;
showModal();
formulario.submit ();
}

//funcion que alterna el ocultar/mostrar formulario de la pantalla principal de la aplicación. Viene de la función init.
function ocultar (id, id1, boton)
{
	var o_html = document.getElementById(id);
        var inform = document.getElementById(id1);

	if (o_html.style.display == 'none')
	{

  	     boton.innerHTML = 'Ocultar los criterios de búsqueda';
	     o_html.style.display = '';
             inform.style.display = 'none';

	}else{
  	     boton.innerHTML = 'Volver a criterios de búsqueda';
	     o_html.style.display = 'none';
	}
}
function init()
{
 var capaForm= document.getElementById ('divFormulario');
 var mostrarCa=document.getElementById('informecuerpo');
 if (document.form1.INFORME.value=='NO')
{
	
 capaForm.style.display='';
 mostrarCa.style.display='none';
}else {
 capaForm.style.display = 'none';
 boton = document.getElementById('botonOcultar');
 boton.innerHTML = 'Volver a criterios de búsqueda';
 mostrarCa.style.display='block';
}
}
// Funcion que selecciona todas las opciones de una determinada
function todos(selTodas,variable,totsel){
   var size=eval ("document.form1."+variable+".length");
   if (selTodas) eval ("document.form1."+totsel+".value="+size);
   else eval ("document.form1."+totsel+".value=0");
   for (var i = 0; i < size ; i++){
      eval("document.form1."+variable+".options[i].selected="+ selTodas);
   }
   //total(variable);
     
}


function stodos(valor){

   for(var i=0; i<document.forms[0].elements.length; i++){

      if (document.forms[0].elements[i].type == "select-multiple"){

         for(var j=0; j<document.forms[0][i].length; j++){

            document.forms[0][i].options[j].selected = valor;

         }

      }   

   }

}


function cuenta(){

   var cntsel = 0;
   var cntopt = new Array();
   var cntselm;
   var name;
   var totallin=0;

   for (var i=0;i<document.forms[0].elements.length;i++){ 

      name = document.forms[0].elements[i].name;

      if (document.forms[0].elements[i].type == "select-multiple" && 
          trim(name) != 'ANYO'                                    &&
          trim(name) != 'VAL_PER_INF'){

         cntselm = 0;

         for(var j=0;j<eval("document.forms[0]." + name + ".length");j++){

            if (eval("document.forms[0]." + name + ".options[" + j + "].selected")) cntselm++;
    
         }

         
         cntopt[cntsel] = cntselm;

         cntsel++;

      }

   }

   total=1;

   for(i=0;i<cntopt.length;i++){
      
      total = total * cntopt[i];

   }

   if (total > 150) alert("Los criterios de selección superan el límite máximo de 150 columnas. Por favor, reduzca el número de columnas.");

   
   try{document.getElementById('totalcolum').innerHTML = 'Columnas seleccionadas: ' + total;}catch(e){}

}


 function enviar()
 {   
    var formulario = document.getElementById ('form1');
    var i=0;
    for (i=0;i<formulario.TIP_FOR.length;i++){
       if (formulario.TIP_FOR[i].checked)
          {break;}
    } 
    var tipoFor = formulario.TIP_FOR[i].value ;
    if (tipoFor =='PDF' || tipoFor =='EXC2K'){
  //quitamos el informe de la propia pagina.
       container=document.getElementById('informecuerpo');
       container.innerHTML = '';
       formulario.target='_blank';    
    }
     else
    {
    	showModal();
        formulario.target='_self' ;

    }
	 formulario.submit();
}


/* Funciones para ventanas modales */

/* Incluir dos capas en el html: una llamada caja que contenga la informacion 
y otra window con la información emergente
con dos clases por defecto: sombraUnload y windowUnload
*/
showModal=function(){
 theBody = document.getElementsByTagName('BODY')[0];
 popmask = document.createElement('div');
 popmask.id = 'popupMask';
 theBody.appendChild(popmask);
 document.getElementById('caja').className='sombraLoad';
 document.getElementById('window').className='windowLoad';
 document.getElementById('popupContainer').className='windowContainerLoad';
}
 
hideModal=function(){
 document.getElementById('caja').className='sombraUnload';
 document.getElementById('window').className='windowUnload';
 document.getElementById('popupContainer').className='windowUnload';
}



/* Funciones para el scroll */

//On scrolling of DIV tag.
function onDivScroll(oSelect)
	{
		//var miSelect = document.getElementById(idSelect);
	  var miSelect = document.getElementById(oSelect);
		//The following archives two things while scrolling
		//a) On horizontal scrolling: To avoid vertical scroll bar in select box when the size of 
		//	 the selectbox is 8 and the count of items in selectbox is greater than 8.
		//b) On vertical scrolling:	To view all the items in selectbox
		
		//Check if items in selectbox is greater than 8, if so then making the size of the selectbox to count of
		//items in selectbox,so that vertical scrollbar won't appear in selectbox
		if (miSelect.options.length > 3)
		{

			miSelect.size=miSelect.options.length;

		}
		else
		{

			miSelect.size=3;

		}

	}
			
//On focus of Selectbox
function onSelectFocus(idDiv, oSelect)
	{

//		var miDiv = document.getElementById(idDiv);
//		//On focus of Selectbox, making scroll position of DIV to very left i.e 0 if it is not. The reason behind
//		//is, in this scenario we are fixing the size of Selectbox to 8 and if the size of items in Selecbox is greater than 8 
//		//and to implement downarrow key and uparrow key functionality, the vertical scrollbar in selectbox will
//		//be visible if the horizontal scrollbar of DIV is exremely right.
//		if (miDiv.scrollLeft != 0)
//		{
//			miDiv.scrollLeft = 0;
//		}
//		
//		var miSelect = document.getElementById(oSelect.id);
//		//Checks if count of items in Selectbox is greater than 8, if yes then making the size of the selectbox to 8.
//		//So that on pressing of downarrow key or uparrowkey, the selected item should also scroll up or down as expected.
//		if( miSelect.options.length > 4)
//		{
//			miSelect.focus();
//			miSelect.size=4;
//		}
	}			
