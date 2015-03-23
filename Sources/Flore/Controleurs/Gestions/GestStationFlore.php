<?php
    require_once '../../Modeles/Classes/ClassStatFlore.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    $statFlore = new StatFlore();
    if ($statFlore->charge($_POST['bio_id'])) {
      
      foreach ($_POST as $i => $value) {
         if (isset($_POST[$i])) {
             $statFlore->$i = $_POST[$i];
         }
      }
      unset($statFlore->bio_geom);
      unset($statFlore->save_geom);
      if ($statFlore->modifie() == 0) {
        $errorMessage = 'Opération de modification impossible';
        $data = "Vous n'avez pas les droits suffisants de modification";
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
      }
      else {
          $data = 'Station flore modifiée avec succès';
          die('{success: true, data: "' . $data . '"}');
      }
    }
    
    unset($statCompl);
?>
