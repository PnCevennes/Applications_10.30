<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';
    require_once '../../Modeles/Filtres/fGrille.php';
    
    $cnxPgBd = new CnxPgBd();
    $req = "SELECT st_asgeojson(st_transform(zpr_geom, 4326)), zpr_id, zpr_nom, zpr_categorie,
        zpr_date, zpr_duree, zpr_num_j, zpr_cmt, obr.obr_id, (obr.obr_nom || ' ' || obr.obr_prenom)
        AS observateur, numerisateur, (num.obr_nom || ' ' || num.obr_prenom)
        AS numerisat, coalesce(zpr_affectee, false) as zpr_affectee, cpt_enjeux,
        cpt_station, cpt_lichen, cpt_flore, zpr_cibles, saisie.liste_cibles(zpr_cibles)
        AS cibles FROM saisie.zone_prospection LEFT JOIN saisie.observateur obr USING(obr_id)
        LEFT JOIN saisie.observateur num ON numerisateur = num.obr_id
        LEFT JOIN saisie.v_zpr_affectees USING(zpr_id) LEFT JOIN saisie.v_zpr_bilan
        USING(zpr_id) WHERE " . $where . ' AND ' . $and . $orderLimit;
    $rs = $cnxPgBd->executeSql($req);
    $rsTot = $cnxPgBd->executeSql('SELECT COUNT(zpr_id) FROM saisie.zone_prospection
        LEFT JOIN saisie.observateur obr USING(obr_id)
        LEFT JOIN saisie.observateur num ON numerisateur = num.obr_id
        LEFT JOIN saisie.v_zpr_affectees USING(zpr_id) LEFT JOIN saisie.v_zpr_bilan
        USING(zpr_id) WHERE ' . $where .
        ' AND ' . $and);
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
