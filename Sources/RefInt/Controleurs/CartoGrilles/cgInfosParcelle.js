//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheConsultable, idSelection = new Array(),
    region = CST_region;

Ext.onReady(function() {
    // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
    basculeEcran(CST_region);
});

function basculeEcran(sens) {    ;
    //Couche de consultation
    coucheConsultable = new OpenLayers.Layer.Vector('Parcellaire cadastral', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                strokeColor: 'red',
                strokeOpacity: 0.75,
                strokeWidth: 1,
                fillColor: 'blue',
                fillOpacity: 0.25,
                label : '${parc_insee}',
                fontWeight: 'bold'
            },
            select: {
                fillColor: 'yellow',
                fillOpacity: 0.5
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
            {name: 'ident'},
            {name: 'gid'},
            {name: 'com_nom_maj'},
            {name: 'com_insee'},
            {name: 'parc_insee'},
            {name: 'per_nom'},
            {name: 'per_p_nom'},
            {name: 'per_p_prenom'},
            {name: 'gpm_lib'},
            {name: 'surf_ha_dgi'},
            {name: 'tdr_lib'},
            {name: 'ntp_lib'},
            {name: 'ind_lib'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjInfosParcelle.php',
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
        filters:[
            //{type: 'string', dataIndex: 'ident', emptyText: 'Ex. : Val1||Val2||Val3'},
            //{type: 'numeric', dataIndex: 'gid', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'com_nom_maj', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'com_insee', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'parc_insee', emptyText: 'Ex. : Val1||Val2||Val3'},
            /*{type: 'string', dataIndex: 'per_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'per_p_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'per_p_prenom', emptyText: 'Ex. : Val1||Val2||Val3'},*/
            {type: 'string', dataIndex: 'gpm_lib', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'surf_ha_dgi', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'tdr_lib', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'ntp_lib', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'ind_lib', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'ident', header: 'IDENT', hidden: true},
            {dataIndex: 'gid', header: 'GID', hidden: true},
            {dataIndex: 'com_nom_maj', header: 'Commune'},
            {dataIndex: 'com_insee', header: 'INSEE (Commune)'},
            {dataIndex: 'parc_insee', header: 'INSEE (Parcelle)'},
            {dataIndex: 'per_nom', header: 'Raison sociale'},
            {dataIndex: 'per_p_nom', header: 'Nom'},
            {dataIndex: 'per_p_prenom', header: 'Prénom'},
            {dataIndex: 'surf_ha_dgi', header: 'Surf. ha DGI'},
            {dataIndex: 'gpm_lib', header: 'Personne morale'},
            {dataIndex: 'tdr_lib', header: 'Type droit'},
            {dataIndex: 'ntp_lib', header: 'Nature personne'},
            {dataIndex: 'ind_lib', header: 'Type indivision'}
        ]
    });
    //Barre de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Mesurer sélection',
                tooltip: 'Mesurer la sélection en cours',
                handler: function() {calculerSurfaceHaSelection('ident', 'surf_ha_dgi', 'mesures');},
                iconCls: 'measure'
            }, {
                xtype: 'label',
		id: 'mesures'
            }, '-', {
                text: 'Basculer écran',
                tooltip: "Basculer l'écran",
                handler: basculerEcran,
                iconCls: 'switch'
            }, '-', /*{
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            }, '-', */{
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
            }, '-', {
                text: 'Zoomer Lon Lat :',
                tooltip: 'Zoomer aux coordonnées géographiques saisies',
                handler: zoomerXY,
                iconCls: 'zoom_XY'
            }, '-', {
                xtype: 'numberfield',
                fieldLabel: 'Longitude',
                id: 'longitude',
                decimalSeparator: '.',
                minValue: 3.182571,
                maxValue: 4.237691,
                blankText: 'Veuillez saisir la longitude !',
                decimalPrecision: 16,
                width: 60
            }, {
                xtype: 'numberfield',
                fieldLabel: 'Latitude',
                id: 'latitude',
                decimalSeparator: '.',
                minValue:  43.92501,
                maxValue: 44.592999,
                blankText: 'Veuillez saisir la latitude !',
                decimalPrecision: 16,
                width: 60
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grilleInfosParcelle', // unique pour conserver la configuration de la grille
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
        id: 'carteInfosParcelle', // unique pour conserver la configuration de la carte
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
        // activation de l'outil par défaut
        listeners: {afterlayout : function() {
            barreOutils.activateControl(btnMvt);
        }},
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
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['gid'] = Ext.data.Types.INT;
    types['surf_ha_dgi'] = Ext.data.Types.FLOAT;
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
    if (carte.getScale() < 25000) {
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
    else {
        Ext.MessageBox.alert('Attention !!!', 'Vous devez être à une échelle plus précise.').setIcon(Ext.MessageBox.WARNING);
    }
}

//Zoom aux coordonnées géographiques saisies
function zoomerXY() {
    if (Ext.getCmp('longitude').value && Ext.getCmp('latitude').value && Ext.getCmp('longitude').isValid()
    && Ext.getCmp('latitude').isValid()) {
        var zoom = 16;
        if (carte.zoom > 16) {
            zoom = carte.zoom;
        }
        carte.moveTo(new OpenLayers.LonLat(Ext.getCmp('longitude').value, Ext.getCmp('latitude').value).transform(
            new OpenLayers.Projection('EPSG:4326'), carte.getProjectionObject()), zoom);        
    }
    else {
       Ext.MessageBox.alert('Attention', 'Vous devez saisir des coordonnées géographiques').setIcon(Ext.MessageBox.WARNING);
    }
}

//Filtrage sur les éléments sélectionnés
function calculerSurfaceHaSelection(chRegr, chSurfHa, idElt) {
    var ctrlTxt = document.getElementById(idElt);
    if (ctrlTxt) {
        var txt = '';
        var surf = 0;
        var nbSel = grille.selModel.getCount();
        if (nbSel > 0) {
            if (nbSel == 1) {
                surf = parseFloat(grille.selModel.getSelected().data[chSurfHa]);
            }
            else {
                var selection = grille.selModel.getSelections();
                var listValId = new Array();
                for (var i = 0; i < nbSel; i++) {
                    if (Array.indexOf(listValId, selection[i].data[chRegr]) == -1) {
                        surf += parseFloat(selection[i].data[chSurfHa]);
                        listValId.push(selection[i].data[chRegr]);
                    }
                }
            }
        }
        if (surf > 0) {
            txt += 'Surf : ' + surf.toFixed(4) + ' Ha';
        }
        ctrlTxt.innerHTML = txt;
    }
}
