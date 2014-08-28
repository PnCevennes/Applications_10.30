<?php
    require_once '../../Modeles/Classes/ClassTaxLic.php';
    require_once '../../Configuration/PostGreSQL.php';

    switch ($_POST['actionLic']) {
        case 'SupprimerListeId':
            $nbSuppr = TaxLic::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Lichens supprimés avec succès';
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
            $taxLic = new TaxLic();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $taxLic->$i = $_POST[$i];
               }
            }
            unset($taxLic->actionLic);
            switch ($_POST['actionLic']) {
                case 'Ajouter':
                    $tax_id = $taxLic->ajoute($_POST['zpr_id']);
                    if ($tax_id > 0) {
                        $data = 'Lichen ajouté avec succès';
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
                    if ($taxLic->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'avez pas les droits suffisants de modification";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Lichen modifié avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($taxLic->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'avez pas les droits suffisants de suppression";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Lichen supprimé avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            unset($taxLic);
            break;
    }
?>