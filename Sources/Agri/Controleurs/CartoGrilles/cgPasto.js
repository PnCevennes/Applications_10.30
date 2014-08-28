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
            title: 'Bovin',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'valorisati',
                value: 'bovin'
            }),
            symbolizer: {
                fillColor: '#FFD800',
                strokeColor: '#FFD800'
            }
        }),
        new OpenLayers.Rule({
            title: 'Ovin',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'valorisati',
                value: 'ovin'
            }),
            symbolizer: {
                fillColor: '#FF0000',
                strokeColor: '#FF0000'
            }
        }),
        new OpenLayers.Rule({
            title: 'Caprin',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'valorisati',
                value: 'caprin'
            }),
            symbolizer: {
                fillColor: '#4800FF',
                strokeColor: '#4800FF'
            }
        }),
        new OpenLayers.Rule({
            title: 'Mixte',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'valorisati',
                value: 'mixte'
            }),
            symbolizer: {
                fillColor: '#B200FF',
                strokeColor: '#B200FF'
            }
        }),
        new OpenLayers.Rule({
            title: 'Non renseignée',
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'valorisati',
                value: 'non renseignee'
            }),
            symbolizer: {
                fillColor: '#404040',
                strokeColor: '#404040'
            }
        })
    ];
    //Couche de consultation
    coucheConsultable = new OpenLayers.Layer.Vector('Occupation animales', {
        styleMap: new OpenLayers.StyleMap({
           'default': new OpenLayers.Style(null, {rules: regles}),
            select: {
                fillColor: 'yellow',
                fillOpacity: 0.8
            }
        })
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
        {name: 'gid'},
        {name: 'num_ilot'},
        {name: 'surface_gr'},
        {name: 'surf_re'},
        {name: 'id_expl'},
        {name: 'antenne'},
        {name: 'bovin'},
        {name: 'ovin'},
        {name: 'caprin'},
        {name: 'valorisati'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjOccupationAnimale.php',
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
        sortInfo: {field: 'gid', direction: 'DESC'} // tri par ordre décroissant de création
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'gid', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'num_ilot', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'surf_re', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'surface_gr', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'valorisati', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'bovin', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'ovin', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'caprin', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'id_expl', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'antenne', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'gid', header: 'ID', hidden: true},
            {dataIndex: 'num_ilot', header: 'Ilot (RPG 2010)'},
            {dataIndex: 'surf_re', header: 'Surf. îlot (ha)'},
            {dataIndex: 'surface_gr', header: 'Surf. landes (ha)'},
            {dataIndex: 'valorisati', header: 'Type élevage'},
            {dataIndex: 'bovin', header: 'Bovin'},
            {dataIndex: 'ovin', header: 'Ovin'},
            {dataIndex: 'caprin', header: 'Caprin'},
            {dataIndex: 'id_expl', header: 'Exploit. (RPG 2010)'},
            {dataIndex: 'antenne', header: 'Antenne'}
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
        id: 'grilleOccupationAnimale', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrille,
        cm: configCols,
        autoScroll: true,
        region: 'center',
        plugins: [filtres, 'autosizecolumns'],
        stripeRows: true,
        trackMouseOver: false
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
        id: 'cartePanelOccupationAnimale', // unique pour conserver la configuration de la carte
        map: carte,
        region: 'center',
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
    });//Panel de la grille
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
    //Chargement des données selon cookies
    if (Ext.util.Cookies.get('ys-grilleOccupationAnimale') == null) {
        donneesGrille.load();
    }
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['gid'] = Ext.data.Types.INT;
    types['surf_re'] = Ext.data.Types.FLOAT;
    types['surface_gr'] = Ext.data.Types.FLOAT;
    types['bovin'] = Ext.data.Types.INT;
    types['ovin'] = Ext.data.Types.INT;
    types['caprin'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND gid';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['gid'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['gid'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['gid'];
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
        idSelection[i] = selection[i].data['gid'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['gid']) == -1) {
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
            chGeom: 'the_geom',
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
