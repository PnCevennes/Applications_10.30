<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';

    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT st_asgeojson(st_transform(pop_geom, 4326)), pop_etiquette, pop_id
        FROM saisie.v_pop_revue_station_maj WHERE bio_id = ' . $_GET['bio_id'];
    $rs = $cnxPgBd->executeSql($req);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    // cas particulier des géométries "NULL"
    $geomNull = null;
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