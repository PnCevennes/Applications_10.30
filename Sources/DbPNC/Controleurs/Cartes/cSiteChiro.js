//Variables globales utilisées pour gérer la carte
var donnees, coucheEditable;

Ext.onReady(function() {
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Sites Chiro', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2,
                strokeWidth: 4,
                pointRadius: 8 // nécessaire pour afficher le point
            },
            select: {
                fillColor: 'yellow',
                strokeColor: 'yellow'
            }
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outil de dessin de la géométrie
    var	btnDessinPoint = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Point, {
        title: 'Dessiner',
        displayClass: 'olControlDrawPt',
        featureAdded: function (feature) {dessiner(feature, 'sit_geom');}
    });
    //Outil d'effacement de la géométrie
    var	btnGommeGeom = new OpenLayers.Control.SelectFeature(coucheEditable, {
        title: 'Gommer',
        displayClass: 'olControlErase',
        onSelect: effacer
    });
     //Outil de zoom sur la géométrie
    var btnZoomGeom = new OpenLayers.Control.Button({
        title: 'Recadrer',
        trigger: zoomerGeometrie,
        displayClass: 'olControlZoomSelection'
    });
    //Complément de la barre d'outils
    barreOutils.addControls([
        btnZoomGeom,
        btnGommeGeom,
        btnDessinPoint
    ]);
    //Entrepôt des données (géométries également)
    donnees = new GeoExt.data.FeatureStore({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1SiteChiro.php?id=' + GetParam('id'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    //Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        title: 'Dessiner le site Chiro',
        map: carte,
        border: false,
        items: [{
            xtype: 'gx_zoomslider', // barre de niveaux de zoom
            vertical: true,
            height: 100,
            y: 10
        }]
    });
    //Fenêtre d'affichage
    var fenetreCartoGrille = new Ext.Viewport({
        items: [cartePanel]
    });
    donnees.load({callback: zoomerGeometrie});
})

//Dessin
function dessine(btn, feature) {
    if (btn == 'yes') {
        var geometrie = feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
            new OpenLayers.Projection('EPSG:4326'));
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Dessiner',
                table: 'chiro.site',
                chId: 'sit_id',
                valId: GetParam('id'),
                seqSerial: 'chiro.site_sit_id_seq',
                chGeom: 'sit_geom',
                geom: geometrie,
                epsg: 27572
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        donnees.reload(); // rechargement de la couche pour mettre à jour le dessin
                    }
                    else {
                        Ext.MessageBox.show({
                            fn: function() {donnees.reload();}, // rechargement de la carte pour annuler le dessin en cours
                            title: obj.errorMessage,
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
    }
    else {
        donnees.reload(); // rechargement de la carte pour annuler le dessin en cours
    }
}
function dessiner(feature) {
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir enregistrer le site Chiro dessiné ?",
        function(btn) {dessine(btn, feature);});
}

//Effacement
function efface(btn) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Effacer',
                table: 'chiro.site',
                chId: 'sit_id',
                valId: GetParam('id'),
                chGeom: 'sit_geom',
                epsg: 4326
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        donnees.reload(); // rechargement de la couche pour mettre à jour le dessin
                    }
                    else {
                        Ext.MessageBox.show({
                            title: obj.errorMessage,
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
    }
}
function effacer() {
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir effacer le site Chiro sélectionné ?", efface);
}

//Zoom sur la géométrie
function zoomerGeometrie() {
    // cadrage sur l'étendue paramétrée par défaut
    var echelleZoom = carte.zoom;
    carte.moveTo(new OpenLayers.LonLat(CST_center[0], CST_center[1]), CST_zoom);
    var selection = coucheEditable.features;
    if (selection.length > 0) {
        if (selection[0].geometry) {
            var fenetreZoom = selection[0].geometry.getBounds();
            var centreXY = fenetreZoom.getCenterLonLat();
            if (centreXY.lon != 0 && centreXY.lat != 0) {
                carte.moveTo(centreXY, echelleZoom); // sinon simple recentrage sur la géométrie
                // si seuil de zoom non atteint
                if (carte.zoom < CST_seuilZoomSelection) {
                    carte.zoomTo(CST_seuilZoomSelection); // alors zoom en complément du recentrage
                }
            }
        }
    }
}
