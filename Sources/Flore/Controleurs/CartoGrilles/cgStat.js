//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheConsultable,
    sensRegion = CST_region, numerisat, numerisateur, numerisateur_droit, calqueEnvConvStatMax,
    calqueEnvConvStatMAJ, calqueStatOri, calqueZprObr;

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
    var reglesStat = [
        new OpenLayers.Rule({
            title: "Stations d'origine",
            symbolizer: {
                fillColor: 'purple',
                strokeColor: 'purple',
                fillOpacity: 0.2
            }
        }),
        new OpenLayers.Rule({
            title: 'Zones historiques',
            symbolizer: {
                fillColor: 'pink',
                strokeColor: 'pink',
                fillOpacity: 0.2
            }
        }),
        new OpenLayers.Rule({
            title: 'Stations actuelles',
            symbolizer: {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2
            }
        })
    ];
    var legende = new GeoExt.VectorLegend({
        rules: reglesZP.concat(reglesStat),
        symbolType: 'Polygon'
    });
    //Couche de consultation des stations MAJ
    coucheConsultable = new OpenLayers.Layer.Vector('Stations actuelles', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.2,
                pointRadius: 6 // nécessaire pour afficher les géométries de type "POINT"
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
    //Calque des stations d'origine
    calqueStatOri = new OpenLayers.Layer.Vector("Stations d'origine", {
        styleMap: new OpenLayers.StyleMap({
            fillColor: 'purple',
            strokeColor: 'purple',
            fillOpacity: 0.2
        })
    });
    //Calque des enveloppes convexes des stations MAJ
    calqueEnvConvStatMAJ = new OpenLayers.Layer.Vector('Extensions stations actuelles', {
        styleMap: new OpenLayers.StyleMap({
            fillColor: 'red',
            strokeColor: 'red',
            fillOpacity: 0.2,
            strokeDashstyle: 'longdash'
        })
    });
    //Calque des enveloppes convexes des stations MAJ
    calqueEnvConvStatMax = new OpenLayers.Layer.Vector('Zones historiques', {
        styleMap: new OpenLayers.StyleMap({
            fillColor: 'pink',
            strokeColor: 'pink',
            fillOpacity: 0.2,
            strokeDashstyle: 'dot',
            label: '${bio_code}\n\n${bio_fiche}',
            fontColor: 'pink',
            fontSize: '14px',
            fontWeight: 'bold',
            labelAlign: 'cm'
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([calqueEnvConvStatMax, calqueEnvConvStatMAJ, coucheConsultable,
        calqueStatOri, calqueZprObr]);
    //Outil d'historisation de la navigation
    var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
    carte.addControl(btnsHistoNavig);
    //Outil de sélection
    var btnSelGeom = new OpenLayers.Control.SelectFeature(coucheConsultable, {
        title: 'Sélectionner',
        displayClass: 'olControlMultiSelectFeature',
        toggleKey: 'ctrlKey',
        multipleKey: 'ctrlKey',
        box: true
    });
    btnSelGeom.handler = new OpenLayers.Handler.Click(btnSelGeom, { // événement sur le double-click de la géométrie
            dblclick: modifier                                      // sélectionné pour accéder directement à l'écran de MAJ
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
        btnSelGeom
    ]);
    //Entrepôts des données
    var lecteurDonnees = new GeoExt.data.FeatureReader({
        fields: [{name: 'st_asgeojson'},
            {name: 'genre'},
            {name: 'espece'},
            {name: 'max_zpr_date'},
            {name: 'bio_id'},
            {name: 'bio_code'},
            {name: 'bio_fiche'},
            {name: 'vst_date'},
            {name: 'cd_nom'},
            {name: 'nom_vern'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjStatMAJ.php',
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
    var donneesStatOri = new GeoExt.data.FeatureStore({
        layer: calqueStatOri,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjStatOri.php',
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    var donneesEnvConvStatMAJ = new GeoExt.data.FeatureStore({
        layer: calqueEnvConvStatMAJ,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjEnvConvStatMAJ.php',
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    var donneesEnvConvStatMax = new GeoExt.data.FeatureStore({
        layer: calqueEnvConvStatMax,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjEnvConvStatMax.php',
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        })
    });
    var donneesPtc = new Ext.data.JsonStore({
        url: '../Modeles/Json/j1Ptc.php?ptc_id=' + CST_ptcIdSuivi,
        root: 'data',
        fields: [{name: 'ptc_id'},
            {name: 'ptc_nom'},
            {name: 'ptc_objectif'}
        ]
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'bio_id', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'bio_fiche', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'date', dataIndex: 'vst_date', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'date', dataIndex: 'max_zpr_date', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'string', dataIndex: 'genre', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'espece', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'bio_code', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'cd_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_vern', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });//Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'bio_id', header: 'bio_id', hidden: true},
            {dataIndex: 'bio_code', header: 'Code station'},
            {dataIndex: 'bio_fiche', header: 'N° fiche'},
            {dataIndex: 'vst_date', header: 'Découverte', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'genre', header: 'Genre'},
            {dataIndex: 'espece', header: 'Espece'},
            {dataIndex: 'max_zpr_date', header: 'Date MàJ', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'cd_nom', header: 'cd_nom', hidden: true},
            {dataIndex: 'nom_vern', header: 'Nom vulgaire'}
        ]
    });
    //Barre de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Mesurer sélection',
                tooltip: 'Mesurer la sélection en cours',
                handler: function() {mesurerSelection(coucheConsultable, 'mesures');},
                iconCls: 'measure'
            }, {
                xtype: 'label',
                id: 'mesures'
            }, '-', {
                text: 'MàJ station',
                tooltip: 'Mettre à jour la station sélectionnée',
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            }, '-', {
                text: 'Filtrer sélection',
                tooltip: 'Filtrer sur la sélection ("Actualiser la page" pour annuler)',
                handler: filtrerSelection,
                iconCls: 'filter_selected'
            }, '-', {
                text: 'Retourner ZP',
                tooltip: 'Retourner aux zones de prospection',
                handler: function() {document.location.href = 'vSaisieZpr.php';},
                iconCls: 'return'
            }, '-', {
                text: 'Filtrer emprise',
                tooltip: 'Filtrer sur les limites de la carte ("Actualiser la page" pour annuler)',
                handler: filtrerSurEmprise,
                iconCls: 'extent'
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grilleStat', // unique pour conserver la configuration de la grille
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
        plugins: [filtres, new Ext.ux.grid.PageSizer()],
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
        id: 'carteStat', // unique pour conserver la configuration de la carte
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
        id: 'ecranStat', // unique pour conserver la configuration de l'écran
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
    donneesStatOri.load();
    donneesEnvConvStatMAJ.load();
    donneesEnvConvStatMax.load();
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
            btnSelGeom.activate(); //activation par défaut du contrôle de selection des géométries
        }
    });
}

//Modification
function modifier() {
    if (grille.selModel.getCount() == 1) {
        document.location.href = 'vSaisiePopStat.php?zpr_id=' + GetParam('zpr_id') + '&bio_id=' + grille.selModel.getSelected().data['bio_id'];
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une station et une seule !').setIcon(Ext.MessageBox.WARNING);
    }
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['bio_id'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND bio_id';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['bio_id'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['bio_id'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['bio_id'];
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
    var selection = coucheConsultable.selectedFeatures;
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

//Filtrage sur l'emprise
function filtrerSurEmprise() {
    var emprise = carte.getExtent().toGeometry().transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326'));
    donneesGrille.reload({
        params: {
            filtreEmprise: emprise,
            chGeom: 'sta_geom',
            epsg: 2154,
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
