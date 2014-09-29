//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheEditable, idSelection = new Array(),
    sensRegion = CST_region, numerisat, numerisateur, etiqStat, calqueEnvConvStatMax,
    calqueEnvConvStatMAJ, calqueStatOri, calqueGPX, calqueStatMAJ;

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
                    observateur = obj.observateur;
                    obr_id = obj.obr_id;
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
    var filtreZprEnCreation = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: 'zpr_id',
        value: null
    });
    var filtreZprAffectee = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: 'zpr_affectee',
        value: 't'
    });
    var filtreZprNonAffectee = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: 'zpr_affectee',
        value: 'f'
    });
    var filtreZprProprio = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: 'obr_id',
        value: obr_id
    });
    var filtreZprProprioAffectee = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [filtreZprAffectee, filtreZprProprio]
    });
    var filtreZprProprioNonAffectee = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [filtreZprNonAffectee, filtreZprProprio]
    });
    var filtreZprProprioNonAffecteeOuEnCreation = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.OR,
        filters: [filtreZprProprioNonAffectee, filtreZprEnCreation]
    });
    //Légende
    var reglesZP = [
        new OpenLayers.Rule({
            title: 'Mes ZP avec données',
            filter: filtreZprProprioAffectee,
            symbolizer: {
                //externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_green.png',
                fillOpacity: 0.2,
                fillColor: '#4CFF00',
                strokeColor: '#4CFF00',
                graphicZIndex: 2
            }
        }),
        new OpenLayers.Rule({
            title: 'Mes ZP sans données',
            filter: filtreZprProprioNonAffecteeOuEnCreation,
            symbolizer: {
                //externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_magenta.png',
                fillOpacity: 0.2,
                fillColor: '#FF00DC',
                strokeColor: '#FF00DC',
                graphicZIndex: 1
            }
        }),
        new OpenLayers.Rule({
            title: 'ZP des autres agents',
            elseFilter: true,
            symbolizer: {
                //externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_cyan.png',
                fillOpacity: 0.2,
                fillColor: 'cyan',
                strokeColor: 'cyan',
                graphicZIndex: 0
            }
        })
    ];
    var reglesStat = [
        new OpenLayers.Rule({
            title: 'Stations actuelles',
            symbolizer: {
                externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_red.png',
                strokeColor: 'red'
            }
        }),
        new OpenLayers.Rule({
            title: "Stations d'origine",
            symbolizer: {
                externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_blue.png',
                strokeColor: 'blue'
            }
        }),
        new OpenLayers.Rule({
            title: 'Zones historiques',
            symbolizer: {
                externalGraphic: '../../../Ergonomie/Cartes/Images/dot.png',
                strokeColor: 'black',
                fillOpacity: 0.5
            }
        })
    ];
    var legende = new GeoExt.VectorLegend({
        rules: reglesStat.concat(reglesZP),
        symbolType: 'Polygon'
    });
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Zones de prospection', {
        styleMap: new OpenLayers.StyleMap({
            'default': new OpenLayers.Style(null, {rules: reglesZP}),
            temporary: new OpenLayers.Style(null, {rules: reglesZP}),
            select: {
               //externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_yellow.png',
                fillColor: 'yellow',
                strokeColor: 'yellow'
            }
        }),
        rendererOptions: {zIndexing: true} // activation de l'ordre de superposition pour l'affichage des règles
    });
    //Calque des stations MAJ
    calqueStatMAJ = new OpenLayers.Layer.Vector('Stations actuelles', {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_red.png',
            strokeColor: 'red'
        })
    });
    calqueStatMAJ.visibility = false;
    //Calque des stations d'origine
    calqueStatOri = new OpenLayers.Layer.Vector("Stations d'origine", {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: '../../../Ergonomie/Cartes/Images/graphicfill_blue.png',
            strokeColor: 'blue'
        })
    });
    calqueStatOri.visibility = false;
    //Calque des enveloppes convexes des stations MAJ
    calqueEnvConvStatMAJ = new OpenLayers.Layer.Vector('Extensions stations actuelles', {
        styleMap: new OpenLayers.StyleMap({
            fill: false,
            strokeColor: 'red',
            strokeDashstyle: 'longdash'
        })
    });
    calqueEnvConvStatMAJ.visibility = false;
    //Calque des enveloppes convexes des stations MAJ
    calqueEnvConvStatMax = new OpenLayers.Layer.Vector('Zones historiques', {
        styleMap: new OpenLayers.StyleMap({
            externalGraphic: '../../../Ergonomie/Cartes/Images/dot.png',
            strokeColor: 'black',
            fillOpacity: 0.5
        })
    });
    calqueEnvConvStatMax.visibility = false;
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
    //Calques complémentaires pour la carte de base (ordre de superposition : haut
    //de pile vers bas puis ajout des étiquettes par clonage)
    carte.addLayers([calqueEnvConvStatMAJ, calqueStatMAJ, calqueStatOri,
        coucheEditable, calqueEnvConvStatMax, calqueGPX]);
    //Outil de dessin
    var	btnDessinPolygone = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Polygon, {
        title: 'Dessiner',
        displayClass: 'olControlDrawPolygon',
        featureAdded: ajouter,
        handlerOptions: {
            holeModifier: 'altKey'
        }
    });
    //Outil de modification des sommets
    var	btnModifGeom = new OpenLayers.Control.ModifyFeature(coucheEditable, {
        title: 'Modifier',
        displayClass: 'olControlModifyVertexes',
        onModificationEnd: function(feature) {
            if (btnModifGeom.modified) {
                redessiner(feature);
            }
        }
    });
    coucheEditable.events.on({
        sketchcomplete: function(data) {
            if (data.feature.geometry.components.length > 1) {
                redessiner(data.feature);
            }
        }    
    });
    //Outil de translation
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
    //Complément de la barre d'outils
    barreOutils.addControls([
        btnZoomSel,
        btnGlissGeom,
        btnModifGeom,
        btnDessinPolygone,
        btnSelGeom
    ]);
    //Combo d'auto-complétion "protocole"
    var comboProtocole = new Ext.form.ComboBox({
        id: 'ptc_id',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?table=saisie.protocole&chId=ptc_id&chVal=ptc_nom',
            fields: ['id', 'val']
        }),
        emptyText: 'Sélectionnez',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Protocole',
        allowBlank: false,
        blankText: 'Veuillez sélectionner le protocole !',
        forceSelection: true
    });
    comboProtocole.store.load({
        callback: function() {
            var valPtcId = recupereCookie('ptc_id');
            if (valPtcId > 0) {
                comboProtocole.setValue(valPtcId);
            }
            else {
                comboProtocole.setValue(CST_ptcIdEnjeux); // valeur du protocole par défaut "Inventaire Enjeux"
            }
        }
    });
    //Entrepôt des données
    var lecteurDonnees = new GeoExt.data.FeatureReader({        
        fields: [{name: 'st_asgeojson'},
            {name: 'zpr_id'},
            {name: 'zpr_nom'},
            {name: 'zpr_date'},
            {name: 'zpr_duree'},
            {name: 'zpr_num_j'},
            {name: 'zpr_cmt'},
            {name: 'observateur'},
            {name: 'obr_id'},
            {name: 'zpr_affectee'},
            {name: 'cpt_enjeux'},
            {name: 'cpt_station'},
            {name: 'cpt_lichen'},
            {name: 'cpt_flore'},
            {name: 'zpr_categorie'},
            {name: 'zpr_cibles'},
            {name: 'cibles'},
            {name: 'numerisat'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjZpr.php',
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
        sortInfo: {field: 'zpr_id', direction: 'DESC'} // tri par ordre décroissant de création
    });
     var donneesStatMAJ = new GeoExt.data.FeatureStore({
        layer: calqueStatMAJ,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjStatMAJ.php?calque=true',
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
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'zpr_id', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'zpr_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'date', dataIndex: 'zpr_date', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'numeric', dataIndex: 'zpr_duree', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'zpr_num_j', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'zpr_cmt', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'observateur', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'obr_id', menuItemCfgs : {emptyText: ''}},
            {type: 'boolean', dataIndex: 'zpr_affectee', defaultValue: null, yesText: 'Oui', noText: 'Non'},
            {type: 'numeric', dataIndex: 'cpt_enjeux', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'cpt_station', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'cpt_lichen', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'cpt_flore', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'zpr_categorie', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'zpr_cibles', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'cibles', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'numerisat', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'zpr_id', header: 'zpr_id', hidden: true},
            {dataIndex: 'zpr_nom', header: 'Nom'},
            {dataIndex: 'zpr_date', header: 'Date', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'zpr_duree', header: 'Durée (min)'},
            {dataIndex: 'zpr_num_j', header: 'Numéro journalier'},
            {dataIndex: 'zpr_cmt', header: 'Commentaires', hidden: true},
            {dataIndex: 'observateur', header: 'Observateur'},
            {dataIndex: 'obr_id', header: 'obr_id', hidden: true},
            {dataIndex: 'zpr_affectee', header: 'Données', renderer: traiteAffichageBoolean},
            {dataIndex: 'cpt_enjeux', header: 'Nb enjeux'},
            {dataIndex: 'cpt_station', header: 'Nb suivi'},
            {dataIndex: 'cpt_lichen', header: 'Nb lichen'},
            {dataIndex: 'cpt_flore', header: 'Nb pt flore'},
            {dataIndex: 'zpr_categorie', header: 'Catégorie', hidden: true},
            {dataIndex: 'zpr_cibles', header: 'zpr_cibles', hidden: true},
            {dataIndex: 'cibles', header: 'Cibles'},
            {dataIndex: 'numerisat', header: 'Numérisateur'}
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
            }, {
                text: 'Modifier',
                tooltip: 'Modifier la zone prospectée sélectionnée',
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: 'Supprimer la zone prospectée sélectionnée',
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
            }, '-',
            comboProtocole,
            {
                text: 'Associer données',
                tooltip: 'Associer des données pour la zone prospectée sélectionnée',
                handler: affecterProtocole,
                iconCls: 'go_form'
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: 'grilleZpr', // unique pour conserver la configuration de la grille
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
    // Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: 'carteZpr', // unique pour conserver la configuration de la carte
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
    //Panel de la légende
    var legendePanel = new GeoExt.LegendPanel({
        width: 170,
        region: 'west',
        layerStore: new GeoExt.data.LayerStore(),
        items: [legende]
    });
    //Panel de la carto-légende
    var cartoLegendePanel = new Ext.Panel({
        id: 'ecranZpr', // unique pour conserver la configuration de l'écran
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
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartoLegendePanel, grillePanel]
    });
    donneesStatMAJ.load();
    donneesStatOri.load();
    donneesEnvConvStatMAJ.load();    
    donneesEnvConvStatMax.load({
        callback: function(rs) {
            etiqStat = calqueEnvConvStatMax.clone();
            etiqStat.name = 'Etiquettes des stations';
            etiqStat.styleMap = new OpenLayers.StyleMap({
                fillOpacity: 0,
                strokeOpacity: 0,
                label: '${bio_code}\n\n${bio_fiche}',
                fontColor: 'black',
                fontSize: '14px',
                fontWeight: 'bold',
                labelAlign: 'cm',
                labelHaloColor: 'white',
                labelHaloWidth: 3
            });
            carte.addLayers([etiqStat]);
            //alert(JSON.stringify(carte.Z_INDEX_BASE));
            //carte.raiseLayer(etiqStat, -carte.layers.length);
          /*  alert('calqueEnvConvStatMax : ' + carte.getLayerIndex(calqueEnvConvStatMax));
            alert('calqueEnvConvStatMax : ' + calqueEnvConvStatMax.getZIndex());
            alert('coucheEditable : ' + carte.getLayerIndex(coucheEditable));
            alert('coucheEditable : ' + coucheEditable.getZIndex());
            alert('calqueEnvConvStatMAJ : ' + carte.getLayerIndex(calqueEnvConvStatMAJ));
            alert('calqueEnvConvStatMAJ : ' + calqueEnvConvStatMAJ.getZIndex());
            alert('calqueStatOri : ' + carte.getLayerIndex(calqueStatOri));
            alert('calqueStatOri : ' + calqueStatOri.getZIndex());
            alert('calqueStatMAJ : ' + carte.getLayerIndex(calqueStatMAJ));
            alert('calqueStatMAJ : ' + calqueStatMAJ.getZIndex());
            alert('etiqStat : ' + carte.getLayerIndex(etiqStat));
            alert('etiqStat : ' + etiqStat.getZIndex());*/
            //carte.raiseLayer(carte.getLayersByName('Etiquettes des stations')[0], carte.layers.length);
        }
    });
    donneesGrille.load({
        callback: function(rs) {
            barrePaginat.setPageSize(rs.length, false);
            // correction du bug d'affichage de la barre de pagination
            //AS -> pas compris le problème; pourquoi le nb d'enregistrement était bloqué
            //barrePaginat.afterTextItem.setText('sur 1');
        }
    });
}

//Ajout
function ajouter(feature) {
    ajoute(feature.geometry.transform(carte.getProjectionObject(), new OpenLayers.Projection('EPSG:4326')));
}

//Modification
function modifier() {
    if (grille.selModel.getCount() == 1) {
        modifie();
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une zone prospectée et une seule !').setIcon(Ext.MessageBox.WARNING);
    }
}
function redessiner(feature) {
    Ext.Ajax.request({
        url: '../Controleurs/Gestions/GestZpr.php',
        params: {
            action: 'Redessiner',
            zpr_id: feature.attributes['zpr_id'],
            zpr_geom: feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
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
            Ext.MessageBox.confirm('Confirmation', 'ATTENTION : cette action supprimera également toutes les données associées !!! Etes-vous sûr de vouloir supprimer la zone prospectée sélectionnée ? ', supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'ATTENTION : cette action supprimera également toutes les données associées !!! Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' zones prospectées sélectionnées ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une zone prospectée !').setIcon(Ext.MessageBox.WARNING);
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
                url: '../Controleurs/Gestions/GestZpr.php',
                params: {
                    action: 'Supprimer',
                    zpr_id: grille.selModel.getSelected().data['zpr_id']
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
            var listId = selection[0].data['zpr_id'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['zpr_id'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestions/GestZpr.php',
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
    types['zpr_id'] = Ext.data.Types.INT;
    types['zpr_date'] = Ext.data.Types.DATE;
    types['zpr_duree'] = Ext.data.Types.INT;
    types['obr_id'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND zpr_id';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['zpr_id'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['zpr_id'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['zpr_id'];
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
        idSelection[i] = selection[i].data['zpr_id'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['zpr_id']) == -1) {
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
            chGeom: 'saisie.zone_prospection.zpr_geom',
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

//affecterProtocole
function affecterProtocole() {
    if (grille.selModel.getCount() == 1) {
        creeCookie('ptc_id', Ext.getCmp('ptc_id').value, 365);
        if (Ext.getCmp('ptc_id').value == 1) {
            if ((grille.selModel.getSelected().data['cpt_enjeux'] > 0) && (numerisateur != 303)) {
                Ext.MessageBox.confirm('Attention', 'Des données ont déjà été saisies pour ce protocole & cette ZP à cette date ! <br> Modifier ces données ?', function(btn) {
                    if (btn == 'yes') {
                        document.location.href = 'vSaisiePop.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                    }}).setIcon(Ext.MessageBox.WARNING);
            }
            else {
                document.location.href = 'vSaisiePop.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
            }
        }
        else {
            if (Ext.getCmp('ptc_id').value == 2) {
                if ((grille.selModel.getSelected().data['cpt_station'] > 0) && (numerisateur != 303)) {
                    Ext.MessageBox.confirm('Attention', 'Des données ont déjà été saisies pour ce protocole & cette ZP à cette date ! <br> Modifier ces données ?', function(btn) {
                    if (btn == 'yes') {
                        document.location.href = 'vChoixStat.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                    }}).setIcon(Ext.MessageBox.WARNING);
                }
                else {
                    document.location.href = 'vChoixStat.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                }
            }
            else {
                if (Ext.getCmp('ptc_id').value == 3) {
                    if ((grille.selModel.getSelected().data['cpt_lichen'] > 0) && (numerisateur != 303)) {
                        Ext.MessageBox.confirm('Attention', 'Des données ont déjà été saisies pour ce protocole & cette ZP à cette date ! <br> Modifier ces données ?', function(btn) {
                        if (btn == 'yes') {
                            document.location.href = 'vSaisieBioLic.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                        }}).setIcon(Ext.MessageBox.WARNING);
                    }
                    else {
                        document.location.href = 'vSaisieBioLic.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                    }
                }
                else {
                    if ((grille.selModel.getSelected().data['cpt_flore'] > 0) && (numerisateur != 303)) {
                        Ext.MessageBox.confirm('Attention', 'Des données ont déjà été saisies pour ce protocole & cette ZP à cette date ! <br> Modifier ces données ?', function(btn) {
                        if (btn == 'yes') {
                            document.location.href = 'vSaisieBioFlo.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                        }}).setIcon(Ext.MessageBox.WARNING);
                    }
                    else {
                        document.location.href = 'vSaisieBioFlo.php?zpr_id=' + grille.selModel.getSelected().data['zpr_id'];
                    }
                }
            }
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une zone prospectée et une seule !').setIcon(Ext.MessageBox.WARNING);
    }
}

//Appel du formulaire de chargement GPX
function afficherGPX() {
    afficheGPX();
}
