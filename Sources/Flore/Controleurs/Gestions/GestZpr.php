<?php
    session_start();
    require_once '../../Modeles/Classes/ClassZpr.php';
    require_once '../../Configuration/PostGreSQL.php';
    	
    switch ($_POST['action']) {
        case 'SupprimerListeId':
            $nbSuppr = Zpr::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Zones prospectées supprimées avec succès';
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
            $zpr = new Zpr();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $zpr->$i = $_POST[$i];
               }
            }
            unset($zpr->action);
            unset($zpr->numerisat);
            if (isset($_POST['zpr_geom'])) {
                $zpr->zpr_geom = "st_transform(ST_GeometryFromText('" . $_POST['zpr_geom'] . "', 4326), 2154)";
            }
            switch ($_POST['action']) {
                case 'Ajouter':
                    $zpr->numerisateur = $_SESSION[APPLI]['numerisateur']['code'];
                    $zpr->ajoute();
                    $data = 'Zone prospectée ajoutée avec succès';
                    die('{success: true, data: "' . $data . '"}');
                    break;
                case 'Modifier':
                    unset($zpr->zpr_geom);
                    if ($zpr->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'avez pas les droits suffisants de modification";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Zone prospectée modifiée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($zpr->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'avez pas les droits suffisants de suppression";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Zone prospectée supprimée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Redessiner':
                    if ($zpr->modifie() == 0) {
                        $errorMessage = 'Opération de redessin impossible';
                        $data = "Vous n'avez pas les droits suffisants pour redessiner la donnée";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Zone prospectée redessinée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            unset($zpr);
            break;
    }
?>
