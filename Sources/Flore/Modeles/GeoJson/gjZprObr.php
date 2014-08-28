<?php
    session_start();
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $cnxPgBd = new CnxPgBd();
    $req = "SELECT st_asgeojson(st_transform(zpr_geom, 4326)), zpr_id, zpr_nom,
        zpr_date, zpr_duree, zpr_num_j, zpr_cmt, obr_id, (obr_nom || ' ' || obr_prenom) 
        AS numerisat, obr_id FROM saisie.zone_prospection LEFT JOIN saisie.observateur
        USING(obr_id) WHERE zpr_id = " . $_GET['zpr_id'] . ' OR obr_id = ' .
        $_SESSION[APPLI]['numerisateur']['code'];
    $rs = $cnxPgBd->executeSql($req);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    $geomNull = 'null';
    $premiereFois = true;
    while ($tab = pg_fetch_assoc($rs)) {
        $geom = $tab['st_asgeojson'];
        unset($tab['st_asgeojson']);
        if ($premiereFois) {
            if ($geom) {
                $geoJson .= '{"geometry": ' . $geom . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
            else {
                $geoJson .= '{"geometry": ' . $geomNull . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
            $premiereFois = false;
        }
        else {
            if ($geom) {
                $geoJson .= ', {"geometry": ' . $geom . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
            else {
                $geoJson .= ', {"geometry": ' . $geomNull . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
        }
    }
    echo $geoJson . ']}';
    unset($cnxPgBd);
?>
