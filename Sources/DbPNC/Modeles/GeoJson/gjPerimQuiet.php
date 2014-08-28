<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgDbPNC.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';
    $cnxPgDbPNC = new CnxPgDbPNC();
    $req = 'SELECT * FROM protocole_rapace.perimetres_de_quietude WHERE ' . $where .
        ' AND ' . $and . $orderLimit;
    $rs = $cnxPgDbPNC->executeSql($req);
    $rsTot = $cnxPgDbPNC->executeSql('SELECT COUNT(qtd_id) FROM protocole_rapace.perimetres_de_quietude WHERE ' .
        $where . ' AND ' . $and);
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
    unset($cnxPgDbPNC);
?>
