//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheConsultable, idSelection = new Array(),
    region = CST_region;

Ext.onReady(function() {
    // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
    basculeEcran(CST_region);
});

function basculeEcran(sens) {    
    //Couche de consultation
    coucheConsultable = new OpenLayers.Layer.Vector('Odonates', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                pointRadius: 14,
                graphicZIndex: 1,
                externalGraphic: '../Images/libellule_off.gif'
            },
            select: {
                graphicZIndex: 2,
                externalGraphic: '../Images/libellule_on.gif'
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
        {name: 'longitude'},
        {name: 'latitude'},
        {name: 'id_obs'},
        {name: 'auteur'},
        {name: 'structure'},
        {name: 'num_fiche'},
        {name: 'date'},
        {name: 'station'},
        {name: 'code_insee'},
        {name: 'nom_com'},
        {name: 'lieu_dit'},
        {name: 'riviere'},
        {name: 'altitude'},
        {name: 'biotope'},
        {name: 'invod_1999'},
        {name: 'genre'},
        {name: 'sp'},
        {name: 'sous_sp'},
        {name: 'mf'},
        {name: 'm'},
        {name: 'f'},
        {name: 'la'},
        {name: 'ex'},
        {name: 'e'},
        {name: 'im'},
        {name: 'ad'},
        {name: 'te'},
        {name: 'ac'},
        {name: 'po'},
        {name: 'pr'},
        {name: 'au'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjOdonate.php',
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
            {type: 'numeric', dataIndex: 'longitude', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'latitude', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'id_obs', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'auteur', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'structure', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'num_fiche', menuItemCfgs : {emptyText: ''}},
            {type: 'date', dataIndex: 'date', beforeText: 'avant le', afterText: 'après le', onText: 'le'},
            {type: 'numeric', dataIndex: 'station', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'code_insee', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_com', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'lieu_dit', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'riviere', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'altitude', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'biotope', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'invod_1999', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'genre', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'sp', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'sous_sp', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'mf', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'm', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'f', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'la', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'ex', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'e', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'im', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'ad', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'te', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'ac', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'po', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'pr', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'au', menuItemCfgs : {emptyText: ''}}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'gid', header: 'ID', hidden: true},
            {dataIndex: 'longitude', header: 'Longitude', hidden: true},
            {dataIndex: 'latitude', header: 'Latitude', hidden: true},
            {dataIndex: 'id_obs', header: 'Observation'},
            {dataIndex: 'auteur', header: 'Auteur'},
            {dataIndex: 'structure', header: 'Structure'},
            {dataIndex: 'num_fiche', header: 'Fiche'},
            {dataIndex: 'date', header: 'Date', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'station', header: 'Station'},
            {dataIndex: 'code_insee', header: 'INSEE'},
            {dataIndex: 'nom_com', header: 'Commune'},
            {dataIndex: 'lieu_dit', header: 'Lieu-dit'},
            {dataIndex: 'riviere', header: 'Rivière'},
            {dataIndex: 'altitude', header: 'Altitude'},
            {dataIndex: 'biotope', header: 'Biotope'},
            {dataIndex: 'invod_1999', header: 'Code espèce'},
            {dataIndex: 'genre', header: 'Genre'},
            {dataIndex: 'sp', header: 'Espèce'},
            {dataIndex: 'sous_sp', header: 'Sous-espèce'},
            {dataIndex: 'mf', header: 'Sexe indéterminé'},
            {dataIndex: 'm', header: 'Mâle'},
            {dataIndex: 'f', header: 'Femelle'},
            {dataIndex: 'la', header: 'Larve'},
            {dataIndex: 'ex', header: 'Exuvie'},
            {dataIndex: 'e', header: 'Emergence'},
            {dataIndex: 'im', header: 'Immature'},
            {dataIndex: 'ad', header: 'Adulte'},
            {dataIndex: 'te', header: 'Territorial'},
            {dataIndex: 'ac', header: 'Accouplement'},
            {dataIndex: 'po', header: 'Ponte'},
            {dataIndex: 'pr', header: 'Prédation'},
            {dataIndex: 'au', header: 'Autochtonie'}
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
        id: 'grilleOdonate', // unique pour conserver la configuration de la grille
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
        id: 'carteOdonate', // unique pour conserver la configuration de la carte
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
    //Chargement des données selon cookies
    if (Ext.util.Cookies.get('ys-grilleOdonate') == null) {
        donneesGrille.load();
    }
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['gid'] = Ext.data.Types.INT;
    types['longitude'] = Ext.data.Types.FLOAT;
    types['latitude'] = Ext.data.Types.FLOAT;
    types['num_fiche'] = Ext.data.Types.INT;
    types['date'] = Ext.data.Types.DATE;
    types['station'] = Ext.data.Types.INT;
    types['altitude'] = Ext.data.Types.INT;
    types['mf'] = Ext.data.Types.INT;
    types['m'] = Ext.data.Types.INT;
    types['f'] = Ext.data.Types.INT;
    types['la'] = Ext.data.Types.INT;
    types['ex'] = Ext.data.Types.INT;
    types['e'] = Ext.data.Types.INT;
    types['im'] = Ext.data.Types.INT;
    types['ad'] = Ext.data.Types.INT;
    types['te'] = Ext.data.Types.INT;
    types['ac'] = Ext.data.Types.INT;
    types['po'] = Ext.data.Types.INT;
    types['pr'] = Ext.data.Types.INT;
    types['au'] = Ext.data.Types.INT;
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
