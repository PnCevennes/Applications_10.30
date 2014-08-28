<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    require_once '../../Modeles/Classes/ClassBioFlo.php';
    
    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT st_asgeojson(st_transform(bio_geom, 4326)), bio_etiquette, COUNT(tax_id) FROM
        saisie.biotope_flore JOIN saisie.tl_ent_zpr_ptc ON tl_ent_zpr_ptc.ent_id = biotope_flore.bio_id
        LEFT JOIN saisie.taxon_flore ON biotope_flore.bio_id = taxon_flore.tax_bio_id WHERE ptc_id = ' .
        BioFlo::getValIdPtc() . ' AND zpr_id <> ' . $_GET['zpr_id'] . ' GROUP BY
        biotope_flore.bio_id, st_asgeojson, bio_etiquette';
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
