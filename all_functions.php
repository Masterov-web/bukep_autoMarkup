<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BUKEP: doc-to-html</title>

  <!-- Main style -->
  <link rel="stylesheet" href="css/style.css">
  <!-- Main style -->
</head>

<body>
  <div class="preload-bg">
    <span class="preload-text">Converting...</span>
  </div>



<?php
  /*------------------------------------------------------*/
  /*--------------------------BAT-------------------------*/
  /*------------------------------------------------------*/

  // Launch .bat
  exec( 'macros_make_html.bat' );

  /*------------------------------------------------------*/
  /*--------------------------BAT-------------------------*/
  /*------------------------------------------------------*/

  ///////////////////////////////////////////

  /*------------------------------------------------------*/
  /*-------------------------DELETE-----------------------*/
  /*------------------------------------------------------*/

  // Delete word file
  $convertDir = opendir( 'convert/' );
  $delFileName = readdir( $convertDir );
  while( $delFileName = readdir( $convertDir ) ){ 
    if ( $delFileName == 'tempFile.docx' || $delFileName == 'tempFile.doc' ){
      unlink( 'convert/' . $delFileName );
    }
  }


  // unlink( 'convert/tempFile.docx' );

  /*------------------------------------------------------*/
  /*-------------------------DELETE-----------------------*/
  /*------------------------------------------------------*/

  ///////////////////////////////////////////

  /*------------------------------------------------------*/
  /*-------------------------IMAGE------------------------*/
  /*------------------------------------------------------*/

  // Image optimization
  $origPath = 'convert/temp.files/';
  $optimazePath = 'convert/temporaryFolder/';
  
  /* If optimaze folder exist */
  function dd( $delfile ){ // call function
    if( file_exists( $delfile ) ){ // if file/folder exist - go on
      chmod( $delfile, 0777 ); // set atribute for file/folder 777
      
      if ( is_dir( $delfile ) ){ // if folder - go on, if file - go to "else"
        $handle = opendir( $delfile ); // open folder
        while( $filename = readdir( $handle ) ) // reading / writing in a loop of all files in a variable
 
        if ( $filename != '.' && $filename != '..' ){ // cancel write in a variable current and parent folder
          dd( $delfile . '/' . $filename ); // delete files in folder
        }
 
        closedir( $handle ); // close folder
        rmdir( $delfile );  // remove emty folder
      }
      
      else{  // if file
        unlink( $delfile );  // remove file
      }
    }
  }

  $deldir = $optimazePath;  // set the folder pacth 

  if ( file_exists( $deldir ) ){
    dd( $deldir );
  }

  mkdir( $optimazePath );

  /* If optimaze folder exist */

  function optimaze( $imageFile, $quality ){    
    global $origPath;
    global $optimazePath;
    $preveiwPatch = $origPath . $imageFile;

    $string = $imageFile;
    $pattern = '/\.(jpeg|jpg|png|gif)$/i';
    $replacement = '';
    $imageFileNameWithoutExt = preg_replace( $pattern, $replacement, $string );  

    $info = getimagesize( $preveiwPatch );
    $maxWidth = 1000;


    // Quality by default
    if ( $quality == null ){
      $quality = 50;
    }


    if ( $info[2] == IMAGETYPE_JPEG ){
      $origImage = imagecreatefromjpeg( $preveiwPatch );
    }

    else if ( $info[2] == IMAGETYPE_PNG ){
      $origImage = imagecreatefrompng( $preveiwPatch );
    }

    else if ( $info[2] == IMAGETYPE_GIF ){
      $origImage = imagecreatefromgif( $preveiwPatch );
    }
  
    else{
      return false;
    }


    // Width and height of image
    $origWidth = imagesx( $origImage );
    $origHeight = imagesy( $origImage );


    // If width more than we set
    if ( $origWidth > $maxWidth ){

      // Set ratio
      $ratio = $origWidth / $maxWidth;
      $widthOptimaze = round( $origWidth / $ratio );
      $heightOptimaze = round( $origHeight / $ratio ); 

      // Create empty image
      $optimazeImage = imagecreatetruecolor( $widthOptimaze, $heightOptimaze );

      if( $info[2] == IMAGETYPE_PNG ){
        imagefill( $optimazeImage, 0, 0, imagecolorallocate( $optimazeImage, 255, 255, 255 ) );
        imagealphablending( $optimazeImage, true );
      }

      // Copy old image into new and set parameters
      imagecopyresampled( $optimazeImage, $origImage, 0, 0, 0, 0, $widthOptimaze, $heightOptimaze, $origWidth, $origHeight );    

      // Output image and clear the memory
      imagejpeg( $optimazeImage, $optimazePath . $imageFileNameWithoutExt . '.jpg', $quality );
      imagedestroy( $optimazeImage );
      imagedestroy( $origImage );
      return $origImage;
    }

    else{
      if( $info[2] == IMAGETYPE_PNG ){
        $imageWhiteBg = imagecreatetruecolor( imagesx( $origImage ), imagesy( $origImage ) );
        imagefill( $imageWhiteBg, 0, 0, imagecolorallocate( $imageWhiteBg, 255, 255, 255 ) );
        imagealphablending( $imageWhiteBg, true );
        imagecopy( $imageWhiteBg, $origImage, 0, 0, 0, 0, imagesx( $origImage ), imagesy( $origImage ) );
        $origImage = $imageWhiteBg;
      }

      // Output image and clear the memory
      imagejpeg( $origImage, $optimazePath . $imageFileNameWithoutExt . ".jpg", $quality );
      imagedestroy( $origImage );
      return $origImage;
    }
  }


  if ( $origImageFolder = opendir( $origPath ) ) {
    while ( false !== ( $origImageFileName = readdir( $origImageFolder ) ) ){ 
      if ( $origImageFileName != '.' && $origImageFileName != '..'){
        optimaze( $origImageFileName, null );
      }
    }
    closedir( $origImageFolder ); 
  }

  /*------------------------------------------------------*/
  /*-------------------------IMAGE------------------------*/
  /*------------------------------------------------------*/

  ///////////////////////////////////////////

  /*------------------------------------------------------*/
  /*-----------------------PURIFIER-----------------------*/
  /*------------------------------------------------------*/
  
  /* Get incoming data from file */
  $tempHtml = 'convert/temp.htm';
  $htmFileContent = file_get_contents( $tempHtml );
  $htmFileContent = mb_convert_encoding( $htmFileContent, 'utf-8', 'cp1251' );
  /* Get incoming data from file */


  /* Delete Words`s conditionals comments */
  $pattern = array('/<![^>]+>/i');
  $replacement = '';

  $htmFileContent = preg_replace($pattern, $replacement, $htmFileContent );
  /* Delete Words`s conditionals comments */


  require_once 'htmlpurifier/library/HTMLPurifier.auto.php';  
  $config = HTMLPurifier_Config::createDefault();
  $config->set('Core.LexerImpl', 'DirectLex');
  $config->set('HTML.AllowedElements', array('p', 'v:imagedata', 'v:shape', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'));
  $config->set('HTML.AllowedAttributes', array('v:imagedata.src', 'v:shape.style',  'a.href', 'a.title', 'td.rowspan','td.colspan'));
  $config->set('AutoFormat.RemoveEmpty', true);


   // WITHOUT CACHE
  $def = $config->getHTMLDefinition(true);
  $t_lalka = $def->addElement(
      'v:imagedata', // name
      'Inline',      // content set
      'Empty',       // allowed children
      'Common',      // attribute collection
      array(         // attributes
        'src' => 'CDATA'
      )
    );

  $v_shape = $def->addElement(
      'v:shape', // name
      'Inline',      // content set
      'Inline',       // allowed children
      'Common',      // attribute collection
      array(         // attributes
        'style' => 'CDATA'
      )
    );
  // WITHOUT CACHE


  $purifier = new HTMLPurifier($config);
  $clean_html = $purifier->purify($htmFileContent);


  /* (1) Replace imagedata tag with img tag */
  $pattern = array('/v:imagedata/i', '/(?:\s)*(<img[^>]+>)(\s)*/u');
  $replacement = array('img', '$1');
  $clean_html = preg_replace($pattern, $replacement, $clean_html);
  /* (1) Replace imagedata tag with img tag */


  /* (2) Replace h tags with p */
  $pattern = array('/<h(1|2|3|4|5|6)>/u', '/<\/h(1|2|3|4|5|6)>/u');
  $replacement = array('<p>', '</p>');
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (2) Replace h tags with p */


  /* (3) Replace v:shape tags with span */
  $pattern = array('/\s*(<v\:shape)/u','/(\/v\:shape)\s*/u');
  $replacement = array('<span class="now"','/span');
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (3) Replace v:shape tags with span */


  /* (5) Delete spaces before and inside p */
  $pattern = array('/\s*(<p>)\s*/u', '/\s*(<\/p>)\s*/u');
  $replacement = array('$1', '$1');
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (5) Delete spaces before and inside p */


  /* (6) Delete spaces from td */
  $pattern = array('/(<td>)\s*/u', '/\s*(<\/td>)/u');
  $replacement = array('$1', '$1');
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (6) Delete spaces from td */


  /* (7) Delete SHAPE \* MERGEFORMAT */
  $pattern = array('/\s*SHAPE\s*\\\\\*\s*MERGEFORMAT\s*/u');
  $replacement = array('');
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (7) Delete SHAPE \* MERGEFORMAT */


  /* (8) Delete <img /> */
  $pattern = array('/<img\s*\/>/u');
  $replacement = array('');
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (8) Delete <img /> */


  /* (9) Delete all empty tags (include containing &nbsp;) */
  $pattern = array('/<(\w+)[^(\/>)]*>\s*<\/\\1>/u');
  $replacement = '';
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (9) Delete all empty tags (include containing &nbsp;) */


  /* (10) Delete more than one space into p */
  $pattern = array('/(\S(&nbsp;|\s))(&nbsp;|\s)+/u');
  $replacement = '$1';
  $clean_html = preg_replace($pattern, $replacement, $clean_html );
  /* (10) Delete more than one space into p */

  /*------------------------------------------------------*/
  /*-----------------------PURIFIER-----------------------*/
  /*------------------------------------------------------*/

  ///////////////////////////////////////////

  /*------------------------------------------------------*/
  /*--------------------------ZIP-------------------------*/
  /*------------------------------------------------------*/

  /* Creates a compressed zip file */
  function create_zip( $zipFiles = array(), $zipDestination = '', $zipOverwrite = false, $zipDelSubdir = true ){
    // If the zip file already exists and overwrite is false, return false
    if( file_exists( $zipDestination ) && !$zipOverwrite ){
      return false;
    }

    // Vars
    $zipValidFiles = array();

    // If files were passed in...
    if( is_array( $zipFiles ) ) {

      // Cycle through each file
      foreach( $zipFiles as $zipFile ) {

        // Make sure the file exists
        if( file_exists( $zipFile ) ) {
          $zipValidFiles[] = $zipFile;
        }
      }
    }


    // If we have good files...
    if( count( $zipValidFiles ) ){
      
      // Create the archive
      $zip = new ZipArchive();
      if( $zip->open( $zipDestination,$zipOverwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE ) !== true ){
        return false;
      }

      foreach( $zipValidFiles as $zipFile ) {
        if( $zipDelSubdir ){
          $zip->addFile( $zipFile, basename( $zipFile ) );
        }

        else{
          $zip->addFile( $zipFile, $zipFile );
        }
      }

      // Debug
      // echo 'The zip archive contains ',$zip->numFiles,' files with a status of ',$zip->status;
    
      // Close the zip -- done!
      $zip->close();
    
      // Check to make sure the file exists
      return file_exists( $zipDestination );
    }

    else
    {
      return false;
    }
  }


  /* If archive exist */
  if( file_exists( 'convert/my-archive.zip' ) ){
    unlink( 'convert/my-archive.zip' );
  } 
  /* If archive exist */

  $zipFilesToZip = [];

  if ( $optimizeImageFolder = opendir(  $optimazePath ) ) {
    while ( false !== ( $optimiziImageFileName = readdir( $optimizeImageFolder ) ) ){ 
      if ( $optimiziImageFileName != '.' && $optimiziImageFileName != '..'){
        $zipFileToZipPatch =  $optimazePath . $optimiziImageFileName;
        array_push( $zipFilesToZip, $zipFileToZipPatch );
      }
    }
    closedir( $optimizeImageFolder );
  }

  // If true, good; if false, zip creation failed
  $result = create_zip( $zipFilesToZip, 'convert/my-archive.zip' );

  /*------------------------------------------------------*/
  /*--------------------------ZIP-------------------------*/
  /*------------------------------------------------------*/

?>


  <!-- *************** MARKUP *************** -->

  <div class="input">  
    <?php echo($clean_html); ?> 
  </div>

  <div class="header"></div>
  <div class="output"></div>

  <div class="wrapper-link box-save-arch">
    <a class="save-arch-link" href="convert/my-archive.zip" target="_blank">Скачать изображения</a>
  </div>

  <form class="result-markup" action="">
    <input type="hidden" id="serverPatch" value="<?php echo $_GET['serverPatch'] ?>">
    <textarea name="textContent" id="textContent" class="text-content" cols="30" rows="10"></textarea>
  </form>

  <div class="wrapper-link box-back">
    <a class="save-arch-link" href="index.html">Назад</a>
  </div>

  <!-- *************** MARKUP *************** -->



  <!-- Scripts -->
  <!-- jQuery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
  <!-- jQuery -->

  <!-- Custom js -->
  <script src="js/main.js"></script>
  <!-- Custom js -->
</body>
</html>