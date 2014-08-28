//Variables globales utilisées pour gérer la carte
var donnees, donneesMires, coucheEditable, coucheEditableMires;

Ext.onReady(function() {
    //Couche d'édition pour la prise de la photo en cours
    coucheEditable = new OpenLayers.Layer.Vector('Prises de photo', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeColor: 'black',
                graphicName: 'x',
                pointRadius: 8 // nécessaire pour afficher le point
            }
        })
    });
    //Couche d'édition pour la mire de la photo en cours
    coucheEditableMires = new OpenLayers.Layer.Vector('Mires de photo', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeColor: 'black',
                graphicName: 'square',
                pointRadius: 8 // nécessaire pour afficher le point
            }
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable, coucheEditableMires]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outils de dessin de la géométrie
    var	btnDessinPoint = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Point, {
        title: 'Dessiner la prise de la photo',
        displayClass: 'olControlDrawPt',
        featureAdded: function (feature) {dessiner(feature, 'pho_geom_prise');}
    });
    var	btnDessinPointMire = new OpenLayers.Control.DrawFeature(coucheEditableMires, OpenLayers.Handler.Point, {
        title: 'Dessiner la mire de la photo',
        displayClass: 'olControlDrawPt',
        featureAdded: function (feature) {dessiner(feature, 'pho_geom_mire');}
    });
    //Outils d'effacement de la géométrie
    var	btnGommeGeom = new OpenLayers.Control.SelectFeature(coucheEditable, {
        title: 'Gommer la prise de la photo',
        displayClass: 'olControlErase',
        onSelect:  function () {effacer('pho_geom_prise');}
    });
    var	btnGommeGeomMire = new OpenLayers.Control.SelectFeature(coucheEditableMires, {
        title: 'Gommer la mire de la photo',
        displayClass: 'olControlErase',
        onSelect: function () {effacer('pho_geom_mire');}
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
        btnGommeGeomMire,
        btnDessinPointMire,
        btnGommeGeom,
        btnDessinPoint
    ]);
    //Entrepôts des données (géométries également)
    donnees = new GeoExt.data.FeatureStore({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1Photo.php?id=' + GetParam('id'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    donneesMires = new GeoExt.data.FeatureStore({
        layer: coucheEditableMires,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1PhotoMire.php?id=' + GetParam('id'),
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
        title: 'Dessiner la prise et la mire de la photo',
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
    donnees.load({callback: function() {donneesMires.load({callback: zoomerGeometrie});}});
})

//Dessin
function dessine(btn, feature, chGeom) {
    if (btn == 'yes') {
        var geometrie = feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
            new OpenLayers.Projection('EPSG:4326'));
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Dessiner',
                table: 'flore.photo',
                chId: 'pho_id',
                valId: GetParam('id'),
                seqSerial: 'flore.photo_pho_id_seq',
                chGeom: chGeom,
                geom: geometrie,
                epsg: 27572
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        if (chGeom == 'pho_geom_prise')
                            donnees.reload(); // rechargement de la couche pour mettre à jour le dessin
                        else {
                            donneesMires.reload(); // rechargement de la couche pour mettre à jour le dessin
                        }
                    }
                    else {
                        Ext.MessageBox.show({
                            fn: function() {
                                if (chGeom == 'pho_geom_prise')
                                    donnees.reload(); // rechargement de la carte pour annuler le dessin en cours
                                else {
                                    donneesMires.reload(); // rechargement de la carte pour annuler le dessin en cours
                                }
                            },
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
        if (chGeom == 'pho_geom_prise')
            donnees.reload(); // rechargement de la carte pour annuler le dessin en cours
        else {
            donneesMires.reload(); // rechargement de la carte pour annuler le dessin en cours
        }
    }
}
function dessiner(feature, chGeom) {
    if (chGeom == 'pho_geom_prise')
        Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir enregistrer la prise de la photo dessinée ?",
            function(btn) {dessine(btn, feature, chGeom);});
    else {
        Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir enregistrer la mire de la photo dessinée ?",
            function(btn) {dessine(btn, feature, chGeom);});
    }
}

//Effacement
function efface(btn, chGeom) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Effacer',
                table: 'flore.photo',
                chId: 'pho_id',
                valId: GetParam('id'),
                chGeom: chGeom,
                epsg: 4326
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        if (chGeom == 'pho_geom_prise')
                            donnees.reload(); // rechargement de la couche pour mettre à jour le dessin
                        else {
                            donneesMires.reload(); // rechargement de la couche pour mettre à jour le dessin
                        }
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
function effacer(chGeom) {
    if (chGeom == 'pho_geom_prise')
        Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir effacer la prise de la photo sélectionnée ?",
            function(btn) {efface(btn, chGeom);});
    else {
        Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir effacer la mire de la photo sélectionnée ?",
            function(btn) {efface(btn, chGeom);});
    }
}

//Zoom sur la géométrie
function zoomerGeometrie() {
    // cadrage sur l'étendue paramétrée par défaut voir sur celle de la zone de prospection du biotope
    var echelleZoom = carte.zoom;
    var fenetreZoom = new OpenLayers.Bounds();
    carte.moveTo(new OpenLayers.LonLat(CST_center[0], CST_center[1]), CST_zoom);
    var selection = coucheEditable.features;
    if (selection.length > 0) {
        if (selection[0].geometry) {
            fenetreZoom.extend(selection[0].geometry.getBounds());            
        }
    }
    selection = coucheEditableMires.features;
    if (selection.length > 0) {
        if (selection[0].geometry) {
            fenetreZoom.extend(selection[0].geometry.getBounds());            
        }
    }
    // si une fenêtre de zoom existe
    if (fenetreZoom.getHeight() != 0 && fenetreZoom.getWidth != 0) {
        carte.zoomToExtent(fenetreZoom); // alors zoom sur l'emprise des géométries
    }
    else {
        var centreXY = fenetreZoom.getCenterLonLat();
        if (centreXY.lon != 0 && centreXY.lat != 0) {
            carte.moveTo(centreXY, echelleZoom); // sinon simple recentrage sur l'une des géométries
            // si seuil de zoom non atteint
            if (carte.zoom < CST_seuilZoomSelection) {
                carte.zoomTo(CST_seuilZoomSelection); // alors zoom en complément du recentrage
            }
        }
    }
}
