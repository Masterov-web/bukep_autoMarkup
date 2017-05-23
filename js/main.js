$( window ).load( function(){

  var body = $( 'body' );
  var input = $( '.input' );
  var output = $( '.output' );
  var textContent = $( '#textContent' );

  var arrImg = [];
  var arrPar = [];
  var imgItemWidth;

  var noCaptionTextNode = '';

  var i; // Loop iterator

  var wrapperImages = $( '<div/>', { 'class': 'wrapper-images' });
  var imageMinHeight;
  var arrImageHeight =[];

  input
    .children()
    .clone()
    .appendTo( output );

  var allOutputTables = $( output ).find( 'table' );
  allOutputTables.each( function( index ){
                    removeEmptyTable( $( this ) );
                  });


  var allOutputImages = $( output ).find( 'img' );
  allOutputImages.each( function( index ){
                    setImageRatio( $( this ) ); // (CHANGE FUNCTION NAME)
                    setImageSrc( $( this ), 'convert/temporaryFolder/', true );
                  });

  allOutputImages.each( function( index ){
                    var image = $( this );

                    if( image.hasClass( 'img-class' ) ){
                      return true;
                    }

                    else if( image.closest( 'table' ).length ){
                      return ifTableImage( image.closest( 'table' ), image );
                    }

                    else if( ifImg( image ) ){
                      image
                        .parent( 'p' )
                        .remove();
                    }
                  });
  
  getStringContent( output, textContent );
  $( '.preload-bg' ).fadeOut();



    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////


    /* Delete <p> from <td>
    function delParFromTd( tableTag ){
      var allParInTable = tableTag.find( 'p' );
      var addSpace;

      allParInTable.each( function( index ){
        $( this ).html( $( this ).html() + ' ' );
        $( this.childNodes ).unwrap();
      });

      return tableTag;
    }
    Delete <p> from <td>*/

    /////////////////////////////////////////////////////////////

    // Remove empty table
    function removeEmptyTable( testTable ){
      testTable
        .find( 'td' )
        .each( function( index ){
          if( !$( this ).html() == '' ){
            return false;
          }

          testTable.remove();
          return true;
        });
    }
    // Remove empty table

    /////////////////////////////////////////////////////////////

    // Set Image Ratio (CHANGE FUNCTION NAME)
    function setImageRatio( imageTag ){
      // var wordPageOrientation = $( '#wordPageOrientation' ).attr( 'value' );
      var wordPageOrientation = 'portret';
      var wordLandWidth = 1120;
      var wordPortWidth = 791;
      var outputWidth = output.width();

      var parentSpanWidth = imageTag.parent( 'span' ).width();
      var parentSpanHeight = imageTag.parent( 'span' ).height();
      
      var ratio;

      if( wordPageOrientation == 'album' ){
        ratio = outputWidth / wordLandWidth;
      }

      else if( wordPageOrientation == 'portret' ){
        // ratio = wordPortWidth / outputWidth;
        ratio = outputWidth / wordPortWidth;
      }
      console.log( parentSpanWidth + '--' + parentSpanHeight + '--' + ratio );


      if( parentSpanWidth > (outputWidth - 50) || parentSpanHeight > 480 ){
        var ratioImg = parentSpanWidth / parentSpanHeight;

        if( parentSpanWidth > parentSpanHeight ){
          parentSpanWidth = 250;
          parentSpanHeight = parentSpanWidth / ratioImg;
        }

        else{
          parentSpanHeight = 220;
          parentSpanWidth = parentSpanHeight * ratioImg;
        }

        imageTag.attr({
          'width': parentSpanWidth * ratio,
          'height': parentSpanHeight * ratio 
        });
      }

      imageTag.attr({
        'width': imageTag.parent( 'span' ).width() * ratio ,
        'height': imageTag.parent( 'span' ).height() * ratio 
      });

      imageTag.unwrap();

      /*imageTag.attr({
        'width': imageTag.parent( 'span' ).width(),
        'height': imageTag.parent( 'span' ).height()
      });

      imageTag.unwrap();*/
    }
    // Set Image Ratio

    /////////////////////////////////////////////////////////////

    // Set Image Src
    function setImageSrc( imageFile, imagePacth, setJpg ){
      var imageName = imageFile.attr( 'src' ).match( /(\w+|\d+)\.(jpeg|jpg|png|gif)$/gi );
      var newSrc;
      
      if( setJpg ){
        var imageNameJpg = imageName[0].replace( /(jpeg|jpg|png|gif)$/gi, 'jpg' );
        newSrc = imagePacth + imageNameJpg;
      }

      else{
        newSrc = imagePacth + imageName;
      }

      imageFile.attr( 'src', newSrc );
    }
    // Set Image Src

    /////////////////////////////////////////////////////////////

    // If Table Image
    function ifTableImage( imagesTable, img ){
      if( img.hasClass( 'table-image' ) ){
        img.removeClass( 'table-image' );
        return true;
      }     

      if( getConfirm( imagesTable, 'Преобразовать таблицу в контейнер с изображениями?' ) ){
        imagesTable.before( wrapperImages );
        handleTableImage( imagesTable );
      }

      imagesTable
        .find( 'img' )
        .addClass( 'table-image' );

      img.removeClass( 'table-image' );
    }
    // If Table Image

    /////////////////////////////////////////////////////////////
    
    // If image
    function ifImg( $image ){
      if( !$( '.wrapper-images' ).length ){
        $image
            .parent( 'p' )
            .before( wrapperImages );
      }

      var nextNode = $image.prop( 'nextSibling' );
      var oneLineImagesWidth = $image.width();
      //var nodeMargin = 15;
      

      arrImg.push( $image );

      while( nextNode && $( nextNode ).is( 'img' ) ){
        oneLineImagesWidth += $( nextNode ).width();

        if( oneLineImagesWidth < output.width() ){
          $( nextNode ).addClass( 'img-class' );
          arrImg.push( nextNode );
          nextNode = nextNode.nextSibling;
        }

        else{
          setImageSize( arrImg );
          //$( '.wrapper-images' ).append( setImgWrapper( arrImg, arrPar ) );
          wrapperImages.append( setImgWrapper( arrImg, arrPar ) );
          return false;
        }
      }


      if( nextNode && nextNode.nodeType == 3 ){
        isCaption( nextNode );
        setImageSize( arrImg );
        // $( '.wrapper-images' ).append( setImgWrapper( arrImg, arrPar ) + noCaptionTextNode );
        wrapperImages.append( setImgWrapper( arrImg, arrPar ) + noCaptionTextNode );
        // $( '.wrapper-images' )
        wrapperImages
          .children()
          .unwrap();
        return true;
      }

      else if( !nextNode ){
        isCaption( getNextParentElement( $image.parent() ) );
        setImageSize( arrImg );
        // $( '.wrapper-images' ).append( setImgWrapper( arrImg, arrPar ) );
        wrapperImages.append( setImgWrapper( arrImg, arrPar ) );
        // $( '.wrapper-images' )
        wrapperImages
          .children()
          .unwrap();
        return true;
      }
    }
    // If image

    /////////////////////////////////////////////////////////////

    // Set Image Size
    function setImageSize( arrSetImageSize ){
      var imgLineSum = 0;
      var coefficient;

      for( i = 0; i < arrSetImageSize.length; i++ ){
        imgLineSum += $( arrSetImageSize[i] ).width();
        // console.log( $( arrSetImageSize[i] ).attr( 'src' ) + ': ' + $( arrSetImageSize[i] ).width());
      }

      if( arrSetImageSize.length <= 2 ){
        coefficient = 640 / imgLineSum;
        // coefficient = 800 / imgLineSum;
        // console.log( coefficient )
      }

      else if( arrSetImageSize.length > 2 ){
        coefficient = (output.width() - /* this is margins */((arrSetImageSize.length - 1) * 15)/* this is margins */) / imgLineSum;
      }

      for( i = 0; i < arrSetImageSize.length; i++ ){
        arrImageHeight.push( $( arrSetImageSize[i] ).height() * coefficient );
        // arrImageHeight.push( $( arrSetImageSize[i] ).height() );
      }

      imageMinHeight = Math.min.apply( null, arrImageHeight );

      if( imageMinHeight > 420 ){
        imageMinHeight = 420;
      }

      arrImageHeight = [];
    }
    // Set Image Size

    /////////////////////////////////////////////////////////////

    // Get Next Parent Element
    function getNextParentElement( nodeElement ){
      //var nextParentElement = $( nodeElement ).next();
      var nextParentElement = nodeElement.next();

      if( !nextParentElement.is( 'p' ) && !nextParentElement.is( 'table' ) ){
        return false;
      }

      else if( !nextParentElement.find( 'img' ).length ){
        return nextParentElement;
      }
    }
    // Get Next Parent Element

    /////////////////////////////////////////////////////////////

    // Is Caption
    function isCaption( element ){
      if( !element ){
        return false;
      }     

      if( getConfirm( element, 'Это подпись к изображению?' ) ){
        var arrElement = [];

        //if( $( element ).is( 'table' ) ){
        if( element.is( 'table' ) ){
          arrElement = element.find( 'td' );
        }

        else{
          parseCaption( element, arrElement );
        }

        for( i = 0; i < arrElement.length; i++ ){
          if( typeof arrElement[i] == 'string' ){
            arrPar.push( arrElement[i] ); 
          }

          else{
            arrPar.push( $( arrElement[i] ).text() ); 
          }         
        }

        element.remove();
        return false;
      }

      if( element.nodeType == 3 ){
        noCaptionTextNode = '<p>' + element.data + '</p>';
        return noCaptionTextNode;
      }
    }
    // Is Caption

    /////////////////////////////////////////////////////////////

    // Get confirm
    function getConfirm( confirmElement, qwestionStr ){
      var qwestion;

      if( $( confirmElement ).prop( 'outerHTML' ) ){
        qwestion = qwestionStr.toUpperCase() + '\n-----------------\n' + $( confirmElement ).prop( 'outerHTML' );
        // qwestion = qwestionStr.toUpperCase() + '\n-----------------\n' + confirmElement .prop( 'outerHTML' );
      }

      else{
        qwestion = qwestionStr.toUpperCase() + '\n-----------------\n' + $( confirmElement ).text();
        // qwestion = qwestionStr.toUpperCase() + '\n-----------------\n' + confirmElement.text();
      }

      return confirm( qwestion );

    }
    // Get confirm

    /////////////////////////////////////////////////////////////

    // Parse Caption
    function parseCaption( element, arrayOfElements ){
      var str;
      if( element.nodeType == 3 ){
        str = element.data;
      }

      else if( element.is( 'p' ) ){
        //str = $( element ).text();
        str = element.text();
      }

      var result = str.match( /((\S+|[а-яё])(\s{1,2})?)+(\s{1,})?/gi );

      if( result.length < 2 ){
        arrayOfElements.push( element );
      }

      else if( result.length == 2 ){
        for( i = 0; i < result.length; i++ ){
          arrayOfElements.push( result[i].replace( /\s+$/g, '' ) );
        }
      }

      else if( result.length > 2 ){
        var arrDelSpaces = [];
        for( i = 0; i < result.length; i++ ){
          arrDelSpaces.push( result[i].replace( /\s+$/g, '' ) );
        }

        for( i = 0; i < arrDelSpaces.length/2; i++ ){
          arrayOfElements.push( arrDelSpaces[i] + ' ' + arrDelSpaces[i+2] );
        }
      }
    }
    // Parse Caption

    /////////////////////////////////////////////////////////////   

    // Set Images Wrapper
    function setImgWrapper( arrOfImg, arrOfPar ){
      var img = '';
      var imgItem = '';
      var imgCaption = '';
      var imgItems = '';
      var imgBlock = '';

      // One image with caption
      // One image without caption
      // Two images with one caption
      // Two images without caption
      // More then two images without captions
      // More then two images with one caption
      if( arrOfPar.length <= 1 ){
        setImgItemWidth( arrOfImg, 1 );

        for( i = 0; i < arrOfImg.length; i++ ) {
          img += '<img src="' + $( arrOfImg[i] ).attr( 'src' ) + '" style="height: ' + imageMinHeight + 'px">';
        }

        if( arrOfPar.length ){
          imgCaption = '<span class="img-caption">' + arrOfPar[0] + '</span>';
        }

        imgItem = '<div class="img-item" style="width:' + imgItemWidth + '%">' + img + '</div> ' + imgCaption;

        imgBlock = '<div class="img-block">' + imgItem + '</div>';
        arrImg = [];
        arrPar = [];

        return imgBlock;
      }
      // One image with caption
      // One image without caption
      // Two images with one caption
      // Two images without caption      
      // More then two images with one caption
      // More then two images without captions


      // Two images with captions
      // More then two images with captions
      else if( arrOfPar.length > 1 ){
        setImgItemWidth( arrOfImg );

        for( i = 0; i < arrOfImg.length; i++ ) {
          img = '<img src="' + $( arrOfImg[i] ).attr( 'src' ) + '" style="height: ' + imageMinHeight + 'px">';  
  
          if( arrOfPar.length ){
            imgCaption = '<span class="img-caption">' + arrOfPar[i] + '</span>';
          }

          imgItem = '<div class="img-item" style="width:' + imgItemWidth + '%">' + img + imgCaption + '</div>';
          imgItems +=  imgItem; 
        }

        imgBlock = '<div class="img-block">' + imgItems + '</div>';
        arrImg = [];
        arrPar = [];
        
        return imgBlock;
      }
    }
    // Set Images Wrapper

    /////////////////////////////////////////////////////////////

    // Set Img Item Width
    function setImgItemWidth( arrImg, numberBlocks ){
      var numberBlocks = numberBlocks || arrImg.length;
      imgItemWidth = 100 / numberBlocks;

      return imgItemWidth;
    }
    // Set Img Item Width

    /////////////////////////////////////////////////////////////

    // Handle Table Image
    function handleTableImage( tableWithImages ){
      tableWithImages
        .find( 'tr' )
        .each( function( index ){
          var tr = $( this );
          var tdCollection = tr.find( 'td' );

          if( tr.find( 'img' ).length ){
            var imgCollection = tr.find( 'img' );

            for( i = 0; i < imgCollection.length; i++) {
              arrImg.push( imgCollection[i] );

              var fullCaption = '';
              var nextPartCaption = imgCollection[i].nextSibling;
              while( nextPartCaption && nextPartCaption.data != undefined ){
                fullCaption +=  nextPartCaption.data + ' ';
                nextPartCaption = nextPartCaption.nextSibling;
              }

              if( fullCaption ){                
                arrPar.push( fullCaption );
              }
            }

            if( tr.next().find( 'img' ).length ){
              setImageSize( arrImg );
              wrapperImages.append( setImgWrapper( arrImg, arrPar ) );
              return true;
            }

            else if( !tr.next().length ){
              setImageSize( arrImg );
              isCaption( getNextParentElement( tableWithImages ) );
              wrapperImages.append( setImgWrapper( arrImg, arrPar ) );              
              return true;
            }
          }

          else{
            for( i = 0; i < tdCollection.length; i++ ){
              if( $( tdCollection[i] ).text() !== '' ){
                arrPar.push( $( tdCollection[i] ).text() );
              }
            }

            setImageSize( arrImg );
            wrapperImages.append( setImgWrapper( arrImg, arrPar ) );
            return true;
          }
        });
  
      tableWithImages.remove();
      wrapperImages.children().unwrap();
    }
    // Handle Table Image

    /////////////////////////////////////////////////////////////

    // Get sring content
    function getStringContent( rootElement, textArea ){
      var tempRootElement = rootElement.clone();
      var allImages = tempRootElement.find( 'img' );

      allImages.each( function( index ){
        setImageSrc( $( this ), setImagesPath( $( '#serverPatch' ).attr( 'value' ) ), false );
      });

      tempRootElement.toString = function(){
        return $( this ).prop( 'innerHTML' );
      }

      textArea.prop('textContent', tempRootElement );
    }
    // Get sring content

    /////////////////////////////////////////////////////////////

    // Set images path

    function setImagesPath( serverPatch ){
      var arrayMonths = [
        '01_Jan',
        '02_Feb',
        '03_Mar',
        '04_Apr',
        '05_May',
        '06_Jun',
        '07_Jul',
        '08_Aug',
        '09_Sep',
        '10_Oct',
        '11_Nov',
        '12_Dec'
      ];      
      var CONST_PATCH  = 'assets/images/';
      var imgServerPatch;

      // If full patch
      var assets = serverPatch.match( /^(\/|\\)*assets/i );

      if( assets ){
        serverPatch = serverPatch.replace( /\\/gi, '/' );
        serverPatch = serverPatch.replace( /^(\/)?((\/*\w+|\d+\/\w+|\d+)+)(\/)?$/gi, '$2' );
        /*serverPatch = serverPatch.replace( /^\//gi, '' );
        serverPatch = serverPatch.replace( /\/$/gi, '' );*/
        imgServerPatch = serverPatch + '/';
        return imgServerPatch;
      }
      // If full patch

      // If code patch
      var arrFileName = serverPatch.split('_');

      if( arrFileName[0] == 'k' ){
        imgServerPatch = CONST_PATCH + 'kaf/' + arrFileName[1] + '/';
      }

      else if( arrFileName[0] == 'f' ){
        imgServerPatch = CONST_PATCH + 'fak/' + arrFileName[1] + '/';
      }
      
      else if( arrFileName[3] ){
        imgServerPatch = CONST_PATCH + 'news/' + arrFileName[2] + '/' + arrayMonths[ arrFileName[1]-1 ] + '/' + arrFileName[0] + '_' + arrFileName[3] + '/';
      }

      else{
        imgServerPatch = CONST_PATCH + 'news/' + arrFileName[2] + '/' + arrayMonths[ arrFileName[1]-1 ] + '/' + arrFileName[0] + '/';
      }

      return imgServerPatch;
    }
    // If code patch
    // Set images path
});
