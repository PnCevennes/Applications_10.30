//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheConsultable, idSelection = new Array(),
    region = CST_region;

Ext.onReady(function() {
    // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
    basculeEcran(CST_region);
});

function basculeEcran(sens) {    
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
    //Couche de consultation
    coucheConsultable = new OpenLayers.Layer.Vector('Périmètres de quiétude', {
        styleMap: new OpenLayers.StyleMap({
            'default': new OpenLayers.Style(null, {rules: regles}),
            select: {
                fillColor: 'yellow',
                fillOpacity: 0.8,
                graphicZIndex: 8
            }
        }),
        rendererOptions: {zIndexing: true} // activation de l'ordre de superposition pour l'affichage des règles
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheConsultable]);
    //Outil de sélection des géométries
    var btnSelGeom = new OpenLayers.Control.SelectFeature(coucheConsultable, {
        title: 'Sélectionner',
        displayClass: 'olControlMultiSelectFeature',
        toggleKey: 'ctrlKey',
        multipleKey: 'ctrlKey',
        box: true,
        onSelect: function() {afficherMesures(0, 0, 'mesures');},
        onUnselect: function() {afficherMesures(0, 0, 'mesures');}
    });
    btnSelGeom.handler = new OpenLayers.Handler.Click(btnSelGeom, { // événement sur le double-click de la géométrie
            dblclick: visualiser                                    // sélectionné pour ouvrir directement le formulaire
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
        btnSelGeom
    ]);
    //Entrepôt des données (géométries également)
    var lecteurDonnees = new GeoExt.data.FeatureReader({
        fields: [{name: 'st_asgeojson'},
            {name: 'qtd_id'},
            {name: 'qtd_nom'},
            {name: 'qtd_commentaire'},
            {name: 'qtd_area_ha'},
            {name: 'esp_genre_espece'},
            {name: 'esp_nom_francais'},
            {name: 'sit_code'},
            {name: 'sit_nom'},
            {name: 'sit_couple'},
            {name: 'eta_libelle'},
            {name: 'lst_com_qtd'},
            {name: 'lst_syn_sit'},
            {name: 'per_nom_prenom'},
            {name: 'max_sth_annee'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjPerimQuiet.php',
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
        sortInfo: {field: 'qtd_id', direction: 'DESC'} // tri par ordre décroissant de création
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'qtd_id', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'qtd_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'qtd_commentaire', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'qtd_area_ha', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'esp_genre_espece', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'esp_nom_francais', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'sit_code', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'sit_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'sit_couple', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'list', dataIndex: 'eta_libelle', options: ['Actif', 'Inactif', 
                'Indéterminé', ['IS NULL', '']]},
            {type: 'string', dataIndex: 'lst_com_qtd', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'lst_syn_sit', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'per_nom_prenom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'max_sth_annee', menuItemCfgs : {emptyText: ''}}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'qtd_id', header: 'ID', hidden: true},
            {dataIndex: 'qtd_nom', header: 'Nom'},
            {dataIndex: 'qtd_area_ha', header: 'Surface ha'},
            {dataIndex: 'qtd_commentaire', header: 'Commentaire'},
            {dataIndex: 'esp_genre_espece', header: 'Genre&espèce (latin)'},
            {dataIndex: 'esp_nom_francais', header: 'Genre&espèce (français)'},
            {dataIndex: 'sit_code', header: 'Site (code)'},
            {dataIndex: 'sit_nom', header: 'Site (nom)'},
            {dataIndex: 'sit_couple', header: 'Site (couple)'},
            {dataIndex: 'eta_libelle', header: 'Etat'},
            {dataIndex: 'lst_com_qtd', header: 'Communes'},
            {dataIndex: 'lst_syn_sit', header: 'Synonymes (site)'},
            {dataIndex: 'per_nom_prenom', header: 'Responsable'},
            {dataIndex: 'max_sth_annee', header: 'Dernière synthèse'}
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
                text: 'Basculer écran',
                tooltip: "Basculer l'écran",
                handler: basculerEcran,
                iconCls: 'switch'
            }, '-', {
                text: 'Visualiser fiche',
                tooltip: "Visualiser l'élément sélectionné",
                handler: visualiser,
                iconCls: 'cog_edit'
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
        id: 'grillePerimQuiet', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrille,
        cm: configCols,
        autoScroll: true,
        region: 'center',
        plugins: [filtres, 'autosizecolumns'],
        stripeRows: true,
        trackMouseOver: false,
        listeners: {rowdblclick: visualiser}
    });
    //Barre de pagination
    barrePaginat = new Ext.PagingToolbar({
        region: 'south',
        autoHeight: true,
        store: donneesGrille,
        displayInfo: true,
        plugins: [filtres, new Ext.ux.grid.PageSizer()]
    });
    //Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: 'cartePerimQuiet', // unique pour conserver la configuration de la carte
        region: 'center',
        map: carte,
        items: [{
            xtype: 'gx_zoomslider', // barre de niveaux de zoom
            vertical: true,
            height: 100,
            y: 10
        }],
        center: CST_center,
        zoom: CST_zoom
    });
    //Panel de la légende
    var legendePanel = new GeoExt.LegendPanel({
        width: 170,
        region: 'west',
        layerStore: new GeoExt.data.LayerStore({
            layers: [coucheConsultable]
        })
    });
    //Panel de la carto-légende
    var cartoLegendePanel = new Ext.Panel({
        layout: 'border',
        region: sens,
        split: true,
        height: 400, // affichage en mode horizontal
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
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartoLegendePanel, grillePanel]
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

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['qtd_id'] = Ext.data.Types.INT;
    types['qtd_code'] = Ext.data.Types.INT;
    types['qtd_ancien_code'] = Ext.data.Types.INT;
    types['qtd_area_ha'] = Ext.data.Types.FLOAT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND qtd_id';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['qtd_id'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['qtd_id'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['qtd_id'];
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

//Sauvegarde des éléments sélectionnés en mémoire
function sauverSelection() {
    idSelection = [];
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        idSelection[i] = selection[i].data['qtd_id'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['qtd_id']) == -1) {
           grille.selModel.deselectRow(i);
        }
    }
}

//Bascule de l'écran
function basculerEcran() {
    // obligatoire pour réinitialiser l'affichage correctement
    fenetreCartoGrille.destroy();
    barreOutils.controls.remove(barreOutils.controls[barreOutils.controls.length - 1]);
    barreOutils.controls.remove(barreOutils.controls[barreOutils.controls.length - 1]);
    carte.removeLayer(coucheConsultable);
    if (region == 'north') {
        region = 'west';
        basculeEcran('west'); // écran divisé verticalement
    }
    else {
        region = 'north';
        basculeEcran('north'); // écran divisé horizontalement
    }
}

//Filtrage sur l'emprise
function filtrerSurEmprise() {
    var emprise = carte.getExtent().toGeometry().transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326'));
    donneesGrille.reload({
        params: {
            filtreEmprise: emprise,
            chGeom: 'qtd_geom',
            epsg: 27572,
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

//Visualisation
function visualise() {
    window.open('http://192.168.10.132:8080/db_pnc/index.php?content=perimetre_quietude&a=view&recid=0&idPerimQuiet=' +
        grille.selModel.getSelected().data['qtd_id']);
 }
function visualiser() {
    if (grille.selModel.getCount() == 1) {
        visualise();
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner un élément et un seul').setIcon(Ext.MessageBox.WARNING);
    }
}
