//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, toucheENTREE = true, comboTypeMilieu, comboPheno,
    comboStatutValid, comboExpo, comboGermination, listMenaces, comboAjoutMenace,
    comboCorineBiotope, modeResiliation = false;

Ext.onReady(function() {
    //Combo d'auto-complétion "Corine biotope"
    comboCorineBiotope = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?table=inpn.v_corine_biotope&chId=cd_cb&chVal=cd_cb_lb_cb97_fr',
            fields: ['id', 'val']
        }),
        id: 'cd_cb',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'CORINE biotope',
        forceSelection: true
    });
    //Combo d'auto-complétion "germination"
    comboGermination = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_germination',
            fields: ['val']
        }),
        id: 'pop_sta_germination',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Germination'
    });
    //Combo d'auto-complétion "exposition"
    comboExpo = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_expo',
            fields: ['val']
        }),
        id: 'pop_sta_expo',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Exposition dominante'
    });
    //Combo d'auto-complétion "type de milieu"
    comboTypeMilieu = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: "../Modeles/Json/jListVal.php?table=saisie.grand_type_milieu&chId=\n\
                gtm_code&chVal=gtm_code || ' - '  ||gtm_libelle&chOrderBy=gtm_code",
            fields: ['id', 'val']
        }),
        id: 'gtm_code',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Grand type de milieu'
    });
    //Combo d'auto-complétion "phénologie"
    comboPheno = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_pheno',
            fields: ['val']
        }),
        id: 'pop_pheno',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Phénologie dominante'
    });
    //Combo d'auto-complétion "statut de validation"
    comboStatutValid = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_statut_validation',
            fields: ['val']
        }),
        hidden: true,
        id: 'pop_statut_validation',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Statut de validation'
    });
    //Gestion de la liste des menaces
    comboAjoutMenace = new Ext.form.ComboBox({
        submitValue: false,
        forceSelection: true,
        width: 230,
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jCodesMenaces.php',
            fields: ['code', 'libelle']
        }),
        emptyText: 'Sélectionnez pour ajouter',
        mode: 'local',
        displayField: 'libelle',
        valueField: 'code',
        listeners: {
            select: function() {selectionne(this, listMenaces);}
        }
    });
    listMenaces = new Ext.ux.form.MultiSelect({
        delimiter: '&',
        width: 275,
        store: new Ext.data.ArrayStore({
            fields: ['code', 'libelle']
        }),
        displayField: 'libelle',
	valueField: 'code',
        tbar: [
            comboAjoutMenace, {
                text: 'Suppr.',
                handler: function() {supprimeSelection(comboAjoutMenace, listMenaces);}
            }
        ]
    });
    var listMenacesPanel = new Ext.Panel({
        fieldLabel: 'Liste des menaces',
        items: listMenaces,
        id: 'listMenacesPanel'
    });
    var listPheno = new Ext.Panel({
        fieldLabel: 'Stades phénologiques',
        items: {
            layout: 'column',
                items: [{
                        labelWidth: 81,
                        defaults: {height: 22},
                        labelSeparator: '',
                        columnWidth: 0.43,
                        layout: 'form',
                        items: [{
                                fieldLabel: 'Végétatif'
                            }, {
                                fieldLabel: 'Bourgeon'
                            }, {
                                fieldLabel: 'Floraison'
                            }, {
                                fieldLabel: 'Fructification'
                            }, {
                                fieldLabel: 'Dissémination'
                            }
                        ]
                    }, {
                        labelWidth: 1,
                        defaults: {height: 22},
                        columnWidth: 0.1,
                        layout: 'form',
                        items: [{
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_pop_sta_vegetatif'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_pop_sta_bourgeon'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_pop_sta_floraison'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_pop_sta_fructification'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_pop_sta_dissemination'
                            }
                        ]
                    }, {
                        labelWidth: 23,
                        defaults: {width: 46},
                        columnWidth: 0.47,
                        layout: 'form',
                        items:[{
                                xtype: 'spinnerfield',
                                minValue: 1,
                                id: 'pop_sta_vegetatif',
                                listeners: {
                                    specialkey: function(field, e){
                                        if (e.getKey() == e.ENTER) {
                                            calculePheno();
                                        }
                                    },
                                    spin: calculePheno,
                                    change: calculePheno,
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'spinnerfield',
                                minValue: 1,
                                id: 'pop_sta_bourgeon',
                                listeners: {
                                    specialkey: function(field, e){
                                        if (e.getKey() == e.ENTER) {
                                            calculePheno();
                                        }
                                    },
                                    spin: calculePheno,
                                    change: calculePheno,
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'spinnerfield',
                                minValue: 1,
                                id: 'pop_sta_floraison',
                                listeners: {
                                    specialkey: function(field, e){
                                        if (e.getKey() == e.ENTER) {
                                            calculePheno();
                                        }
                                    },
                                    spin: calculePheno,
                                    change: calculePheno,
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'spinnerfield',
                                minValue: 1,
                                id: 'pop_sta_fructification',
                                listeners: {
                                    specialkey: function(field, e){
                                        if (e.getKey() == e.ENTER) {
                                            calculePheno();
                                        }
                                    },
                                    spin: calculePheno,
                                    change: calculePheno,
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'spinnerfield',
                                minValue: 1,
                                id: 'pop_sta_dissemination',
                                listeners: {
                                    specialkey: function(field, e){
                                        if (e.getKey() == e.ENTER) {
                                            calculePheno();
                                        }
                                    },
                                    spin: calculePheno,
                                    change: calculePheno,
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }
                        ]
                    }
                 ]
            }
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: function() {if (toucheENTREE) {soumettre()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'pop_sta_non_revue'
            }, {
                xtype: 'hidden',
                id: 'pop_rq_photo'
            }, {
                xtype: 'hidden',
                id: 'pop_url_photo'
            }, {
                xtype: 'hidden',
                id: 'pop_sta_menaces'
            }, {
                submitValue: false,
                xtype: 'hidden',
                id: 'menaces'
            }, {
                xtype: 'hidden',
                id: 'pop_geom'
            }, {
                xtype: 'hidden',
                id: 'action'
            }, {
                xtype: 'hidden',
                id: 'pop_id'
            }, {
                xtype: 'hidden',
                id: 'zpr_id'
            }, {
                xtype: 'hidden',
                id: 'bio_id'
            }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
            }, {
                layout: 'column',
                items: [{
                        labelWidth: 195,
                        labelAlign: 'right',
                        defaults: {width: 275},
                        labelSeparator: ' :',
                        columnWidth: 0.55,
                        layout: 'form',
                        id: 'colonneGauchePanel',
                        items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Numéro de population',
                                id: 'pop_etiquette',
                                allowBlank: false,
                                blankText: 'Veuillez renseigner le numéro de population !'
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Descriptif du milieu',
                                id: 'pop_descriptif'
                            },
                            comboTypeMilieu,
                            comboCorineBiotope,
                            comboExpo,
                            {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Pente (en °)',
                                minValue: 0,
                                maxValue: 90,
                                id: 'pop_sta_pente'
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Recouvrement végétation (en %)',
                                minValue: 0,
                                maxValue: 100,
                                id: 'pop_sta_recouvrement'
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Hauteur végétation (en m)',
                                id: 'pop_sta_hauteur_vegetation',
                                minValue: 0,
                                maxValue: 50,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Sol nu (en %)',
                                minValue: 0,
                                maxValue: 100,
                                id: 'pop_sta_sol_nu'
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Rocher nu (en %)',
                                minValue: 0,
                                maxValue: 100,
                                id: 'pop_sta_rocher_nu'
                            }, {
                                xtype: 'textarea',
                                height: 74,
                                labelSeparator: '',
                                fieldLabel: 'Remarques biotope : <p style="font-size:9px">(historique, gestion, dynamique, ...)</p>',
                                id: 'pop_sta_rq_biotope',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, 
                            listMenacesPanel
                        ]
                    }, {
                        labelWidth: 180,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.45,
                        layout: 'form',
                        id: 'colonneDroitePanel',
                        items: [{
                                xtype: 'radiogroup',
                                id: 'pop_sta_nb_precis',
                                fieldLabel: 'Type de comptage',
                                allowBlank: false,
                                blankText: 'Veuillez renseigner le type de comptage !',
                                items: [{
                                        boxLabel: 'Approximation', name: 'pop_sta_nb_precis', inputValue: 'f'
                                    }, {
                                        boxLabel: 'Effectif précis', name: 'pop_sta_nb_precis', inputValue: 't'
                                    }
                                ],
                                listeners: {
                                    change: function(rg, r) {
                                            // renseignement du contrôle caché associé et configuration de saisie (suite)
                                        switch (r.inputValue) {
                                            case 't':
                                                Ext.getCmp('choix_pop_sta_vegetatif').hide();
                                                Ext.getCmp('choix_pop_sta_bourgeon').hide();
                                                Ext.getCmp('choix_pop_sta_floraison').hide();
                                                Ext.getCmp('choix_pop_sta_fructification').hide();
                                                Ext.getCmp('choix_pop_sta_dissemination').hide();
                                                Ext.getCmp('pop_sta_vegetatif').show();
                                                Ext.getCmp('pop_sta_bourgeon').show();
                                                Ext.getCmp('pop_sta_floraison').show();
                                                Ext.getCmp('pop_sta_fructification').show();
                                                Ext.getCmp('pop_sta_dissemination').show();
                                                Ext.getCmp('pop_sta_vegetatif').setMinValue(1);
                                                Ext.getCmp('pop_sta_bourgeon').setMinValue(1);
                                                Ext.getCmp('pop_sta_floraison').setMinValue(1);
                                                Ext.getCmp('pop_sta_fructification').setMinValue(1);
                                                Ext.getCmp('pop_sta_dissemination').setMinValue(1);
                                                Ext.getCmp('pop_nb').disable();
                                                comboPheno.disable();
                                                break;
                                            case 'f':
                                                Ext.getCmp('choix_pop_sta_vegetatif').show();
                                                Ext.getCmp('choix_pop_sta_bourgeon').show();
                                                Ext.getCmp('choix_pop_sta_floraison').show();
                                                Ext.getCmp('choix_pop_sta_fructification').show();
                                                Ext.getCmp('choix_pop_sta_dissemination').show();
                                                Ext.getCmp('pop_sta_vegetatif').hide();
                                                Ext.getCmp('pop_sta_bourgeon').hide();
                                                Ext.getCmp('pop_sta_floraison').hide();
                                                Ext.getCmp('pop_sta_fructification').hide();
                                                Ext.getCmp('pop_sta_dissemination').hide();
                                                Ext.getCmp('pop_sta_vegetatif').setMinValue(-1);
                                                Ext.getCmp('pop_sta_bourgeon').setMinValue(-1);
                                                Ext.getCmp('pop_sta_floraison').setMinValue(-1);
                                                Ext.getCmp('pop_sta_fructification').setMinValue(-1);
                                                Ext.getCmp('pop_sta_dissemination').setMinValue(-1);
                                                Ext.getCmp('pop_nb').enable();
                                                comboPheno.enable();
                                                break;
                                        }
                                    }
                                }
                            }, 
                            listPheno,
                            {
                                width: 160,
                                xtype: 'spinnerfield',
                                fieldLabel: 'Effectif',
                                minValue: 0,
                                id: 'pop_nb',
                                allowBlank: false,
                                blankText: "Veuillez renseigner l'effectif !"
                            },
                            comboPheno,
                            comboGermination, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Surface (en m²)',
                                minValue: 0,
                                id: 'pop_surf',
                                validator: function(val) {
                                   if ((val == '' ) || (val == parseInt(val))) {
                                      return true;
                                   } else {
                                       return "La surface doit être un entier";
                                   }
                                }
                            }, {
                                xtype: 'textarea',
                                height: 147,
                                labelSeparator: '',
                                fieldLabel: 'Remarques population : <p style="font-size:9px">(phénologie, prédation, ...)</p>',
                                id: 'pop_rq',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, 
                            comboStatutValid
                        ]
                    }
                ]
            }
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotal = new Ext.Panel({
        items: formulaire,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    handler: importerPhoto,
                    iconCls: 'photo',
                    tooltip: 'Visualiser / Charger une photo'
                }, {
                    xtype: 'label',
                    text: 'Photo:'
                }, {
                    xtype: 'textfield',
                    id: 'nom_photo',
                    readOnly: true
                }, {
                    id: 'info_photo',
                    iconCls: 'user_comment',
                    tooltipType : 'title',
                    disabled: true
                } , '-', {
                    id: 'boutonPrecedent',
                    text: 'Précédent',
                    handler: afficherPrecedent,
                    iconCls: 'precedent',
                    tooltip: 'Afficher la donnée précédente'
                }, '-', {
                    id: 'boutonSuivant',
                    text: 'Suivant',
                    handler: afficherSuivant,
                    iconCls: 'suivant',
                    tooltip: 'Afficher la donnée suivante'
                }, '-', {
                    text: 'Enregistrer',
                    handler: soumettre,
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnuler',
                    text: 'Annuler',
                    handler: function() {
                        fenetreFormulaire.hide();
                        if (Ext.getCmp('action').value == 'Ajouter') { // en ajout, il faut recharger pour enlever la géométrie
                            donneesGrille.reload();
                        }
                    },
                    iconCls: 'cancel'
                }
            ],
            id: 'statusbar',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreFormulaire = new Ext.Window({
        modal: true,
        resizable: false,
        title: 'Saisie des populations pour le protocole et la zone prospectée en cours',
        width: 900,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnuler').handler,
        listeners: {
            afterlayout: function() {this.center();}
        }
    });
    //Initialisation des listes
    comboGermination.store.load();
    comboExpo.store.load();
    comboTypeMilieu.store.load();
    comboPheno.store.load();
    comboStatutValid.store.load();
    comboCorineBiotope.store.load();
});

//Affichage en mode ajout
function ajoute(geom) {
    initialiseFormulaire();
    // affectation du mode en ajout
    Ext.getCmp('action').setValue('Ajouter');
    // blocage des boutons de navigation
    Ext.getCmp('boutonPrecedent').disable();
    Ext.getCmp('boutonSuivant').disable();
    // gestion du focus
    Ext.getCmp('pop_etiquette').focus('', 2000); // focus de 2000 ms sinon ça ne marche pas
    Ext.getCmp('pop_geom').setValue(geom);
    Ext.getCmp('zpr_id').setValue(GetParam('zpr_id'));
    Ext.getCmp('bio_id').setValue(GetParam('bio_id'));
    Ext.getCmp('pop_sta_nb_precis').setValue('t');
    // traitement de la géomérie
    if (geom.CLASS_NAME == 'OpenLayers.Geometry.Polygon') {
        Ext.getCmp('pop_surf').setValue(Math.round(geom.getGeodesicArea()));
    }
    if (numerisateur == 48) {
        comboStatutValid.setValue('OK (Frantz Hopkins)');
    }
    else {
        if (numerisateur == 79) {
            comboStatutValid.setValue('OK (Emeric Sulmont)');
        }
    }
    finaliseFormulaire();
}

//Affichage en mode modification
function modifie() {
    initialiseFormulaire();
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPrecedent').setDisabled(!grille.selModel.hasPrevious());
    Ext.getCmp('boutonSuivant').setDisabled(!grille.selModel.hasNext());
    // remplissage du formulaire
    var geom = coucheEditable.selectedFeatures[0].geometry.clone(); // clônage car pas de reload ensuite si annuler
    Ext.getCmp('pop_geom').setValue(geom.transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')));
    var selected = grille.selModel.getSelected();
    for (var donnee in selected.data) {
        if (Ext.getCmp(donnee)) {
            Ext.getCmp(donnee).setValue(selected.data[donnee]);
        }
    }
    // affectation du mode en modif
    Ext.getCmp('action').setValue('Modifier');
    finaliseFormulaire();
}

//Fonction appelée après un enregistrement réussi
function termineAffichage() {
    // modes ajout et modif
    fenetreFormulaire.hide();
    donneesGrille.reload();
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettre() {
    // "allowBlank" forcée à "true" car bug de "Ext.ux.form.MultiSelect"
    listMenaces.allowBlank = true;
    // réactivation forcée des contrôles "Disabled" pour permettre leur soumission
    Ext.getCmp('pop_nb').enable(); // mais également contrôler le caractère obligatoire de l'effectif (champ "pop_nb")
    comboPheno.enable();
    if (formulaire.form.isValid()) {
        // traitement du cas du comptage imprécis pour tous les stades phénologiques
        traiteComptagePhenoImprecis();
        if (comboGermination.getRawValue() == '') {
            comboGermination.setRawValue('');
        }
        if (comboExpo.getRawValue() == '') {
            comboExpo.setRawValue('');
        }
        if (comboTypeMilieu.getRawValue() == '') {
            comboTypeMilieu.setRawValue('');
        }
        else {
            comboTypeMilieu.setRawValue(comboTypeMilieu.getValue());
        }
        if (comboPheno.getRawValue() == '') {
            comboPheno.setRawValue('');
        }
        if (comboStatutValid.getRawValue() == '') {
            comboStatutValid.setRawValue('');
        }
        if (comboCorineBiotope.getRawValue() == '') {
            comboCorineBiotope.setRawValue('');
        }
        else {
            comboCorineBiotope.setRawValue(comboCorineBiotope.getValue());
        }
        // récupération des codes depuis les listes
        listMenaces.view.selectRange(0, listMenaces.store.getCount() - 1);
        Ext.getCmp('pop_sta_menaces').setValue(listMenaces.getValue());
        if (verifiePhenoDominanteCochee()) {
            templateValidation('../Controleurs/Gestions/GestPopStat.php', Ext.getCmp('statusbar'),
                formulaire, termineAffichage);
        }
    }
    else {
        // remise des contrôles "Disabled" dans l'état d'avant
        if (Ext.getCmp('pop_sta_nb_precis').getValue().inputValue == 't') {
            Ext.getCmp('pop_nb').disable();
            comboPheno.disable();
        }
        Ext.getCmp('statusbar').setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
    }
}

//Initialisation du formulaire
function initialiseFormulaire() {
    // gestion des droits particuliers pour l'observateur 303 "Chargé de missions" FLORE
    if (numerisateur_droit >= 5) {
        comboStatutValid.setVisible(true);
        Ext.getCmp('pop_rq').height = 119;
    }
    fenetreFormulaire.show();
    // mise à zéro des contrôles sur les onglets actifs
    formulaire.form.reset();
    // complément d'initialisation du formulaire
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    // réinitialisation des variables globales
    toucheENTREE = true;
    // initialisation des listes
    listMenaces.store.removeAll();
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherPrecedent() {
    if (grille.selModel.selectPrevious()) {
        modifie();
    }
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherSuivant() {
    if (grille.selModel.selectNext()) {
        modifie();
    }
}

//Fonction de recalcul de la somme et du choix automatique de la dominance des phénologies
function calculePheno() {
    var pop_sta_vegetatif = 0;
    var pop_sta_bourgeon = 0;
    var pop_sta_floraison = 0;
    var pop_sta_fructification = 0;
    var pop_sta_dissemination = 0;
    if (Ext.getCmp('pop_sta_vegetatif').getValue() > 0) {
        pop_sta_vegetatif = Ext.getCmp('pop_sta_vegetatif').getValue();
    }
    if (Ext.getCmp('pop_sta_bourgeon').getValue() > 0) {
        pop_sta_bourgeon = Ext.getCmp('pop_sta_bourgeon').getValue();
    }
    if (Ext.getCmp('pop_sta_floraison').getValue() > 0) {
        pop_sta_floraison = Ext.getCmp('pop_sta_floraison').getValue();
    }
    if (Ext.getCmp('pop_sta_fructification').getValue() > 0) {
        pop_sta_fructification = Ext.getCmp('pop_sta_fructification').getValue();
    }
    if (Ext.getCmp('pop_sta_dissemination').getValue() > 0) {
        pop_sta_dissemination = Ext.getCmp('pop_sta_dissemination').getValue();
    }
    Ext.getCmp('pop_nb').setValue(pop_sta_vegetatif + pop_sta_bourgeon + pop_sta_floraison +
        pop_sta_fructification + pop_sta_dissemination);
    var maxPheno = Math.max(pop_sta_vegetatif, pop_sta_bourgeon, pop_sta_floraison,
        pop_sta_fructification, pop_sta_dissemination);
       switch (maxPheno) {
           case pop_sta_vegetatif:
               comboPheno.setValue('végétatif');
           break;
           case pop_sta_bourgeon:
               comboPheno.setValue('bourgeon');
           break;
           case pop_sta_floraison:
               comboPheno.setValue('fleur');
           break;
           case pop_sta_fructification:
               comboPheno.setValue('fruit');
           break;
           case pop_sta_dissemination:
               comboPheno.setValue('dissémination');
           break;
       }
}

//Fonction pour simuler l'enregistrement booléen dans du type entier (null <=> false et -1 <=> true)
function traiteComptagePhenoImprecis() {
    if (Ext.getCmp('pop_sta_nb_precis').getValue().inputValue == 'f') {
        Ext.getCmp('pop_sta_vegetatif').setValue(null);
        Ext.getCmp('pop_sta_floraison').setValue(null);
        Ext.getCmp('pop_sta_bourgeon').setValue(null);
        Ext.getCmp('pop_sta_fructification').setValue(null);
        Ext.getCmp('pop_sta_dissemination').setValue(null);
        if (Ext.getCmp('choix_pop_sta_vegetatif').checked) {
            Ext.getCmp('pop_sta_vegetatif').setValue(-1);
        }
        if (Ext.getCmp('choix_pop_sta_bourgeon').checked) {
            Ext.getCmp('pop_sta_bourgeon').setValue(-1);
        }
        if (Ext.getCmp('choix_pop_sta_floraison').checked) {
            Ext.getCmp('pop_sta_floraison').setValue(-1);
        }
        if (Ext.getCmp('choix_pop_sta_fructification').checked) {
            Ext.getCmp('pop_sta_fructification').setValue(-1);
        }
        if (Ext.getCmp('choix_pop_sta_dissemination').checked) {
            Ext.getCmp('pop_sta_dissemination').setValue(-1);
        }
    }
}

//Appel du formulaire d'importation photo
function importerPhoto() {
    importePhoto(CST_RepPopulations, 'pop_url_photo', 'pop_rq_photo',
    grille, fenetreFormulaire, 'nom_photo', 'info_photo');
}

//Finalisation du formulaire
function finaliseFormulaire() {
    // traitement de l'état des listes
    remplitListe(Ext.getCmp('pop_sta_menaces').value, Ext.getCmp('menaces').value, comboAjoutMenace, listMenaces);
    // traitement des états cochés
    Ext.getCmp('choix_pop_sta_vegetatif').setValue(Ext.getCmp('pop_sta_vegetatif').getValue() == -1);
    Ext.getCmp('choix_pop_sta_floraison').setValue(Ext.getCmp('pop_sta_floraison').getValue() == -1);
    Ext.getCmp('choix_pop_sta_bourgeon').setValue(Ext.getCmp('pop_sta_bourgeon').getValue() == -1);
    Ext.getCmp('choix_pop_sta_fructification').setValue(Ext.getCmp('pop_sta_fructification').getValue() == -1);
    Ext.getCmp('choix_pop_sta_dissemination').setValue(Ext.getCmp('pop_sta_dissemination').getValue() == -1);
    // traitement du nom de la photo
    Ext.getCmp('nom_photo').setValue(nomPhoto(Ext.getCmp('pop_url_photo').value));
    Ext.getCmp('info_photo').setTooltip(Ext.getCmp('pop_rq_photo').value);
    if (modeResiliation) {
        fenetreFormulaire.setWidth(540);
        Ext.getCmp('listMenacesPanel').hide();
        Ext.getCmp('colonneDroitePanel').hide();
        Ext.getCmp('colonneGauchePanel').columnWidth = 1;
        Ext.getCmp('boutonPrecedent').hide();
        Ext.getCmp('boutonSuivant').hide();
        Ext.getCmp('pop_etiquette').setReadOnly(true);
        Ext.getCmp('pop_descriptif').setValue('');
        Ext.getCmp('pop_sta_recouvrement').setValue('');
        Ext.getCmp('pop_sta_hauteur_vegetation').setValue('');
        Ext.getCmp('pop_sta_sol_nu').setValue('');
        Ext.getCmp('pop_sta_rq_biotope').setValue('');
        Ext.getCmp('pop_sta_non_revue').setValue('t');
    }
    else {
        fenetreFormulaire.setWidth(930);
        Ext.getCmp('listMenacesPanel').show();
        Ext.getCmp('colonneDroitePanel').show();
        Ext.getCmp('boutonPrecedent').show();
        Ext.getCmp('boutonSuivant').show();
        Ext.getCmp('colonneGauchePanel').columnWidth = 0.55;
        Ext.getCmp('pop_etiquette').setReadOnly(false);
        Ext.getCmp('pop_sta_non_revue').setValue('f');
    }
}

function verifiePhenoDominanteCochee() {
    var phenoOK = true;
    if (Ext.getCmp('pop_sta_nb_precis').getValue().inputValue != 't') {
        switch (comboPheno.getValue()) {
            case 'végétatif':
                phenoOK = Ext.getCmp('choix_pop_sta_vegetatif').checked;
                break;
            case 'bourgeon':
                phenoOK = Ext.getCmp('choix_pop_sta_bourgeon').checked;
                break;
            case 'fleur':
                phenoOK = Ext.getCmp('choix_pop_sta_floraison').checked;
                break;
            case 'fruit':
                phenoOK = Ext.getCmp('choix_pop_sta_fructification').checked;
                break;
            case 'dissémination':
                phenoOK = Ext.getCmp('choix_pop_sta_dissemination').checked;
                break;
        }
        if (!phenoOK) {
             Ext.MessageBox.show({
                title: 'Erreur sur phénologie',
                msg: 'Stade phénologique non observé ; vérifiez votre saisie !',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.WARNING
            });
        }
    }
    return phenoOK;
}
