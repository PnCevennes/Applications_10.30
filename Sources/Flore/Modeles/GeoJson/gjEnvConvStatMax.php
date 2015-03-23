<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $cnxPgBd = new CnxPgBd();
    if (isset($_GET['bio_id'])) {
        $req = 'SELECT st_asgeojson(st_transform(sta_enveloppe_convexe_max, 4326)),
            bio_code, ' . "'(' || " . "COALESCE(bio_fiche, 'N.R.')" . " || ')'" . '
            AS bio_fiche FROM saisie.v_enveloppe_convexe_station_max JOIN saisie.station_flore
            USING(bio_id) WHERE bio_id = ' . $_GET['bio_id'];
    }
    else {
        $req = 'SELECT st_asgeojson(st_transform(sta_enveloppe_convexe_max, 4326)),
            bio_code, ' . "'(' || " . "COALESCE(bio_fiche, 'N.R.')" . " || ')'" . '
            AS bio_fiche FROM saisie.v_enveloppe_convexe_station_max JOIN saisie.station_flore
            USING(bio_id)';
    }
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
