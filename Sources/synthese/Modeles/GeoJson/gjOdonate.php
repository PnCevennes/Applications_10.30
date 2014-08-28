<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgFaune.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';

    $cnxPgFaune = new CnxPgFaune();
    $req = 'SELECT gid, id_obs, auteur, structure, num_fiche, station, nom_com,
        lieu_dit, riviere, altitude, biotope, invod_1999, genre, sp, sous_sp, mf,
        m, f, la, ex, e, im, ad, te, ac, po, pr, au, st_asgeojson, date, code_insee,
        longitude, latitude FROM invertebre.v_wm_odonate WHERE ' . $where . ' AND ' .
        $and . $orderLimit;
    $rs = $cnxPgFaune->executeSql($req);
    $rsTot = $cnxPgFaune->executeSql('SELECT COUNT(gid) FROM invertebre.v_wm_odonate
        WHERE ' . $where . ' AND ' . $and);
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
    unset($cnxPgFaune);
?>
