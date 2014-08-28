<?php
  include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
  require_once '../../Modeles/Classes/ClassCnxTableValue.php';
  require_once '../../../../Outils/FiltreCarte.php';
  require_once '../../../../Outils/FiltreGrille.php';
  

  $value = ($_REQUEST['value'] == null)? '' : $_REQUEST['filtervalue'];
  $limit = ($_REQUEST['limit'] == null)? 10 : $_REQUEST['limit'];
  $cnxPgTableValue = new CnxPgTableValue();
  $datathes = json_encode($cnxPgTableValue->getTableValueList($_GET["table"],$_GET["schema"], $_GET["column"], $value , $limit));
  echo $datathes ;

  unset($datathes);
?>
