<?php
    require_once '../../Modeles/Classes/ClassTaxFlo.php';
    require_once '../../Configuration/PostGreSQL.php';

    switch ($_POST['actionFlo']) {
        case 'SupprimerListeId':
            $nbSuppr = TaxFlo::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Espèces Flore supprimées avec succès';
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
            $taxFlo = new TaxFlo();
            foreach ($_POST as $i => $value) {
               if (isset($_POST[$i])) {
                   $taxFlo->$i = $_POST[$i];
               }
            }
            unset($taxFlo->actionFlo);
            switch ($_POST['actionFlo']) {
                case 'Ajouter':
                    $tax_id = $taxFlo->ajoute($_POST['zpr_id']);
                    if ($tax_id > 0) {
                        $data = 'Espèce Flore ajoutée avec succès';
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
                    if ($taxFlo->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'avez pas les droits suffisants de modification";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Espèce Flore modifiée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($taxFlo->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'avez pas les droits suffisants de suppression";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Espèce Flore supprimée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            unset($taxFlo);
            break;
    }
?>