<?php
    require_once '../../Modeles/Classes/ClassBioLic.php';
    require_once '../../Configuration/PostGreSQL.php';

    switch ($_POST['action']) {
        case 'SupprimerListeId':
            $nbSuppr = BioLic::supprimeId($_POST['listId']);
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
            $bioLic = new BioLic();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $bioLic->$i = $_POST[$i];
               }
            }
            unset($bioLic->action);
            unset($bioLic->zpr_id);
            if (isset($_POST['bio_geom'])) {
                $bioLic->bio_geom = "st_transform(ST_GeometryFromText('" . $_POST['bio_geom'] . "', 4326), 2154)";
            }
            switch ($_POST['action']) {
                case 'Ajouter':
                    $bioLic_id = $bioLic->ajoute($_POST['zpr_id']);
                    if ($bioLic_id > 0) {
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
                    unset($bioLic->bio_geom);
                    if ($bioLic->modifie() == 0) {
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
                    if ($bioLic->supprime() == 0) {
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
                    if ($bioLic->modifie() == 0) {
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
            unset($bioLic);
            break;
    }
?>