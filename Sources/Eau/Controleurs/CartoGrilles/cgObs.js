//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheEditable, idSelection = new Array(),
    listMeteo_3j = [], region = CST_region;

Ext.onReady(function() {
    // initialisation des listes déroulantes exhaustives
    comboMeteo_3j.store.load({
        callback: function() {
            // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
            basculeEcran(CST_region);
        }
    });
});

function basculeEcran(sens) {
    //Légende
    var regles = [
        new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'noms',
                value: null
            }),
            symbolizer: {
                fillColor: 'blue',
                strokeColor: 'blue'
            }
        }),
        new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                property: 'noms',
                value: null
            }),
            symbolizer: {
                fillColor: 'cyan',
                strokeColor: 'cyan'
            }
        }),
        // nécessaire pour afficher les vertices notamment
        new OpenLayers.Rule({
            symbolizer: {
                strokeWidth: 3
            }
        })
    ];
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Observation', {
        styleMap: new OpenLayers.StyleMap({
            'default': new OpenLayers.Style(null, {rules: regles}),
            select: {
                fillColor: 'yellow',
                strokeColor: 'yellow'
            }
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable]);
    //Outils de dessin des géométries
    var btnDessinPoint = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Point, {
        title: 'Dessiner',
        displayClass: 'olControlDrawPt',
        featureAdded: ajouter
    });
    //Outil de translation des géométries
    var	btnGlissGeom = new OpenLayers.Control.DragFeature(coucheEditable, {
        title: 'Translater',
        displayClass: 'olControlDrag',
        onComplete: redessiner
    });
    //Outil de sélection des géométries
    var btnSelGeom = new OpenLayers.Control.SelectFeature(coucheEditable, {
        title: 'Sélectionner',
        displayClass: 'olControlMultiSelectFeature',
        toggleKey: 'ctrlKey',
        multipleKey: 'ctrlKey',
        box: true
    });
    btnSelGeom.handler = new OpenLayers.Handler.Click(btnSelGeom, { // événement sur le double-click de la géométrie
            dblclick: modifier                                      // sélectionné pour ouvrir directement le formulaire
        }, {
            'double': true
        }
    );
    //Outil de zoom sur la sélection
    var btnZoomSel = new OpenLayers.Control.Button({
        title: 'Cadrer sur la sélection',
        trigger: zoomerSelection,
        displayClass: 'olControlZoomSelection'
    });
    //Complément de la barre d'outils
    barreOutils.addControls([
        btnZoomSel,
        btnGlissGeom,
        btnDessinPoint,
        btnSelGeom
    ]);
    //Entrepôt des données (géométries également)
    var lecteurDonnees = new GeoExt.data.FeatureReader({        
        fields: [{name: 'st_asgeojson'},
            {name: 'id_obs'},
            {name: 'date_obs'},
            {name: 'meteo_3j'},
            {name: 'gid'},
            {name: 'noms'},
            {name: 'longitude'},
            {name: 'latitude'},
            {name: 'remarque_obs'},
            {name: 'numerisat'},
            {name: 'heure_obs'},
            {name: 'm_e_s'},
            {name: 'd_c_o'},
            {name: 'd_b_o'},
            {name: 'c_o_t'},
            {name: 'nitrate'},
            {name: 'surgent'},
            {name: 'temperature'},
            {name: 'ph'},
            {name: 'conductivite'},
            {name: 'o2_dissoud'},
            {name: 'saturation_o2'},
            {name: 'mode_mesure_debit'},
            {name: 'mesure_debit'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjObs.php',
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        }),
        reader: lecteurDonnees,
        remoteSort: true,
        remoteGroup: true,
        sortInfo: {field: 'id_obs', direction: 'DESC'}, // tri par ordre décroissant de création
        listeners: {
            beforeload: function(store, options) {
                options.params.limit = 'AUCUNE'; // affichage de tous les enregistrements
                options.callback = function(rs) {
                    barrePaginat.setPageSize(rs.length, false);
                    // correction du bug d'affichage de la barre de pagination
                    barrePaginat.afterTextItem.setText('sur 1');
                    barrePaginat.next.setDisabled(true);
                    barrePaginat.last.setDisabled(true);
                }
            }
        }
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'id_obs', menuItemCfgs : {emptyText: ''}},
            {type: 'date', dataIndex: 'date_obs', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'list', dataIndex: 'meteo_3j', options: tableauValeurs(comboMeteo_3j.store)},
            {type: 'numeric', dataIndex: 'gid', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'noms', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'longitude', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'latitude', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'remarque_obs', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'numerisat', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'list', dataIndex: 'heure_obs', options: listeValeurs(Ext.getCmp('heure_obs'))},
            {type: 'numeric', dataIndex: 'm_e_s', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'd_c_o', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'd_b_o', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'c_o_t', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'nitrate', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'surgent', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'temperature', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'ph', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'conductivite', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'o2_dissoud', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'saturation_o2', menuItemCfgs : {emptyText: ''}},
            {type: 'list', dataIndex: 'mode_mesure_debit', options: ['Dilution', 'Débimètre']},
            {type: 'numeric', dataIndex: 'mesure_debit', menuItemCfgs : {emptyText: ''}}
        ]
    });
    
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'id_obs', header: 'id_obs', hidden: true},
            {dataIndex: 'date_obs', header: 'Date obs.', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'meteo_3j', header: 'Méteo (3j)'},
            {dataIndex: 'gid', header: 'gid', hidden: true},
            {dataIndex: 'noms', header: 'Station', hidden: true},
            {dataIndex: 'longitude', header: 'Longitude', hidden: true},
            {dataIndex: 'latitude', header: 'Latitude', hidden: true},
            {dataIndex: 'remarque_obs', header: 'Rq obs.', hidden: true},
            {dataIndex: 'numerisat', header: 'Numérisateur', hidden: true},
            {dataIndex: 'heure_obs', header: 'Heure obs.', renderer: timeRenderer, hidden: true},
            {dataIndex: 'm_e_s', header: 'M.E.S.'},
            {dataIndex: 'd_c_o', header: 'D.C.O.'},
            {dataIndex: 'd_b_o', header: 'D.B.O.'},
            {dataIndex: 'c_o_t', header: 'C.O.T.'},
            {dataIndex: 'nitrate', header: 'Nitrates'},
            {dataIndex: 'surgent', header: 'Surgent'},
            {dataIndex: 'temperature', header: 't (°C)'},
            {dataIndex: 'ph', header: 'pH'},
            {dataIndex: 'conductivite', header: 'Conduct.'},
            {dataIndex: 'o2_dissoud', header: 'O2 dissoud'},
            {dataIndex: 'saturation_o2', header: 'Saturat. O2'},
            {dataIndex: 'mode_mesure_debit', header: 'Mode  mesure débit'},
            {dataIndex: 'mesure_debit', header: 'Mesure débit'}
        ]
    });
    //Barre de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Basculer écran',
                tooltip: "Basculer l'écran",
                handler: basculerEcran,
                iconCls: 'switch'
            }, '-', {
                text: 'Modifier',
                tooltip: "Modifier l'observation sélectionnée",
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: "Supprimer l'observation sélectionnée",
                handler: supprimer,
                iconCls: 'delete'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            }, '-', {
                text: 'Filtrer emprise',
                tooltip: 'Filtrer sur les limites de la carte ("Actualiser la page" pour annuler)',
                handler: filtrerSurEmprise,
                iconCls: 'extent'
            }, '-', {
                text: 'Filtrer sélection',
                tooltip: 'Filtrer sur la sélection ("Actualiser la page" pour annuler)',
                handler: filtrerSelection,
                iconCls: 'filter_selected'
            }, '-', {
                text: 'Mémoriser sélection',
                tooltip: 'Mémoriser la sélection en cours',
                handler: sauverSelection,
                iconCls: 'save_selected'
            }, '-', {
                text: 'Appliquer sélection',
                tooltip: 'Appliquer la sélection en mémoire',
                handler: restaurerSelection,
                iconCls: 'apply_selected'
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grilleObsEau', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrille,
        cm: configCols,
        autoScroll: true,
        region: 'center',
        plugins: [filtres, 'autosizecolumns'],
        stripeRows: true,
        trackMouseOver: false,
        listeners: {rowdblclick: modifier}
    });
    //Barre de pagination
    barrePaginat = new Ext.PagingToolbar({
        region: 'south',
        autoHeight: true,
        store: donneesGrille,
        displayInfo: true,
        plugins: [filtres, new Ext.ux.grid.PageSizer({comboCfg: {disabled: true}})],
        items: ['-', {
                text: 'Se déconnecter',
                handler: deconnecter,
                iconCls: 'deconnection',
                tooltip: "Se déconnecter de l'application"
            }
        ]
    });
    // Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: 'carteObsEau', // unique pour conserver la configuration de la carte
        map: carte,
        region: sens,
        split: true,
        height: 400, // affichage en mode horizontal
        width: 600, // affichage en mode vertical
        items: [{
            xtype: 'gx_zoomslider', // barre de niveaux de zoom
            vertical: true,
            height: 100,
            y: 10
        }],
        center: CST_center,
        zoom: CST_zoom
    });
    //Panel de la grille
    var grillePanel = new Ext.Panel({
        layout: 'border',
        autoheight: true,
        region: 'center',
        items: [barreMenu, grille, barrePaginat]
    });
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartePanel, grillePanel]
    });
    donneesGrille.load({
        params: {
            limit: 'AUCUNE' // affichage de tous les enregistrements
        },
        callback: function(rs) {
            barrePaginat.setPageSize(rs.length, false);
            // correction du bug d'affichage de la barre de pagination
            barrePaginat.afterTextItem.setText('sur 1');
            barrePaginat.next.setDisabled(true);
            barrePaginat.last.setDisabled(true);
        }
    });
}

//Ajout
function ajouter(feature) {
    ajoute(feature.geometry.transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')));
}

//Modification
function modifier() {
    if (grille.selModel.getCount() == 1) {
        modifie();
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une observation et une seule').setIcon(Ext.MessageBox.WARNING);
    }
}
function redessiner(feature) {
    var geom = feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
        new OpenLayers.Projection('EPSG:4326'));
    Ext.Ajax.request({
        url: '../Controleurs/Gestions/GestObs.php',
        params: {
            action: 'Redessiner',
            id_obs: feature.attributes['id_obs'],
            geometrie: geom,
            longitude: geom.x,
            latitude: geom.y
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                // rafraîchissement de la grille pour les coordonnées x et y dans tous les cas
                if (obj.success) {
                    donneesGrille.reload();
                }
                else {
                    Ext.MessageBox.show({
                        fn: function() {donneesGrille.reload();}, // rechargement de la carte pour annuler le dessin en cours
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

//Suppression
function supprimer() {
    var nbSuppr = grille.selModel.getCount();
    if (nbSuppr > 0) {
        if (nbSuppr == 1) {
            Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir supprimer l'observation sélectionnée ?", supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' observations sélectionnées ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une observation').setIcon(Ext.MessageBox.WARNING);
    }
}
function rafraichieAffichage() {
    donneesGrille.reload({
        callback: function(rs) {
            // gestion du cas particulier de la suppression de tous les éléments de la dernière page
            if ((rs.length == 0) && (barrePaginat.cursor > 0)) {
                barrePaginat.movePrevious(); // correction du bug d'affichage de la barre de pagination
            }
        }
    })
}
function supprime(btn) {
    if (btn == 'yes') {
        var nbSuppr = grille.selModel.getCount();
        if (nbSuppr == 1) {
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestObs.php',
                params: {
                    action: 'Supprimer',
                    id_obs: grille.selModel.getSelected().data['id_obs']
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            rafraichieAffichage();
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
        else {
            var selection = grille.selModel.getSelections();
            var listId = selection[0].data['id_obs'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['id_obs'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestObs.php',
                params: {
                    action: 'SupprimerListeId',
                    listId: listId
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            rafraichieAffichage();
                        }
                        else {
                            Ext.MessageBox.show({
                                fn: function() {
                                    if (obj.errorMessage == 'Opérations de suppression partielles') {
                                        rafraichieAffichage();
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
    }
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['id_obs'] = Ext.data.Types.INT;
    types['date_obs'] = Ext.data.Types.DATE;
    types['gid'] = Ext.data.Types.INT;
    types['longitude'] = Ext.data.Types.FLOAT;
    types['latitude'] = Ext.data.Types.FLOAT;
    types['m_e_s'] = Ext.data.Types.FLOAT;
    types['d_c_o'] = Ext.data.Types.FLOAT;
    types['d_b_o'] = Ext.data.Types.FLOAT;
    types['c_o_t'] = Ext.data.Types.FLOAT;
    types['nitrate'] = Ext.data.Types.FLOAT;
    types['surgent'] = Ext.data.Types.FLOAT;
    types['ph'] = Ext.data.Types.FLOAT;
    types['conductivite'] = Ext.data.Types.FLOAT;
    types['temperature'] = Ext.data.Types.FLOAT;
    types['o2_dissoud'] = Ext.data.Types.FLOAT;
    types['saturation_o2'] = Ext.data.Types.FLOAT;
    types['mesure_debit'] = Ext.data.Types.FLOAT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND id_obs';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['id_obs'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['id_obs'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['id_obs'];
            }
            filtreSel += ')';
        }
        donneesGrille.reload({
            params: {
                filtreSel: filtreSel,
                start: 0,
                limit: nbSel
            },
            callback: function() {grille.selModel.selectAll();}
        });
    }
}

//Zoom sur les éléments sélectionnés
function zoomerSelection() {
    var selection = coucheEditable.selectedFeatures;
    var nbSel = selection.length;
    if (nbSel > 0) {
        var fenetreZoom = new OpenLayers.Bounds();
        for (var i = 0; i < nbSel; i++) {
            if (selection[i].geometry) {
                fenetreZoom.extend(selection[i].geometry.getBounds());
            }
        }
        // si une fenêtre de zoom existe
        if (fenetreZoom.getHeight() != 0 && fenetreZoom.getWidth != 0) {
            carte.zoomToExtent(fenetreZoom); // alors zoom sur l'emprise de la sélection
        }
        else {
            var centreXY = fenetreZoom.getCenterLonLat();
            if (centreXY.lon != 0 && centreXY.lat != 0) {
                carte.moveTo(centreXY); // sinon simple recentrage de la carte
                // si seuil de zoom non atteint
                if (carte.zoom < CST_seuilZoomSelection) {
                    carte.zoomTo(CST_seuilZoomSelection); // alors zoom en complément du recentrage
                }
            }
        }
    }
}

//Sauvegarde des éléments sélectionnés en mémoire
function sauverSelection() {
    idSelection = [];
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        idSelection[i] = selection[i].data['id_obs'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['id_obs']) == -1) {
           grille.selModel.deselectRow(i);
        }
    }
}

//Filtrage sur l'emprise
function filtrerSurEmprise() {
    var emprise = carte.getExtent().toGeometry().transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326'));
    donneesGrille.reload({
        params: {
            filtreEmprise: emprise,
            chGeom: 'SAISIE.V_SAISIE_OBSERVATION.geometrie',
            epsg: 4326,
            limit: 'AUCUNE' // affichage de tous les enregistrements
        },
        callback: function(rs) {
            barrePaginat.setPageSize(rs.length, false);
            // correction du bug d'affichage de la barre de pagination
            barrePaginat.afterTextItem.setText('sur 1');
            barrePaginat.next.setDisabled(true);
            barrePaginat.last.setDisabled(true);
        }
    });
}

//Bascule de l'écran
function basculerEcran() {
    // obligatoire pour réinitialiser l'affichage correctement
    fenetreCartoGrille.destroy();
    barreOutils.controls.remove(barreOutils.controls[barreOutils.controls.length - 1]);
    barreOutils.controls.remove(barreOutils.controls[barreOutils.controls.length - 1]);
    barreOutils.controls.remove(barreOutils.controls[barreOutils.controls.length - 1]);
    barreOutils.controls.remove(barreOutils.controls[barreOutils.controls.length - 1]);
    carte.removeLayer(coucheEditable);
    if (region == 'north') {
        region = 'west';
        basculeEcran('west'); // écran divisé verticalement
    }
    else {
        region = 'north';
        basculeEcran('north'); // écran divisé horizontalement
    }
}

//Gestion de la déconnection
function deconnecter() {
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir vous déconnecter ?", deconnecte);
}
function deconnecte(btn) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestions/GestSession.php',
            params: {
                action: 'Deconnecter'
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        Ext.MessageBox.show({
                            title: 'Déconnection réussie',
                            fn: function() {document.location.href = 'vAuthent.php';},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                    else {
                        Ext.MessageBox.show({
                            title: obj.errorMessage,
                            fn: function() {document.location.href = 'vAuthent.php';},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        fn: function() {document.location.href = 'vAuthent.php';},
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
    }
}
