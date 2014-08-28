<?php
    require_once '../../Configuration/PostGreSQL.php';
    require_once '../../../../Outils/ClassEnregGeom.php';

    $enregGeom = new EnregGeom(HOST, PORT, DBNAME, USER, PASSWORD, $_POST['table'],
        $_POST['chId'], $_POST['seqSerial'], $_POST['chGeom'], $_POST['epsg']);
    switch ($_POST['action']) {
        case 'Dessiner':
            $enregGeom->dessine($_POST['valId'], $_POST['geom']);
            $data = 'Géométrie dessinée avec succès';
            die('{success: true, data: "' . $data . '"}');
            break;
        case 'Effacer':
            $enregGeom->efface($_POST['valId']);
            $data = 'Géométrie effacée avec succès';
            die('{success: true, data: "' . $data . '"}');
            break;        
    }
    unset($enregGeom);
?>