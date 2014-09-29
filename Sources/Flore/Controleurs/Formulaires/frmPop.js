//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, toucheENTREE = true, comboTypeMilieu, comboPheno,
    comboStatutValid, comboEspecesEnjeux, comboCorineBiotope;

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
    //Combo d'auto-complétion "espèces à enjeux"
    comboEspecesEnjeux = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?table=inpn.v_taxref_protocole_enjeux&chId=cd_nom&chVal=nom_complet',
            fields: ['id', 'val']
        }),
        id: 'cd_nom',
        listWidth:500,
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Espèce à enjeux',
        allowBlank: false,
        blankText: "Veuillez sélectionner l'espèce à enjeux observée !",
        forceSelection: true
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: function() {if (toucheENTREE) {soumettre()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'pop_rq_photo'
            }, {
                xtype: 'hidden',
                id: 'pop_url_photo'
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
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
            }, {
                layout:'column',
                items: [{
                        labelWidth: 150,
                        labelAlign: 'right',
                        defaults: {width: 250},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Numéro du pointage',
                                id: 'pop_etiquette'
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Surface (en m²)',
                                minValue: 0,
                                id: 'pop_surf'
                            },
                            comboEspecesEnjeux, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Effectif',
                                minValue: 1,
                                id: 'pop_nb'
                            },
                            comboPheno
                        ]
                    }, {
                        labelWidth: 150,
                        labelAlign: 'right',
                        defaults: {width: 250},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Descriptif du milieu',
                                id: 'pop_descriptif'
                            },
                            comboTypeMilieu,
                            comboCorineBiotope,
                            {
                                xtype: 'textarea',
                                height: 74,
                                fieldLabel: "Remarques",
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
        close: Ext.getCmp('boutonAnnuler').handler
    });
    //Initialisation des listes
    comboTypeMilieu.store.load();
    comboPheno.store.load();
    comboStatutValid.store.load();
    comboEspecesEnjeux.store.load();
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
    // traitement de la géomérie
    if (geom.CLASS_NAME == 'OpenLayers.Geometry.Polygon') {
        Ext.getCmp('pop_surf').setValue(Math.round(geom.getGeodesicArea()));
    }
    if (numerisateur == 303) {
        comboStatutValid.setValue('OK (Frantz Hopkins)');
    }
    else {
        if (numerisateur == 242) {
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
    if (formulaire.form.isValid()) {
        // invalidation forcée des "emptyText" lors de la soumission
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
        if (comboEspecesEnjeux.getRawValue() == '') {
            comboEspecesEnjeux.setRawValue('');
        }
        else {
            comboEspecesEnjeux.setRawValue(comboEspecesEnjeux.getValue());
        }
        if (comboCorineBiotope.getRawValue() == '') {
            comboCorineBiotope.setRawValue('');
        }
        else {
            comboCorineBiotope.setRawValue(comboCorineBiotope.getValue());
        }
        templateValidation('../Controleurs/Gestions/GestPop.php', Ext.getCmp('statusbar'),
            formulaire, termineAffichage);
    }
    else {
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
    if (numerisateur == 303 || numerisateur == 242) {
        comboStatutValid.setVisible(true);
        Ext.getCmp('pop_rq').height = 46;
    }
    fenetreFormulaire.show();
    // mise à zéro des contrôles sur les onglets actifs
    formulaire.form.reset();
    // complément d'initialisation du formulaire
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    // réinitialisation des variables globales
    toucheENTREE = true;
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

//Appel du formulaire d'importation photo
function importerPhoto() {
    importePhoto(CST_RepPopulations, 'pop_url_photo', 'pop_rq_photo',
    grille, fenetreFormulaire, 'nom_photo', 'info_photo');
}

//Finalisation du formulaire
function finaliseFormulaire() {
    // traitement du nom de la photo
    Ext.getCmp('nom_photo').setValue(nomPhoto(Ext.getCmp('pop_url_photo').value));
    Ext.getCmp('info_photo').setTooltip(Ext.getCmp('pop_rq_photo').value);
}
