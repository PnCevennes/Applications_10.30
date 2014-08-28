//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, donneesGrilleFlo, grille, grilleFlo, fenetreCartoGrille, barrePaginat,
    barrePaginatFlo, coucheEditable, sensRegion = CST_region, calqueBio, calqueZprObr,
    numerisat, numerisateur;

Ext.onReady(function() {
    cstPtcId = CST_ptcIdFlore;
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
    var reglesBio = [
        new OpenLayers.Rule({
            title: 'Autres biotopes',
            symbolizer: {
                'Point': {
                    fillColor: 'purple',
                    strokeColor: 'purple',
                    fillOpacity: 0.2,
                    pointRadius: 6
                }
            }
        }),
        new OpenLayers.Rule({
            title: 'Biotopes en cours',
            symbolizer: {
                'Point': {
                    fillColor: 'red',
                    strokeColor: 'red',
                    fillOpacity: 0.2,
                    pointRadius: 6
                }
            }
        })
    ];
    var legende = new GeoExt.VectorLegend({
        rules: reglesZP.concat(reglesBio),
        symbolType: 'Polygon'
    });
    //Couche d'édition des biotopes pour le protocole et la zone de prospection en cours
    coucheEditable = new OpenLayers.Layer.Vector('Biotopes en cours', {
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
    //Calque des biotopes pour le protocole en cours mais pas pour la zone de prospection en cours
    calqueBio = new OpenLayers.Layer.Vector('Autres biotopes', {
        styleMap: new OpenLayers.StyleMap({
            label: 'N° ${bio_etiquette}\n\n${count} espece(s)',
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
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable, calqueBio, calqueZprObr]);
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
    //Entrepôts des données "Biotopes"
    var lecteurDonnees = new GeoExt.data.FeatureReader({
        fields: [{name: 'st_asgeojson'},
            {name: 'bio_id'},
            {name: 'bio_rq'},
            {name: 'bio_flo_inventaire_partiel'},
            {name: 'bio_flo_pente'},
            {name: 'bio_etiquette'},
            {name: 'bio_descriptif'},
            {name: 'bio_flo_expo'},
            {name: 'bio_url_photo'},
            {name: 'bio_rq_photo'},
            {name: 'gtm_code'},
            {name: 'gtm_libelle'},
            {name: 'cd_cb'},
            {name: 'lb_cb97_fr'},
            {name: 'cd_cb_lb_cb97_fr'}
        ]
    });
    var lecteurDonneesFlo = new Ext.data.JsonReader({
        idProperty: 'gid', // identifiant pour conserver la sélection
        totalProperty: 'total',
        root: 'data',
        fields: [{name: 'tax_id'},
            {name: 'tax_rq'},
            {name: 'tax_statut_validation'},
            {name: 'cd_nom'},
            {name: 'tax_num_herbier'},
            {name: 'tax_url_photo'},
            {name: 'tax_bio_id'},
            {name: 'tax_rq_photo'},
            {name: 'nom_complet'},
            {name: 'nom_vern'},
            {name: 'tax_flo_nb'},
            {name: 'tax_flo_pheno'},
            {name: 'tax_flo_nb_precis'},
            {name: 'tax_flo_germination'},
            {name: 'tax_flo_vegetatif'},
            {name: 'tax_flo_bourgeon'},
            {name: 'tax_flo_floraison'},
            {name: 'tax_flo_fructification'},
            {name: 'tax_flo_dissemination'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjBioFlo1Zpr.php?zpr_id=' + GetParam('zpr_id'),
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
        sortInfo: {field: 'bio_id', direction: 'DESC'} // tri par ordre décroissant de création
    });
    donneesGrilleFlo = new Ext.data.GroupingStore({
        proxy: new Ext.data.HttpProxy({url: '../Modeles/Json/jFlo1Bio.php'}),
        reader: lecteurDonneesFlo,
        remoteSort: true,
        remoteGroup: true,
        sortInfo: {field: 'tax_id', direction: 'DESC'} // tri par ordre décroissant de création
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
    var donnees = new GeoExt.data.FeatureStore({
        layer: calqueBio,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjBioFlo.php?zpr_id=' + GetParam('zpr_id'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    var donneesPtc = new Ext.data.JsonStore({
        url: '../Modeles/Json/j1Ptc.php?ptc_id=' + CST_ptcIdFlore,
        root: 'data',
        fields: [{name: 'ptc_id'},
            {name: 'ptc_nom'},
            {name: 'ptc_objectif'}
        ]
    });
    //Configurations type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'bio_id', header: 'bio_id', hidden: true},
            {dataIndex: 'bio_flo_inventaire_partiel', header: 'Inv. partiel', renderer: traiteAffichageBoolean},
            {dataIndex: 'bio_flo_pente', header: 'Pente'},
            {dataIndex: 'bio_flo_expo', header: 'Expo dom.'},
            {dataIndex: 'bio_etiquette', header: 'N° pointage'},
            {dataIndex: 'bio_descriptif', header: 'Descriptif'},
            {dataIndex: 'gtm_code', header: 'gtm_code', hidden: true},
            {dataIndex: 'gtm_libelle', header: 'Type milieu'},
            {dataIndex: 'bio_rq', header: 'Commentaires'},
            {dataIndex: 'bio_url_photo', header: 'Photo', renderer: function(value) {
                return renderIcon(CST_RepBiotopes + value);}, hidden: true},
            {dataIndex: 'bio_rq_photo', header: 'Commentaires photo', hidden: true},
            {dataIndex: 'cd_cb', header: 'cd_cb', hidden: true},
            {dataIndex: 'lb_cb97_fr', header: 'lb_cb97_fr', hidden: true},
            {dataIndex: 'cd_cb_lb_cb97_fr', header: 'CORINE biotope'}
        ]
    });
    var configColsFlo = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelection, // en premier obligatoirement
            {dataIndex: 'tax_id', header: 'tax_id', hidden: true},
            {dataIndex: 'tax_bio_id', header: 'tax_bio_id', hidden: true},
            {dataIndex: 'cd_nom', header: 'cd_nom', hidden: true},
            {dataIndex: 'nom_complet', header: 'Espèce (latin)'},
            {dataIndex: 'nom_vern', header: 'Espèce (français)', hidden: true},
            {dataIndex: 'tax_rq', header: 'Remarques'},
            {dataIndex: 'tax_num_herbier', header: 'N° herbier'},
            {dataIndex: 'tax_url_photo', header: 'Photo', renderer: function(value) {
                return renderIcon(CST_RepEspeces + value);}, hidden: true},
            {dataIndex: 'tax_rq_photo', header: 'Commentaires photo', hidden: true},
            {dataIndex: 'tax_statut_validation', header: 'Statut valid.'},
            {dataIndex: 'tax_flo_nb', header: 'Effectif'},
            {dataIndex: 'tax_flo_pheno', header: 'Phéno dom.'},
            {dataIndex: 'tax_flo_nb_precis', header: 'Nb exact', renderer: traiteAffichageBoolean},
            {dataIndex: 'tax_flo_germination', header: 'Germinat.', hidden: true},
            {dataIndex: 'tax_flo_vegetatif', header: 'Végétatif', renderer: traiteAffichageEntierPositifBooleen, hidden: true},
            {dataIndex: 'tax_flo_bourgeon', header: 'Bourgeon', renderer: traiteAffichageEntierPositifBooleen, hidden: true},
            {dataIndex: 'tax_flo_floraison', header: 'Floraison', renderer: traiteAffichageEntierPositifBooleen, hidden: true},
            {dataIndex: 'tax_flo_fructification', header: 'Fructificat.', renderer: traiteAffichageEntierPositifBooleen, hidden: true},
            {dataIndex: 'tax_flo_dissemination', header: 'Disséminat.', renderer: traiteAffichageEntierPositifBooleen, hidden: true}
        ]
    });
    //Barres de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Modifier',
                tooltip: 'Modifier le biotope sélectionné',
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: 'Supprimer le biotope sélectionné',
                handler: supprimer,
                iconCls: 'delete'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            }, '-', {
                text: 'Importer GPX',
                tooltip: 'Importer un fichier GPX',
                handler: importerGPX,
                iconCls: 'import_GPX'
            }, '-',  {
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
    var barreMenuFlo = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Ajouter',
                tooltip: 'Ajouter une espèce Flore pour le biotope sélectionné',
                handler: ajouterFlo,
                iconCls: 'add'
            }, '-', {
                text: 'Modifier',
                tooltip: "Modifier l'espèce Flore sélectionnée",
                handler: modifierFlo,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: "Supprimer l'espèce Flore sélectionnée",
                handler: supprimerFlo,
                iconCls: 'delete'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcelFlo,
                iconCls: 'icon_excel'
            }, '-', {
                text: 'Voir photo',
                handler: afficherPhotoBis,
                iconCls: 'photo',
                tooltip: 'Visualiser la photo'
            }
        ]
    });
    //Grilles des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grilleBioFlo', // unique pour conserver la configuration de la grille
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
    grille.selModel.on('selectionchange', actualiserGrilleFlo);
    grilleFlo = new Ext.grid.GridPanel({
        sm: colonneSelection,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grilleFlo', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrilleFlo,
        cm: configColsFlo,
        autoScroll: true,
        region: 'center',
        plugins: ['autosizecolumns'],
        stripeRows: true,
        trackMouseOver: false,
        listeners: {rowdblclick: modifierFlo}
    });
    //Barres de pagination
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
    barrePaginatFlo = new Ext.PagingToolbar({
        region: 'south',
        autoHeight: true,
        store: donneesGrilleFlo,
        displayInfo: true,
        plugins: [new Ext.ux.grid.PageSizer()]
    });
    //Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: 'carteBioFlo', // unique pour conserver la configuration de la carte
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
        id: 'ecranBioFlo', // unique pour conserver la configuration de l'écran
        layout: 'border',
        region: sens,
        split: true,
        height: 500, // affichage en mode horizontal
        width: 600, // affichage en mode vertical
        items: [legendePanel, cartePanel]
    });
    //Panels des grilles
    var grillePanel = new Ext.Panel({
        layout: 'border',
        split: true,
        autoheight: true,
        width: 600,
        region: 'west',
        items: [barreMenu, grille, barrePaginat]
    });
    var grillePanelFlo = new Ext.Panel({
        layout: 'border',
        autoheight: true,
        region: 'center',
        items: [barreMenuFlo, grilleFlo, barrePaginatFlo]
    });
    //Panel regroupant les grilles + la zone centrale
    var grilleZoneCentralePanel = new Ext.Panel({
        layout: 'border',
        region: 'center',
        items: [grillePanel, grillePanelFlo, infosPanel]
    });
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartoLegendePanel, grilleZoneCentralePanel]
    });
    donnees.load();
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

//Ajouts
function ajouter(feature) {
    ajoute(feature.geometry.transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')));
}
function ajouterFlo() {
    if (grille.selModel.getCount() == 1) {
        ajouteFlo();
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner un biotope et un seul !').setIcon(Ext.MessageBox.WARNING);
    }
}

//Modifications
function modifier() {
    if (grille.selModel.getCount() == 1) {
        modifie();
        return true;
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner un biotope et un seul !').setIcon(Ext.MessageBox.WARNING);
    }
}
function redessiner(feature) {
    Ext.Ajax.request({
        url: '../Controleurs/Gestions/GestBioFlo.php',
        params: {
            action: 'Redessiner',
            bio_id: feature.attributes['bio_id'],
            bio_geom: feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
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
function modifierFlo() {
    if (grilleFlo.selModel.getCount() == 1) {
        modifieFlo();
        return true;
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une espèce Flore et une seule !').setIcon(Ext.MessageBox.WARNING);
    }
}

//Suppressions
function supprimer() {
    var nbSuppr = grille.selModel.getCount();
    if (nbSuppr > 0) {
        if (nbSuppr == 1) {
            Ext.MessageBox.confirm('Confirmation', 'ATTENTION : cette action supprimera également toutes les espèces Flore associées !!! Etes-vous sûr de vouloir supprimer le biotope sélectionné ?', supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'ATTENTION : cette action supprimera également toutes les espèces Flore associées !!! Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' biotopes sélectionnés ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins un biotope !').setIcon(Ext.MessageBox.WARNING);
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
                url: '../Controleurs/Gestions/GestBioFlo.php',
                params: {
                    action: 'Supprimer',
                    bio_id: grille.selModel.getSelected().data['bio_id']
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
            var listId = selection[0].data['bio_id'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['bio_id'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestBioFlo.php',
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
function supprimerFlo() {
    var nbSuppr = grilleFlo.selModel.getCount();
    if (nbSuppr > 0) {
        if (nbSuppr == 1) {
            Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir supprimer l'espèce Flore sélectionnée ?", supprimeFlo);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' espèces Flore sélectionnées ?', supprimeFlo);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une espèce Flore !').setIcon(Ext.MessageBox.WARNING);
    }
}
function rafraichieAffichageFlo() {
    donneesGrilleFlo.reload({
        callback: function(rs) {
            // gestion du cas particulier de la suppression de tous les éléments de la dernière page
            if ((rs.length == 0) && (barrePaginatFlo.cursor > 0)) {
                barrePaginatFlo.movePrevious(); // correction du bug d'affichage de la barre de pagination
            }
        }
    })
}
function supprimeFlo(btn) {
    if (btn == 'yes') {
        var nbSuppr = grilleFlo.selModel.getCount();
        if (nbSuppr == 1) {
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestTaxFlo.php',
                params: {
                    actionFlo: 'Supprimer',
                    tax_id: grilleFlo.selModel.getSelected().data['tax_id']
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            rafraichieAffichageFlo();
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
            var selection = grilleFlo.selModel.getSelections();
            var listId = selection[0].data['tax_id'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['tax_id'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestTaxFlo.php',
                params: {
                    actionFlo: 'SupprimerListeId',
                    listId: listId
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            rafraichieAffichageFlo();
                        }
                        else {
                            Ext.MessageBox.show({
                                fn: function() {
                                    if (obj.errorMessage == 'Opérations de suppression partielles') {
                                        rafraichieAffichageFlo();
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
//Typages des données affichées pour les exports Excel
function exporterExcel() {
    var types = new Array();
    types['bio_id'] = Ext.data.Types.INT;
    types['bio_flo_pente'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}
function exporterExcelFlo() {
    var types = new Array();
    types['tax_id'] = Ext.data.Types.INT;
    types['tax_bio_id'] = Ext.data.Types.INT;
    types['tax_flo_nb'] = Ext.data.Types.INT;
    types['tax_flo_vegetatif'] = Ext.data.Types.INT;
    types['tax_flo_bourgeon'] = Ext.data.Types.INT;
    types['tax_flo_floraison'] = Ext.data.Types.INT;
    types['tax_flo_fructification'] = Ext.data.Types.INT;
    types['tax_flo_dissemination'] = Ext.data.Types.INT;

    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grilleFlo, types));
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

//Appel du formulaire d'importation GPX
function importerGPX() {
    importeGPX();
}

//Appel du formulaire d'affichage photo des biotopes
function afficherPhoto() {
    if (modifier()) {
        affichePhoto(CST_RepBiotopes, 'bio_url_photo', 'bio_rq_photo',
        grille, fenetreFormulaire, 'nom_photo', 'info_photo');
    }
}

//Appel du formulaire d'affichage photo des espèces Flore
function afficherPhotoBis() {
    if (modifierFlo()) {
        affichePhoto(CST_RepEspeces, 'tax_url_photo', 'tax_rq_photo', grilleFlo,
        fenetreFormulaireFlo, 'nom_photo_flo', 'info_photo_flo', true);
    }
}

function actualiserGrilleFlo() {
    grille.selModel.suspendEvents(true);
    var tax_bio_id = 0;
    if (grille.selModel.getCount() == 1) {
        tax_bio_id = grille.selModel.getSelected().data['bio_id'];
    }
    donneesGrilleFlo.reload({
        params: {tax_bio_id: tax_bio_id},
        callback: function() {grille.selModel.resumeEvents();}
    })
}
