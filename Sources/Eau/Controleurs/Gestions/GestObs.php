<?php
    session_start();
    require_once '../../Modeles/Classes/ClassObs.php';
    require_once '../../Configuration/PostGreSQL.php';
    	
    //Traitement spécifique pour la saisie d'un point (x=longitude, y=latitude)
    function traiteCoord(&$obj, $long, $lat) { // passage par référence de l'objet
        // ATTENTION : les coordonnées sont modifiables aussi depuis le formulaire
       if ((isset($long) && (isset($lat)))) {
            if (($obj->longitude != '') && ($obj->latitude != '') &&
            ($obj->longitude >= -180) && ($obj->longitude <= 180) &&
            ($obj->latitude >= - 90) && ($obj->latitude <= 90)) {
                 $obj->geometrie = "ST_GeometryFromText('POINT(" . $obj->longitude .
                    ' ' . $obj->latitude . ")', 4326)";
            }
        }
    }

    switch ($_POST['action']) {
        case 'SupprimerListeId':
            $nbSuppr = Obs::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Observations supprimées avec succès';
                    die('{success: true, data: "' . $data . '"}');
                    break;
                case 0:
                    $errorMessage = 'Opérations de suppression impossibles';
                    $data = "Vous n'avez pas les droits suffisants de suppression";
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data .'"}');
                    break;
                default:
                    $errorMessage = 'Opérations de suppression partielles';
                    $data = "Vous n'avez pas les droits suffisants de suppression";
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data .'"}');
                    break;
            }
            break;
        default:
            $obs = new Obs();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $obs->$i = $_POST[$i];
               }
            }
            unset($obs->action);
            unset($obs->noms);
            unset($obs->numerisat);
            unset($obs->eltModeMesureDebit);
            if (isset($_POST['geometrie'])) {
                $obs->geometrie = "ST_GeometryFromText('" . $_POST['geometrie'] . "', 4326)";
            }
            switch ($_POST['action']) {
                case 'Ajouter':
                    $obs->obr_id = $_SESSION[APPLI]['numerisateur']['code'];
                    traiteCoord($obs, $_POST['longitude'], $_POST['latitude']);
                    $obs->ajoute();
                    $data = 'Observation ajoutée avec succès';
                    die('{success: true, data: "' . $data . '"}');
                    break;
                case 'Modifier':
                    unset($obs->geometrie);
                    traiteCoord($obs, $_POST['longitude'], $_POST['latitude']);
                    if ($obs->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'avez pas les droits suffisants de modification";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Observation modifiée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($obs->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'avez pas les droits suffisants de suppression";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Observation supprimée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Redessiner':
                    if ($obs->modifie() == 0) {
                        $errorMessage = 'Opération de redessin impossible';
                        $data = "Vous n'avez pas les droits suffisants pour redessiner la donnée";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Observation redessinée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            unset($obs);
            break;
    }
?>