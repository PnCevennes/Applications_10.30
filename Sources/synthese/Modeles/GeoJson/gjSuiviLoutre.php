<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgFaune.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';

    $cnxPgFaune = new CnxPgFaune();
    $req = 'SELECT id, cours_eau, lieu_dit, n_1991, n_1992, n_1993, n_1994, n_1995,
       n_1996, n_1997, n_1998, n_1999, n_2000, n_2001, n_2002, n_2003,
       n_2004, n_2005, longitude, latitude, st_asgeojson, gid
       FROM mammifere.v_wm_suivi_loutre WHERE ' . $where . ' AND ' .
        $and . $orderLimit;
    $rs = $cnxPgFaune->executeSql($req);
    $rsTot = $cnxPgFaune->executeSql('SELECT COUNT(gid) FROM mammifere.v_wm_suivi_loutre
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
