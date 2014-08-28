<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    require_once '../../../../Outils/FiltreGrille.php';
    require_once '../../Modeles/Classes/ClassBioFlo.php';

    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT st_asgeojson(st_transform(bio_geom, 4326)), biotope_flore.bio_id, bio_rq,
        bio_etiquette, bio_descriptif, gtm_code, gtm_libelle, biotope_flore.bio_flo_pente,
        biotope_flore.bio_flo_expo, bio_url_photo, bio_rq_photo, cd_cb, lb_cb97_fr, bio_flo_inventaire_partiel,
        cd_cb_lb_cb97_fr FROM saisie.biotope_flore JOIN saisie.tl_ent_zpr_ptc ON
        tl_ent_zpr_ptc.ent_id = biotope_flore.bio_id LEFT JOIN inpn.v_corine_biotope 
        USING(cd_cb) LEFT JOIN saisie.grand_type_milieu USING(gtm_code) WHERE ptc_id = ' .
        BioFlo::getValIdPtc() . ' AND zpr_id = ' . $_GET['zpr_id'] . $orderLimit;
    $rs = $cnxPgBd->executeSql($req);
    $rsTot = $cnxPgBd->executeSql('SELECT COUNT(biotope_flore.bio_id) FROM saisie.biotope_flore
        JOIN saisie.tl_ent_zpr_ptc ON tl_ent_zpr_ptc.ent_id = biotope_flore.bio_id
        LEFT JOIN saisie.grand_type_milieu USING(gtm_code) WHERE ptc_id = ' . BioFlo::getValIdPtc() .
        ' AND zpr_id = ' . $_GET['zpr_id']);
    $tot = pg_result($rsTot, 0, 0);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    // cas particulier des géométries "NULL"
    $geomNull = '{"type": "MultiPolygon", "coordinates": []}'; // obligatoire pour SelectFeature (OpenLayers) et LegendPanel (GeoExt)
    $premiereFois = true;
    while ($tab = pg_fetch_assoc($rs)) {
        $geom = $tab['st_asgeojson'];
        // nécessaire pour le FeatureReader.js bidouillé avec le rajout de la ligne "this.totalRecords = values.st_asgeojson"
        // pour faire fonctionner correctement le PagingToolbar avec le PageSizer
        $tab['st_asgeojson'] = $tot;
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
