<?php
    //Fichier servant à filtrer la grille en cours    
    $epsg = (isset($_REQUEST['epsg']) && ($_REQUEST['epsg'] != null)) ? $_REQUEST['epsg'] : '';

    $chGeom = (isset($_REQUEST['chGeom'])) ?  $_REQUEST['chGeom'] : '';
    
    $filtreEmprise = (isset($_REQUEST['filtreEmprise']) && ($_REQUEST['filtreEmprise'] != null)) ? $_REQUEST['filtreEmprise'] : '';

    $and = '0 = 0'; // variable globale pour la clause "AND"
    
    // construction de la clause "AND"
    if (($chGeom != '') && ($epsg != '') && ($filtreEmprise != '')) {
        $and .= ' AND st_intersects('. $chGeom . ",  st_transform(ST_GeometryFromText('" . $filtreEmprise . "', 4326), " . $epsg . '))';
    }    

?>
