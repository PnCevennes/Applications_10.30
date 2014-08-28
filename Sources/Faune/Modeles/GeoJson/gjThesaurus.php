<?php
  include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
  require_once '../../Modeles/Classes/ClassCnxThesaurus.php';
  require_once '../../../../Outils/FiltreCarte.php';
  require_once '../../../../Outils/FiltreGrille.php';
  
  if (isset($_POST["id_type"])) {
    $cnxPgThesaurus = new CnxPgThesaurus();
    $datathes = json_encode($cnxPgThesaurus->getVocabulary($_POST["id_type"]));
    echo '{"data" : ' .$datathes .'}';
  }
  unset($datathes);
?>
