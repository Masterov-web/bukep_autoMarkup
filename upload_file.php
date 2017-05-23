<?php

  preg_match('/\.\w+$/u', $_FILES["filename"]["name"], $matches);
  $uploadFileExt = $matches[0];
  move_uploaded_file($_FILES["filename"]["tmp_name"], "convert/tempFile" . $uploadFileExt);
  
?>