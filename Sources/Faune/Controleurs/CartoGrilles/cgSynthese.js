//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheConsultable, idSelection = new Array(),
    region = CST_region, gptTheme = new Array(), filterPanel;

Ext.onReady(function() {
    // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
    basculeEcran(CST_region);
});

function basculeEcran(sens) {    
    //Couche de consultation
    coucheConsultable = new OpenLayers.Layer.Vector('Synthèse', {
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                    pointRadius: 5, // sized according to type attribute
                    fillColor: "#ffcc66",
                    strokeColor: "#ff9933",
                    strokeWidth: 2,
                    graphicZIndex: 1
                }),
                "select": new OpenLayers.Style({
                    fillColor: "#66ccff",
                    strokeColor: "#3399ff",
                    graphicZIndex: 2
                })
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
          {name:'gid'},
          {name:'id_obs'},
          {name:'grp_thematique'},
          {name:'date_operation'},
          {name:'date_obs'},
          {name:'nom_valide'},
          {name:'nom_vern'},
          {name:'statut_validation'},
          {name:'effectif'},
          {name:'effectif_textuel'},
          {name:'effectif_min'},
          {name:'effectif_max'},
          {name:'type_effectif'},
          {name:'phenologie'},
          {name:'localisation'},
          {name:'remarque_obs'},
          {name:'code_insee'},
          {name:'diffusable'},
          {name:'precision'},
          {name:'determination'},
          {name:'numerisateur_nom'},
          {name:'validateur_nom'},
          {name:'protocole_nom'},
          {name:'etude_nom'},
          {name:'structure_nom'},
          {name:'source'},
          {name: 'observateurs'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjSynthese.php',
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
        filters: [
            {type: 'string', dataIndex: 'grp_thematique', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'date_operation', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'date_obs', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_valide', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_vern', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string',dataIndex: 'observateurs', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'statut_validation', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'effectif', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'effectif_textuel', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'effectif_min', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'effectif_max', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'type_effectif', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'phenologie', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'localisation', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'remarque_obs', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'code_insee', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'diffusable', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'precision', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'determination', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'numerisateur_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'validateur_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'protocole_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'etude_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'structure_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'source', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'grp_thematique', header: 'Groupe thématique'},
            {dataIndex: 'date_operation', header: 'Date création'},
            {dataIndex: 'date_obs', header: 'Date obs'},
            {dataIndex: 'observateurs', header: 'Observateurs'},
            {dataIndex: 'nom_valide', header: 'Taxon'},
            {dataIndex: 'nom_vern', header: 'Nom vern.'},
            {dataIndex: 'determination', header: 'Determination'},
            {dataIndex: 'statut_validation', header: 'Validation'},
            {dataIndex: 'effectif', header: 'Effectif'},
            {dataIndex: 'effectif_textuel', header: 'Effectif textuel'},
            {dataIndex: 'effectif_min', header: 'Effectif min'},
            {dataIndex: 'effectif_max', header: 'Effectif max'},
            {dataIndex: 'type_effectif', header: 'Effectif type'},
            {dataIndex: 'phenologie', header: 'Phenologie'},
            {dataIndex: 'localisation', header: 'Localisation'},
            {dataIndex: 'remarque_obs', header: 'Remarque'},
            {dataIndex: 'code_insee', header: 'Code_insee'},
            {dataIndex: 'diffusable', header: 'Diffusable'},
            {dataIndex: 'precision', header: 'Precision'},
            {dataIndex: 'numerisateur_nom', header: 'Numerisateur'},
            {dataIndex: 'validateur_nom', header: 'Validateur'},
            {dataIndex: 'protocole_nom', header: 'Protocole'},
            {dataIndex: 'etude_nom', header: 'Etude'},
            {dataIndex: 'structure_nom', header: 'Structure'},
            {dataIndex: 'source', header: 'Source'}
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
        id: 'grilleSynthese', // unique pour conserver la configuration de la grille
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
        id: 'carteSynthese', // unique pour conserver la configuration de la carte
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
    filterPanel = filterPanelForm();
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
        items: [filterPanel, cartePanel, grillePanel]
    });
    //Chargement des données
    donneesGrille.load({
        params: {
            limit: '100' // affichage de tous les enregistrements
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
    types['gid'] = Ext.data.Types.INT;
    types['longitude'] = Ext.data.Types.FLOAT;
    types['latitude'] = Ext.data.Types.FLOAT;
    types['id'] = Ext.data.Types.INT;
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
            chGeom: 'geom',
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
function filterPanelForm() {
  
  //Ajout asynchrone de la liste des groupes thématiques
  var gptItemCheckBox = Array();
  Ext.Ajax.request({
      url: '../Modeles/GeoJson/gjThesaurus.php',
      params: { id_type: 1 },
      success: function(data) {
        gptTheme = JSON.parse(data.responseText);
        gptTheme = gptTheme['data'];
        for (var id in gptTheme){
           gptItemCheckBox.push({boxLabel: gptTheme[id],name: id});
        }
        var gptCheckboxGroup = new Ext.form.CheckboxGroup({
          id:'chkgroup_gpt',
          xtype: 'checkboxgroup',
          itemCls: 'x-check-group-alt',
          hideLabel:true,
          columns: 2,
          items: gptItemCheckBox
      });
      
      Ext.getCmp('gpt_fieldSet').add(gptCheckboxGroup);
      filterPanel.doLayout();
      },
  });
  var gptFieldSet = [{
      id : 'gpt_fieldSet',
      xtype: 'fieldset',
      title: 'Groupes thématiques',
      autoHeight: true,
      bodyStyle: 'margin:4px',
      defaults: {      // defaults applied to items
          layout: 'form',
          border: false,
          bodyStyle: 'padding:4px'
      },
      collapsible: true,
      items: {
      }
  }];
  var dateFieldSet = [{
    id : 'date_fieldSet',
    xtype: 'fieldset',
    title: 'Date',
    autoHeight: true,
    bodyStyle: 'margin:4px',
    defaults: {      // defaults applied to items
      layout: 'form',
      border: false,
      bodyStyle: 'padding:4px'
    },
    defaultType: 'datefield',
    collapsible: true,
    items: [{
        fieldLabel: 'Début',
        name: 'startdt',
        format : "Y-m-d",
        id: 'startdt',
        endDateField: 'enddt' // id of the end date field
      },{
        fieldLabel: 'Fin',
        name: 'enddt',
        format : "Y-m-d",
        id: 'enddt',
        startDateField: 'startdt' // id of the start date field
      }]
  }];
  
  
      //Combo d'auto-complétion "exposition"
   var comboValidation = createFilterCombobox('filter_statut_validation', 'Validation',
      '../Modeles/GeoJson/gjTableValue.php?table=grp_thematique_obs_occ&schema=synthese&column=statut_validation');
      //Combo d'auto-complétion "exposition"
   var comboSource = createFilterCombobox('filter_source', 'Source',
      '../Modeles/GeoJson/gjTableValue.php?table=grp_thematique_obs_occ&schema=synthese&column=source');
   var otherFormFielSet = [{
      id : 'other_fieldSet',
      xtype: 'fieldset',
      title: 'Autre',
      autoHeight: true,
      bodyStyle: 'margin:4px',
      defaults: {      // defaults applied to items
        layout: 'form',
        border: false,
        bodyStyle: 'padding:4px'
      },
      collapsible: true,
      items: [comboValidation,comboSource ]
    }];
  var fp = new Ext.FormPanel({
      id:'filter-panel',
      region:'west',
      title:'Filtres',
      split:true,
      width: 225,
      center: CST_center,
      collapsible: false,
      items: [gptFieldSet, dateFieldSet, otherFormFielSet],
      buttons: [{
        text: 'Filtrer',
         handler: filterForm,
      },{
          text: 'Reset',
          handler: function(){fp.getForm().reset();}
      }]
  });
  return fp;
}


function createFilterCombobox(id, fieldLabel, storeUrl) {
  return new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: storeUrl,
            fields: ['val']
        }),
        id: id,
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: fieldLabel,
        listeners: {
          render: function() {
            this.store.load();
          }
        }
    });
  
}


function filterForm(){
  var fp = Ext.getCmp('filter-panel');
  console.log(fp.getForm().getValues(true));
 if(fp.getForm().isValid()){
    var filtreGpt = Array();
    var sqlFiltres = Array();
    
    var filterValues = fp.getForm().getValues();
    
    for(var id in filterValues){
      if (id.substring(0,4) === 'gpt_' ) {
        filtreGpt.push(gptTheme[id]);
      }
      else if  (filterValues[id] !== '') {
        if (id === 'startdt' )  {
          sqlFiltres.push(" COALESCE(date_obs, date_debut_obs) >= '"+ filterValues[id] +"'" );
        }
        else if  (id === 'enddt' )  {
          sqlFiltres.push(" COALESCE(date_obs, date_debut_obs) <= '"+ filterValues[id] +"'" );
        }
        else if (id.substring(0,7) === 'filter_') {
          sqlFiltres.push(id.substring(7,id.length) +" = '"+ filterValues[id] +"'" );
        }
        
      }
    };
    if (filtreGpt.length >0) sqlFiltres.push(" grp_thematique IN ( '" + filtreGpt.join("', '") + "' )");
    
    var filterCmd ='';
    if (sqlFiltres.length >0) filterCmd = " AND " + sqlFiltres.join(" AND ");
    
    donneesGrille.reload({
      params: {
        filtreSel: filterCmd,
        limit: '1000'
      },
      callback: function(rs) {
        barrePaginat.setPageSize(rs.length, false);
      }
    });
  }
}
