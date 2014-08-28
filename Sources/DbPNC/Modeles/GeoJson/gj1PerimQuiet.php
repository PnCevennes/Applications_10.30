<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgDbPNC.php';
    $cnxPgDbPNC = new CnxPgDbPNC();
    $req = 'SELECT st_asgeojson(st_transform(qtd_geom, 4326)), esp_genre_espece,
        qtd_id FROM protocole_rapace.perimetres_de_quietude WHERE qtd_id = ' . $_GET['id'];
    $rs = $cnxPgDbPNC->executeSql($req);
    $tot = 1;
    $geoJson = '{"type": "FeatureCollection", "features": [';
    $geomNull = 'null';
    $premiereFois = true;
    $rs = $cnxPgDbPNC->executeSql($req);
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
