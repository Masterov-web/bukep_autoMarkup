$( function(){

  var form = $( '.convert-form' );
  var inpF = $( '.convert-file' );
  var label = $( '.convert-file-label' );
  var uplSuccess = $( '.upl-success' );
  var dropFiles = null;
  var data;
  var fileName = null;

  inpF.on( 'change', function( e ){    
    if( this.files && this.files.length ){
      label.html( this.files[0].name );
      // fileName = this.files[0].name;
      console.log( this.files[0].name );
    }
  });

  var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
  }();  

  if( isAdvancedUpload ){
    var dEnterLeaveCount = 0;
    form.addClass( 'dd-upload' );

    form
      .find( '.dd-text' )
      .css({'display': 'inline'});   

    form
      .on( 'drag dragstart dragenter dragleave dragover dragend drop', function( e ){
        e.preventDefault();
        e.stopPropagation();
      })
      .on( 'dragenter', function( e ){        
        dEnterLeaveCount++;
        form.addClass( 'form-over' );
      })
      .on( 'dragleave', function( e ){
        dEnterLeaveCount--;
        if( dEnterLeaveCount == 0 ){
          form.removeClass( 'form-over' );
        }
      })     
      .on( 'drop', function( e ){
        dropFiles = e.originalEvent.dataTransfer.files;
        dEnterLeaveCount = 0;

        label.html( dropFiles[0].name );
        // fileName = dropFiles[0].name;
        console.log( dropFiles[0].name );
      })
      .on( 'submit', function( e ){
        e.preventDefault();

        var serverPatch = $( '.convert-server-patch' );
        if( !serverPatch.val() ){
          alert( 'Заполните поле' );
          return;
        }

        data = new FormData( form.get(0) );

        if( dropFiles ){
          data.set( inpF.attr( 'name' ), dropFiles[0] );
        }

        $.ajax({
          url: form.attr('action'),
          type: form.attr('method'),
          data: data,
          dataType: 'json',
          cache: false,
          contentType: false,
          processData: false,
          complete: function( xhr, status ){
            window.location.href = "http://127.0.0.1/bukep_doc-to-html/all_functions.php?serverPatch=" + serverPatch.val();
          }
        });
      });
  }
});