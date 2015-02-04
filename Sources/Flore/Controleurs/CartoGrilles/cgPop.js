//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheEditable, sensRegion = CST_region,
    calquePop, calqueZprObr, numerisat, numerisateur, numerisateur_droit, calqueGPX;

Ext.onReady(function() {
    Ext.Ajax.request({
        url: '../Modeles/Json/jVarSession.php',
        params: {
            varSession: 'infosNumerisateur'
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    numerisateur = obj.numerisateur;
                    numerisat = obj.numerisat;
                    numerisateur_droit = obj.numerisateur_droit;
                    // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
                    basculeEcran(sensRegion);
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
});

function basculeEcran(sens) {
    //Légende
    var reglesZP = [
        new OpenLayers.Rule({
            title: 'Ma ZP en cours',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'zpr_id',
                value: GetParam('zpr_id')
            }),
            symbolizer: {
                fillColor: 'green',
                strokeColor: 'green',
                fillOpacity: 0.2,
                graphicZIndex: 2
            }
        }),
        new OpenLayers.Rule({
            title: 'Mes autres ZP',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                property: 'zpr_id',
                value: GetParam('zpr_id')
            }),
            symbolizer: {
                fillColor: 'blue',
                strokeColor: 'blue',
                fillOpacity: 0.2,
                graphicZIndex: 1
            }
        })
    ];
    var reglesPop = [
        new OpenLayers.Rule({
            title: 'Autres populations',
            symbolizer: {
                fillColor: 'purple',
                strokeColor: 'purple',
                fillOpacity: 0.2
            }
        }),
        new OpenLayers.Rule({
            title: 'Populations en cours',
            symbolizer: {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2
            }
        })
    ];
    var legende = new GeoExt.VectorLegend({
        rules: reglesZP.concat(reglesPop),
        symbolType: 'Polygon'
    });
    //Couche d'édition des populations pour le protocole et la zone de prospection en cours
    coucheEditable = new OpenLayers.Layer.Vector('Populations en cours', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2,
                pointRadius: 6 // nécessaire pour afficher les vertices en mode édition
            },
            temporary: {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2,
                pointRadius: 6 // nécessaire pour afficher le vertices en mode création
            },
            select: {
                fillOpacity: 0.2,
                fillColor: 'yellow'
            }
        })
    });
    //Calque des zones de prospection de l'observateur FLORE connecté
    calqueZprObr = new OpenLayers.Layer.Vector('Mes ZP', {
        styleMap: new OpenLayers.StyleMap(new OpenLayers.Style(null, {rules: reglesZP})),
        rendererOptions: {zIndexing: true} // activation de l'ordre de superposition pour l'affichage des règles
    });
    //Calque des populations pour le protocole en cours mais pas pour la zone de prospection en cours
    calquePop = new OpenLayers.Layer.Vector('Autres populations', {
        styleMap: new OpenLayers.StyleMap({
            label: '${genre}\n\n${espece}',
            fontColor: 'pink',
            fontSize: '14px',
            fontWeight: 'bold',
            labelAlign: 'cm',
            fillColor: 'purple',
            strokeColor: 'purple',
            fillOpacity: 0.2,
            pointRadius: 6 // nécessaire pour afficher les géométries de type "POINT"
        })
    });
    //Calque du fichier GPX chargé
    calqueGPX = new OpenLayers.Layer.Vector('Fichier GPX chargé', {
        styleMap: new OpenLayers.StyleMap({
            label: 'N°\n\n${name}',
            fontColor: 'black',
            fontSize: '14px',
            fontWeight: 'bold',
            labelAlign: 'cm',
            fillColor: 'black',
            strokeColor: 'black',
            fillOpacity: 0.2,
            pointRadius: 6 // nécessaire pour afficher les géométries de type "POINT"
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable, calquePop, calqueZprObr, calqueGPX]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outils de dessin des géométries
    var btnDessinPoint = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Point, {
        title: 'Dessiner un point',
        displayClass: 'olControlDrawPt',
        featureAdded: ajouter
    });
    var btnDessinPolyligne = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Path, {
        title: 'Dessiner une ligne',
        displayClass: 'olControlDrawLine',
        featureAdded: ajouter
    });
    var	btnDessinPolygone = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Polygon, {
        title: 'Dessiner un polygone',
        displayClass: 'olControlDrawPolygon',
        featureAdded: ajouter
    });
    //Outil de modification des sommets des géométries
    var	btnModifGeom = new OpenLayers.Control.ModifyFeature(coucheEditable, {
        title: 'Modifier',
        displayClass: 'olControlModifyVertexes',
        onModificationEnd: function(feature) {
            if (btnModifGeom.modified) {
                redessiner(feature);
            }
        }
    });
    //Outil de translation des géométries
    var	btnGlissGeom = new OpenLayers.Control.DragFeature(coucheEditable, {
        title: 'Translater',
        displayClass: 'olControlDrag',
        onComplete: redessiner
    });
    //Outil de sélection
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
    //Outil de zoom sur la géométrie
    var btnZoomGeom = new OpenLayers.Control.Button({
        title: 'Recadrer sur la zone prospectée en cours',
        trigger: zoomerGeometrie,
        displayClass: 'olControlZoomCenter'
    });
    //Complément de la barre d'outils
    barreOutils.addControls([
        btnZoomGeom,
        btnZoomSel,
        btnGlissGeom,
        btnModifGeom,
        btnDessinPolygone,
        btnDessinPolyligne,
        btnDessinPoint,
        btnSelGeom
    ]);
    //Entrepôts des données
    var lecteurDonnees = new GeoExt.data.FeatureReader({
        fields: [{name: 'st_asgeojson'},
            {name: 'pop_id'},
            {name: 'pop_surf'},
            {name: 'pop_descriptif'},
            {name: 'cd_nom'},
            {name: 'nom_complet'},
            {name: 'nom_vern'},
            {name: 'gtm_code'},
            {name: 'gtm_libelle'},
            {name: 'pop_nb'},
            {name: 'pop_pheno'},
            {name: 'pop_etiquette'},
            {name: 'pop_statut_validation'},
            {name: 'pop_rq'},
            {name: 'pop_url_photo'},
            {name: 'pop_rq_photo'},
            {name: 'cd_cb'},
            {name: 'lb_cb97_fr'},
            {name: 'cd_cb_lb_cb97_fr'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjPop1Zpr.php?zpr_id=' + GetParam('zpr_id'),
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
        sortInfo: {field: 'pop_id', direction: 'DESC'} // tri par ordre décroissant de création
    });
    var donneesZprObr = new GeoExt.data.FeatureStore({
        layer: calqueZprObr,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjZprObr.php?zpr_id=' + GetParam('zpr_id'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    var donneesPop = new GeoExt.data.FeatureStore({
        layer: calquePop,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjPop.php?zpr_id=' + GetParam('zpr_id'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    var donneesPtc = new Ext.data.JsonStore({
        url: '../Modeles/Json/j1Ptc.php?ptc_id=' + CST_ptcIdEnjeux,
        root: 'data',
        fields: [{name: 'ptc_id'},
            {name: 'ptc_nom'},
            {name: 'ptc_objectif'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'pop_id', header: 'pop_id', hidden: true},
            {dataIndex: 'cd_nom', header: 'cd_nom', hidden: true},
            {dataIndex: 'nom_complet', header: 'Espèce (latin)'},
            {dataIndex: 'nom_vern', header: 'Espèce (français)'},
            {dataIndex: 'pop_etiquette', header: 'N° pointage'},
            {dataIndex: 'pop_nb', header: 'Effectif'},
            {dataIndex: 'pop_descriptif', header: 'Descriptif'},
            {dataIndex: 'gtm_code', header: 'gtm_code', hidden: true},
            {dataIndex: 'gtm_libelle', header: 'Type milieu'},
            {dataIndex: 'pop_surf', header: 'Surf (m²)'},
            {dataIndex: 'pop_pheno', header: 'Phéno dom.'},
            {dataIndex: 'pop_rq', header: 'Remarques'},
            {dataIndex: 'pop_statut_validation', header: 'Statut valid.'},
            {dataIndex: 'pop_url_photo', header: 'Photo', renderer: function(value) {
                return renderIcon(CST_RepPopulations + value);}, hidden: true},
            {dataIndex: 'pop_rq_photo', header: 'Commentaires photo', hidden: true},
            {dataIndex: 'cd_cb', header: 'cd_cb', hidden: true},
            {dataIndex: 'lb_cb97_fr', header: 'lb_cb97_fr', hidden: true},
            {dataIndex: 'cd_cb_lb_cb97_fr', header: 'CORINE biotope'}
        ]
    });
    //Barre de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Mesurer sélection',
                tooltip: 'Mesurer la sélection en cours',
                handler: function() {mesurerSelection(coucheEditable, 'mesures');},
                iconCls: 'measure'
            }, {
                xtype: 'label',
                id: 'mesures'
            }, '-', {
                text: 'Modifier',
                tooltip: 'Modifier la population sélectionnée',
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: 'Supprimer la population sélectionnée',
                handler: supprimer,
                iconCls: 'delete'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            },  '-', {
                text: 'Afficher GPX',
                tooltip: 'Afficher un fichier GPX',
                handler: afficherGPX,
                iconCls: 'import_GPX'
            }, '-', {
                text: 'Retourner ZP',
                tooltip: 'Retourner aux zones de prospection',
                handler: function() {document.location.href = 'vSaisieZpr.php';},
                iconCls: 'return'
            }, '-', {
                text: 'Voir photo',
                handler: afficherPhoto,
                iconCls: 'photo',
                tooltip: 'Visualiser la photo'
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grillePop', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrille,
        cm: configCols,
        autoScroll: true,
        region: 'center',
        plugins: ['autosizecolumns'],
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
        plugins: [new Ext.ux.grid.PageSizer()],
        items: ['-', {
                text: 'Se déconnecter',
                handler: deconnecter,
                iconCls: 'deconnection',
                tooltip: "Se déconnecter de l'application"
            }
        ]
    });
    //Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: 'cartePop', // unique pour conserver la configuration de la carte
        map: carte,
        region: 'center',
        items: [{
            xtype: 'gx_zoomslider', // barre de niveaux de zoom
            vertical: true,
            height: 100,
            y: 10
        }],
        center: CST_center,
        zoom: CST_zoom
    });
    //Panel des infos sur le protocole et la zone prospectée en cours
    var infosPanel = new Ext.FormPanel({
        region: 'north',
        autoHeight: true,
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'info_zpr_id'
           }, {
                xtype: 'hidden',
                id: 'info_obr_id'
            }, {
                xtype: 'hidden',
                id: 'info_ptc_id'
           },  {
                layout:'column',
                items: [{
                    labelSeparator: ' :',
                    columnWidth: 0.2,
                    layout: 'form',
                    labelAlign : 'right',
                    items: [{
                        readOnly: true,
                        xtype: 'textfield',
                        fieldLabel: 'Procole en cours',
                        id: 'info_ptc_nom'
                    }]
                }, {
                    labelSeparator: ' :',
                    columnWidth: 0.2,
                    layout: 'form',
                    labelAlign : 'right',
                    items: [{
                        readOnly: true,
                        xtype: 'textfield',
                        fieldLabel: 'ZP en cours',
                        id: 'info_zpr_nom'
                    }]
                }, {
                    labelSeparator: ' :',
                    columnWidth: 0.16,
                    layout: 'form',
                    labelAlign : 'right',
                    items: [{
                        width: 75,
                        readOnly: true,
                        xtype: 'datefield',
                        format: 'd/m/Y',
                        fieldLabel: 'Date de visite',
                        id: 'info_zpr_date'
                    }]
                }, {
                    labelSeparator: ' :',
                    columnWidth: 0.12,
                    layout: 'form',
                    labelAlign : 'right',
                    items: [{
                        width: 30,
                        readOnly: true,
                        xtype: 'numberfield',
                        fieldLabel: 'Durée (en min)',
                        id: 'info_zpr_duree'
                    }]
                }, {
                    labelSeparator: ' :',
                    columnWidth: 0.12,
                    layout: 'form',
                    labelAlign : 'right',
                    items: [{
                        width: 30,
                        readOnly: true,
                        xtype: 'textfield',
                        fieldLabel: 'Numéro jounalier',
                        id: 'info_zpr_num_j'
                    }]
                }, {
                    labelSeparator: ' :',
                    columnWidth: 0.2,
                    layout: 'form',
                    labelAlign : 'right',
                    items: [{
                        readOnly: true,
                        xtype: 'textfield',
                        fieldLabel: 'Commentaires',
                        id: 'info_zpr_cmt'
                    }]
                }]
            }
        ]
    });
    //Panel de la légende
    var legendePanel = new GeoExt.LegendPanel({
        width: 170,
        region: 'west',
        layerStore: new GeoExt.data.LayerStore(),
        items: [legende]
    });
    //Panel de la carto-légende
    var cartoLegendePanel = new Ext.Panel({
        id: 'ecranPop', // unique pour conserver la configuration de l'écran
        layout: 'border',
        region: sens,
        split: true,
        height: 500, // affichage en mode horizontal
        width: 600, // affichage en mode vertical
        items: [legendePanel, cartePanel]
    });
    //Panel de la grille
    var grillePanel = new Ext.Panel({
        layout: 'border',
        autoheight: true,
        region: 'center',
        items: [barreMenu, grille, barrePaginat]
    });
    //Panel regroupant la grille + la zone centrale
    var grilleZoneCentralePanel = new Ext.Panel({
        layout: 'border',
        region: 'center',
        items: [grillePanel, infosPanel]
    });
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartoLegendePanel, grilleZoneCentralePanel]
    });
    donneesPop.load();
    donneesZprObr.load({
        callback: function() {
            var nbGeom = calqueZprObr.features.length;
            for (var i = 0; i < nbGeom; ++i) {
                if (calqueZprObr.features[i].attributes['zpr_id'] == GetParam('zpr_id')) {
                    var selection = calqueZprObr.features[i].attributes;
                    for (var donnee in selection) {
                        if (Ext.getCmp('info_' + donnee)) {
                            Ext.getCmp('info_' + donnee).setValue(selection[donnee]);
                        }
                    }
                }
            }
            zoomerGeometrie();
        }
    });
    donneesPtc.load({
        callback: function() {
            var selection = donneesPtc.getAt(0).data;
            for (var donnee in selection) {
                if (Ext.getCmp('info_' + donnee)) {
                    Ext.getCmp('info_' + donnee).setValue(selection[donnee]);
                }
            }
        }
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
        return true;
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une population et une seule !').setIcon(Ext.MessageBox.WARNING);
    }
}
function redessiner(feature) {
    Ext.Ajax.request({
        url: '../Controleurs/Gestions/GestPop.php',
        params: {
            action: 'Redessiner',
            pop_id: feature.attributes['pop_id'],
            pop_geom: feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
                new OpenLayers.Projection('EPSG:4326'))
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
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer la population sélectionnée ?', supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' populations sélectionnées ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une population !').setIcon(Ext.MessageBox.WARNING);
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
                url: '../Controleurs/Gestions/GestPop.php',
                params: {
                    action: 'Supprimer',
                    pop_id: grille.selModel.getSelected().data['pop_id']
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
            var listId = selection[0].data['pop_id'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['pop_id'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestPop.php',
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
    types['pop_id'] = Ext.data.Types.INT;
    types['pop_surf'] = Ext.data.Types.INT;
    types['pop_nb'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
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

//Zoom sur la géométrie
function zoomerGeometrie() {
    // cadrage sur l'étendue paramétrée par défaut
    carte.moveTo(new OpenLayers.LonLat(CST_center[0], CST_center[1]), CST_zoom);
    var nbGeom = calqueZprObr.features.length;
    for (var i = 0; i < nbGeom; ++i) {
        if (calqueZprObr.features[i].attributes['zpr_id'] == GetParam('zpr_id')) {
            if (calqueZprObr.features[i].geometry) {
                carte.zoomToExtent(calqueZprObr.features[i].geometry.getBounds());
            }
        }
    }
}

//Appel du formulaire de chargement GPX
function afficherGPX() {
    afficheGPX();
}

//Appel du formulaire d'affichage photo
function afficherPhoto() {
    if (modifier()) {
        affichePhoto(CST_RepPopulations, 'pop_url_photo', 'pop_rq_photo',
            grille, fenetreFormulaire, 'nom_photo', 'info_photo');
    }
}
