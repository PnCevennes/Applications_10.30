//Variables globales utilisées pour gérer la carte
var donnees, coucheEditable;

Ext.onReady(function() {
    //Légende
    var regles = [
        new OpenLayers.Rule({
            title: 'Vautour moine',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Aegypius monachus'
            }),
            symbolizer: {
                fillColor: '#FF0000',
                strokeColor: '#FF0000',
                graphicZIndex: 10
            }
        }),
        new OpenLayers.Rule({
            title: 'Aigle royal',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Aquila chrysaetos'
            }),
            symbolizer: {
                fillColor: 'orange',
                strokeColor: 'orange',
                graphicZIndex: 9
            }
        }),
        new OpenLayers.Rule({
            title: 'Aigle botté',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Hieraaetus pennatus'
            }),
            symbolizer: {
                fillColor: '#FF6A00',
                strokeColor: '#FF6A00',
                graphicZIndex: 8
            }
        }),
        new OpenLayers.Rule({
            title: 'Aigle de Bonelli',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Hieraaetus fasciatus'
            }),
            symbolizer: {
                fillColor: 'maroon',
                strokeColor: 'maroon',
                graphicZIndex: 7
            }
        }),
        new OpenLayers.Rule({
            title: 'Vautour percnoptère',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Neophron percnopterus'
            }),
            symbolizer: {
                fillColor: '#0094FF',
                strokeColor: '#0094FF',
                graphicZIndex: 6
            }
        }),
        new OpenLayers.Rule({
            title: 'Circaète Jean-le-Blanc',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Circaetus gallicus'
            }),
            symbolizer: {
                fillColor: '#B200FF',
                strokeColor: '#B200FF',
                graphicZIndex: 5
            }
        }),
        new OpenLayers.Rule({
            title: 'Vautour fauve',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Gyps fulvus'
            }),
            symbolizer: {
                fillColor: '#00FFFF',
                strokeColor: '#00FFFF',
                graphicZIndex: 4
            }
        }),
        new OpenLayers.Rule({
            title: 'Faucon pélerin',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Falco peregrinus'
            }),
            symbolizer: {
                fillColor: '#00FF90',
                strokeColor: '#00FF90',
                graphicZIndex: 3
            }
        }),
        new OpenLayers.Rule({
            title: 'Hibou grand-duc',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: 'Bubo bubo'
            }),
            symbolizer: {
                fillColor: '#0026FF',
                strokeColor: '#0026FF',
                graphicZIndex: 2
            }
        }),
        new OpenLayers.Rule({
            title: 'Vide',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'esp_genre_espece',
                value: null
            }),
            symbolizer: {
                fillColor: 'black',
                strokeColor: 'black',
                graphicZIndex: 1
            }
        })
    ];
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Périmètre de quiétude', {
        styleMap: new OpenLayers.StyleMap({
            'default': new OpenLayers.Style(null, {rules: regles})
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outil de dessin de la géométrie
    var	btnDessinPolygone = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Polygon, {
        title: 'Dessiner',
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
        btnDessinPolygone        
    ]);
    //Entrepôt des données (géométries également)
    donnees = new GeoExt.data.FeatureStore({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gj1PerimQuiet.php?id=' + GetParam('id'),
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
        title: 'Dessiner le périmètre de quiétude',
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
                table: 'protocole_rapace.perimetre_quietude',
                chId: 'qtd_id',
                valId: GetParam('id'),
                seqSerial: 'protocole_rapace.perimetre_quietude_qtd_id_seq',
                chGeom: 'qtd_geom',
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
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir enregistrer le périmètre de quiétude dessiné ?",
        function(btn) {dessine(btn, feature);});
}

//Effacement
function efface(btn) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestEnregGeom.php',
            params: {
                action: 'Effacer',
                table: 'protocole_rapace.perimetre_quietude',
                chId: 'qtd_id',
                valId: GetParam('id'),
                chGeom: 'qtd_geom',
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
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir effacer le périmètre de quiétude sélectionné ?", efface);
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
