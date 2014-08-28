//Variables globales utilisées pour gérer la carte
var donnees, coucheEditable;

Ext.onReady(function() {
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Itinéraires', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                fillColor: 'blue',
                strokeColor: 'blue',
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
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outil de dessin de la géométrie
    var	btnDessinPolyligne = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Path, {
        title: 'Dessiner une ligne',
        displayClass: 'olControlDrawLine',
        featureAdded: dessiner
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
        btnDessinPolyligne
    ]);
    //Entrepôt des données (géométries également)
    donnees = new GeoExt.data.FeatureStore({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1Itineraire.php?id=' + GetParam('id'),
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
        title: "Dessiner l'itinéraire",
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
                table: 'flore.itineraire',
                chId: 'iti_id',
                valId: GetParam('id'),
                seqSerial: 'flore.itineraire_iti_id_seq',
                chGeom: 'iti_geom',
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
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir enregistrer l'itinéraire dessiné ?",
        function(btn) {dessine(btn, feature);});
}

//Effacement
function efface(btn) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Effacer',
                table: 'flore.itineraire',
                chId: 'iti_id',
                valId: GetParam('id'),
                chGeom: 'iti_geom',
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
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir effacer l''itinéraire sélectionné ?", efface);
}

//Zoom sur la géométrie
function zoomerGeometrie() {
    // cadrage sur l'étendue paramétrée par défaut
    carte.moveTo(new OpenLayers.LonLat(CST_center[0], CST_center[1]), CST_zoom);
    var selection = coucheEditable.features;
    if (selection.length > 0) {
        if (selection[0].geometry) {
            carte.zoomToExtent(selection[0].geometry.getBounds());
        }
    }
}