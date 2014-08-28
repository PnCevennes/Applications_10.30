<?php
    require_once '../../Modeles/Classes/ClassPopStat.php';
    
    switch ($_POST['action']) {
        case 'SupprimerListeId':
            $nbSuppr = PopStat::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Populations supprimées avec succès';
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
            $pop = new PopStat();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $pop->$i = $_POST[$i];
               }
            }
            unset($pop->action);
            unset($pop->zpr_id);
            if (isset($_POST['pop_geom'])) {
                $pop->pop_geom = "st_transform(ST_GeometryFromText('" . $_POST['pop_geom'] . "', 4326), 2154)";
            }
            switch ($_POST['action']) {
                case 'Ajouter':
                    $pop_id = $pop->ajoute($_POST['zpr_id']);
                    if ($pop_id > 0) {
                        $data = 'Population ajoutée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    else {
                        $errorMessage = "Opération d'ajout impossible";
                        $data = "Vous n'avez pas les droits suffisants d'ajout";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    break;
                case 'Modifier':
                    unset($pop->pop_geom);
                    if ($pop->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'avez pas les droits suffisants de modification";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Population modifiée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($pop->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'avez pas les droits suffisants de suppression";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Population supprimée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Redessiner':
                    if ($pop->modifie() == 0) {
                        $errorMessage = 'Opération de redessin impossible';
                        $data = "Vous n'avez pas les droits suffisants pour redessiner la donnée";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Population redessinée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            unset($pop);
            break;
    }
?>