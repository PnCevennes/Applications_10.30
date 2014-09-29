//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, toucheENTREE = true, comboTypeMilieu, comboSupport,
    comboCorineBiotope;

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
    //Combo d'auto-complétion "espèces support du protocole lichens"
    comboSupport = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?table=inpn.v_taxref_biotope_protocole_lichens&chId=sup_cd_nom&chVal=nom_complet',
            fields: ['id', 'val']
        }),
        id: 'sup_cd_nom',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Support',
        allowBlank: false,
        listWidth:500,
        blankText: 'Veuillez sélectionner l\'espèce "support" observée !',
        forceSelection: true
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: function() {if (toucheENTREE) {soumettre()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'bio_rq_photo'
            }, {
                xtype: 'hidden',
                id: 'bio_url_photo'
            }, {
                xtype: 'hidden',
                id: 'bio_geom'
            }, {
                xtype: 'hidden',
                id: 'action'
            }, {
                xtype: 'hidden',
                id: 'bio_id'
            }, {
                xtype: 'hidden',
                id: 'zpr_id'
            }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
            }, {
                layout:'column',
                items: [{
                        labelWidth: 200,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [
                            comboSupport, {
                                xtype: 'textfield',
                                fieldLabel: 'Numéro du pointage',
                                id: 'bio_etiquette'
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Descriptif du milieu',
                                id: 'bio_descriptif'
                            },
                            comboTypeMilieu,
                            comboCorineBiotope
                        ]
                    }, {
                        labelWidth: 200,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [{
                                xtype: 'textarea',
                                height: 74,
                                fieldLabel: "Commentaires",
                                id: 'bio_rq',
                                maxLength: 254,
                                listeners: {
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
                        if ((Ext.getCmp('action').value == 'Ajouter') && // en ajout, il faut recharger pour enlever la géométrie
                            (typeof(iImport) == 'undefined')) {          // mais pas besoin lors de la procédure d'importation
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
    // mode import uniquement
    if (typeof(iImport) != 'undefined') {
        // ajout d'un bouton "stop" pour arrêter la procédure d'importation
        formulaireTotal.getBottomToolbar().add('-');
        formulaireTotal.getBottomToolbar().add({
            text: 'Quitter',
            handler: arreter,
            iconCls: 'stop',
            tooltip: "Arrêter l'importation GPX"
        });
    }
    //Fenêtre container
    fenetreFormulaire = new Ext.Window({
        modal: true,
        resizable: false,
        title: 'Saisie des biotopes avec leurs lichens associés pour le protocole et la zone prospectée en cours',
        width: 900,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnuler').handler,
        listeners: {
            hide: function() {
                Ext.Ajax.request({
                    url: '../Controleurs/Gestions/GestSession.php',
                    params: {
                        action: 'AttendreSaisie',
                        saisieEnCours: 'NON'
                    }
                });
            }
        }
    });
    //Initialisation des listes
    comboTypeMilieu.store.load();
    comboSupport.store.load();
    comboCorineBiotope.store.load();
});

//Affichage en mode ajout
function ajoute(geom, attr) {
    initialiseFormulaire();
    // affectation du mode en ajout
    Ext.getCmp('action').setValue('Ajouter');
    // blocage des boutons de navigation
    Ext.getCmp('boutonPrecedent').disable();
    Ext.getCmp('boutonSuivant').disable();
    // gestion du focus
    comboSupport.focus('', 2000); // focus de 2000 ms sinon ça ne marche pas
    Ext.getCmp('bio_geom').setValue(geom);
    Ext.getCmp('zpr_id').setValue(GetParam('zpr_id'));
    // mode import uniquement
    if (attr) {
        Ext.getCmp('bio_etiquette').setValue(attr['name']);
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
    Ext.getCmp('bio_geom').setValue(geom.transform(carte.getProjectionObject(),
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
    // modes ajout, modif et import
    fenetreFormulaire.hide();
    // partie modes ajout et modif uniquement
    if (typeof(iImport) == 'undefined') {
        donneesGrille.reload();
    }
    else {
        nbImport++; // partie comptage servant au mode import uniquement
    }
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
        if (comboSupport.getRawValue() == '') {
            comboSupport.setRawValue('');
        }
        else {
            comboSupport.setRawValue(comboSupport.getValue());
        }
        if (comboCorineBiotope.getRawValue() == '') {
            comboCorineBiotope.setRawValue('');
        }
        else {
            comboCorineBiotope.setRawValue(comboCorineBiotope.getValue());
        }
        templateValidation('../Controleurs/Gestions/GestBioLic.php', Ext.getCmp('statusbar'),
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
        grille.selModel.resumeEvents();
        modifie();        
    }
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherSuivant() {
    if (grille.selModel.selectNext()) {
        grille.selModel.resumeEvents();
        modifie();
    }
}

//Fonction d'arrêt de l'importation
function arreter() {
    Ext.Ajax.request({
        url: '../Controleurs/Gestions/GestSession.php',
        params: {
            action: 'AttendreSaisie',
            saisieEnCours: 'STOP'
        },
        callback: function() {
            fenetreFormulaire.hide();
        }
    });
}

//Appel du formulaire d'importation photo
function importerPhoto() {
    importePhoto(CST_RepBiotopes, 'bio_url_photo', 'bio_rq_photo',
    grille, fenetreFormulaire, 'nom_photo', 'info_photo');
}

//Finalisation du formulaire
function finaliseFormulaire() {
    // traitement du nom de la photo
    Ext.getCmp('nom_photo').setValue(nomPhoto(Ext.getCmp('bio_url_photo').value));
    Ext.getCmp('info_photo').setTooltip(Ext.getCmp('bio_rq_photo').value);
}
