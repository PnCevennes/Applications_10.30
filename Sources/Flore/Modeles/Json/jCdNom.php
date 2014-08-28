<?php
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $valeur = pg_escape_string($_POST['valeur']);// besoin de "pg_escape_string" pour les valeurs contenant des apostrophes
    $cnxPgBd = new CnxPgBd();
    $req = "SELECT cd_nom FROM inpn.taxref_inventaire_flore WHERE nom_complet = '" . 
        $valeur . "' LIMIT 1"; // besoin de "LIMIT 1" car bug du référentiel taxonomique (les valeurs pour le champ "nom_complet" ne sont pas uniques)
    $rs = $cnxPgBd->executeSql($req);
    if (pg_numrows($rs) > 0) {
        $data = pg_result($rs, 0, 0);
        die('{success: true, data: "' . $data .'"}');
    }
    else {
        $errorMessage = 'ATTENTION : problème sur le référentiel taxonomique Flore';
        $data = 'Espèce introuvable (nom latin) ' . $_POST['filtre'] . ' | '. $valeur;
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
    unset($cnxPgBd);
?>
