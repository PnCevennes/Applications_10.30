<?php
    require_once '../../Modeles/Classes/ClassBioFlo.php';
    require_once '../../Configuration/PostGreSQL.php';

    switch ($_POST['action']) {
        case 'SupprimerListeId':
            $nbSuppr = BioFlo::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Biotopes supprimés avec succès';
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
            $bioFlo = new BioFlo();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $bioFlo->$i = $_POST[$i];
               }
            }
            unset($bioFlo->action);
            unset($bioFlo->zpr_id);
            if (isset($_POST['bio_geom'])) {
                $bioFlo->bio_geom = "st_transform(ST_GeometryFromText('" . $_POST['bio_geom'] . "', 4326), 2154)";
            }
            switch ($_POST['action']) {
                case 'Ajouter':
                    $bioFlo_id = $bioFlo->ajoute($_POST['zpr_id']);
                    if ($bioFlo_id > 0) {
                        $data = 'Biotope ajouté avec succès';
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
                    unset($bioFlo->bio_geom);
                    if ($bioFlo->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'avez pas les droits suffisants de modification";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Biotope modifié avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($bioFlo->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'avez pas les droits suffisants de suppression";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Biotope supprimé avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Redessiner':
                    if ($bioFlo->modifie() == 0) {
                        $errorMessage = 'Opération de redessin impossible';
                        $data = "Vous n'avez pas les droits suffisants pour redessiner la donnée";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Biotope redessiné avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            unset($bioFlo);
            break;
    }
?>