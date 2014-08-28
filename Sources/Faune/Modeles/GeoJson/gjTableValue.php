<?php
  include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
  require_once '../../Modeles/Classes/ClassCnxTableValue.php';
  require_once '../../../../Outils/FiltreCarte.php';
  require_once '../../../../Outils/FiltreGrille.php';
  

    $cnxPgTableValue = new CnxPgTableValue();
    $datathes = json_encode($cnxPgTableValue->getTableValueList($_GET["table"],$_GET["schema"], $_GET["column"]));
    echo $datathes ;
  
  unset($datathes);
?>
