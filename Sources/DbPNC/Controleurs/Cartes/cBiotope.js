//Variables globales utilisées pour gérer la carte
var donnees, donneesZpr, coucheEditable, calqueZpr;

Ext.onReady(function() {
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Biotopes', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2,
                strokeWidth: 4,
                pointRadius: 8 // nécessaire pour afficher les vertices en mode édition
            },
            select: {
                fillColor: 'yellow',
                strokeColor: 'yellow'
            }
        })
    });
    //Calque de la zone de prospection en cours
    calqueZpr = new OpenLayers.Layer.Vector('Zone de prospection', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                fillColor: 'blue',
                strokeColor: 'blue',
                strokeWidth: 4,
                fillOpacity: 0.2
            }
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable, calqueZpr]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outils de dessin de la géométrie
    var	btnDessinPoint = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Point, {
        title: 'Dessiner un point',
        displayClass: 'olControlDrawPt',
        featureAdded: dessiner
    });
    var	btnDessinPolyligne = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Path, {
        title: 'Dessiner une ligne',
        displayClass: 'olControlDrawLine',
        featureAdded: function(feature) {
            feature.geometry = new OpenLayers.Geometry.MultiLineString(feature.geometry);
            dessiner(feature);
        }
    });
    var	btnDessinPolygone = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Polygon, {
        title: 'Dessiner un polygone',
        displayClass: 'olControlDrawPolygon',
        featureAdded: function(feature) {
            feature.geometry = new OpenLayers.Geometry.MultiPolygon(feature.geometry);
            dessiner(feature);
        }
    });
    //Outil de modification des sommets de la géométrie
    var	btnModifGeom = new OpenLayers.Control.ModifyFeature(coucheEditable, {
        title: 'Modifier',
        displayClass: 'olControlModifyVertexes',
        onModificationEnd: function(feature) {
            if (btnModifGeom.modified) {
                dessiner(feature);
            }
        }
    });
    //Outil de translation de la géométrie
    var	btnGlissGeom = new OpenLayers.Control.DragFeature(coucheEditable, {
        title: 'Translater',
        displayClass: 'olControlDrag',
        onComplete: dessiner
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
        btnGlissGeom,
        btnModifGeom,
        btnDessinPolygone,
        btnDessinPolyligne,
        btnDessinPoint
    ]);
    //Entrepôts des données (géométries également)
    donnees = new GeoExt.data.FeatureStore({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1Biotope.php?id=' + GetParam('id'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    donneesZpr = new GeoExt.data.FeatureStore({
        layer: calqueZpr,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1Prospect.php?id=' + GetParam('zpr_id'),
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
        title: 'Dessiner le biotope',
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
    donneesZpr.load({callback: function() {donnees.load({callback: zoomerGeometrie});}});
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
                table: 'flore.biotope',
                chId: 'bio_id',
                valId: GetParam('id'),
                seqSerial: 'flore.biotope_bio_id_seq',
                chGeom: 'bio_geom',
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
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir enregistrer le biotope dessiné ?",
        function(btn) {dessine(btn, feature);});
}

//Effacement
function efface(btn) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Effacer',
                table: 'flore.biotope',
                chId: 'bio_id',
                valId: GetParam('id'),
                chGeom: 'bio_geom',
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
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir effacer le biotope sélectionné ?", efface);
}

//Zoom sur la géométrie
function zoomerGeometrie() {
    // cadrage sur l'étendue paramétrée par défaut voir sur celle de la zone de prospection du biotope
    var echelleZoom = carte.zoom;
    carte.moveTo(new OpenLayers.LonLat(CST_center[0], CST_center[1]), CST_zoom);
    var selection = calqueZpr.features;
    if (selection.length > 0) {
        if (selection[0].geometry) {
            carte.zoomToExtent(selection[0].geometry.getBounds());
        }
    }
    selection = coucheEditable.features;
    if (selection.length > 0) {
        if (selection[0].geometry) {
            var fenetreZoom = selection[0].geometry.getBounds();
            // si une fenêtre de zoom existe
            if (fenetreZoom.getHeight() != 0 && fenetreZoom.getWidth != 0) {
                carte.zoomToExtent(fenetreZoom); // alors zoom sur l'emprise de la géométrie
            }
            else {
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
}
