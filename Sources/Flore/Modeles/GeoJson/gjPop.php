<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    require_once '../../Modeles/Classes/ClassPop.php';

    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT st_asgeojson(st_transform(pop_geom, 4326)), genre, espece FROM
        ONLY saisie.population JOIN saisie.tl_ent_zpr_ptc ON tl_ent_zpr_ptc.ent_id =
        population.pop_id JOIN inpn.v_taxref_protocole_enjeux USING(cd_nom) WHERE
        ptc_id = ' . Pop::getValIdPtc() . ' AND zpr_id <> ' . $_GET['zpr_id'];
    $rs = $cnxPgBd->executeSql($req);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    // cas particulier des géométries "NULL"
    $geomNull = '{"type": "MultiPolygon", "coordinates": []}'; // obligatoire pour SelectFeature (OpenLayers) et LegendPanel (GeoExt)
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
