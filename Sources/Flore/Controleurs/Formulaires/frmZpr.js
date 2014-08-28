//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, toucheENTREE = true, comboAjoutCible, listCibles,
    comboCategorie;

Ext.onReady(function() {
    //Combo d'auto-complétion "catégorie"
    comboCategorie = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_categorie_zp',
            fields: ['val']
        }),
        id: 'zpr_categorie',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Catégorie'
    });
    //Gestion de la liste des cibles
    comboAjoutCible = new Ext.form.ComboBox({
        submitValue: false,
        forceSelection: true,
        width: 260,
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jCodesCibles.php',
            fields: ['code', 'libelle']
        }),
        emptyText: 'Sélectionez pour ajouter',
        mode: 'local',
        displayField: 'libelle',
        valueField: 'code',
        listeners: {
            select: function() {selectionne(this, listCibles);}
        }
    });
    listCibles = new Ext.ux.form.MultiSelect({
        delimiter: '&',
        width: 348,
        store: new Ext.data.ArrayStore({
            fields: ['code', 'libelle']
        }),
        displayField: 'libelle',
	valueField: 'code',
        tbar: [
            comboAjoutCible, {
                text: 'Suppr. sélection',
                handler: function() {supprimeSelection(comboAjoutCible, listCibles);}
            }
        ]
    });
    var listCiblesPanel = new Ext.Panel({
        fieldLabel: 'Cibles',
        items: listCibles
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: function() {if (toucheENTREE) {soumettre()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'zpr_cibles'
            }, {
                submitValue: false,
                xtype: 'hidden',
                id: 'cibles'
            }, {
                xtype: 'hidden',
                id: 'zpr_geom'
            }, {
                xtype: 'hidden',
                id: 'action'
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
                        defaults: {width: 350},
                        labelSeparator: ' :',
                        columnWidth: 0.6,
                        layout: 'form',
                        items: [{
                                xtype: 'textfield',
                                fieldLabel: 'Lieu(x)-dit(s)',
                                id: 'zpr_nom',
                                allowBlank: false,
                                blankText: "Veuillez entrer le(s) lieu(x)-dit(s) prospectés !"
                            }, {
                                xtype: 'datefield',
                                fieldLabel: 'Date',
                                format: 'd/m/Y',
                                id: 'zpr_date',
                                allowBlank: false,
                                blankText: "Veuillez entrer la date de prospection !"
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Durée (en min)',
                                id: 'zpr_duree',
                                minValue: 0
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Numéro journalier',
                                id: 'zpr_num_j'
                            },
                            comboCategorie,
                            listCiblesPanel
                        ]
                    }, {
                        labelWidth: 100,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.4,
                        layout: 'form',
                        items: [{
                                xtype: 'textarea',
                                height: 178,
                                fieldLabel: "Commentaires",
                                id: 'zpr_cmt',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Numérisateur',
                                id: 'numerisat',
                                readOnly: true
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
        title: 'Saisie des zones prospectées',
        width: 900,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnuler').handler
    });
    //Initialisation des listes
    comboCategorie.store.load();
});

//Affichage en mode ajout
function ajoute(geom) {
    initialiseFormulaire();
    // initialisation des valeurs par défaut
    Ext.getCmp('numerisat').setValue(numerisat); // propre à l'observateur FLORE connecté
    Ext.getCmp('zpr_categorie').setValue('recherche active');
    // affectation du mode en ajout
    Ext.getCmp('action').setValue('Ajouter');
    // blocage des boutons de navigation
    Ext.getCmp('boutonPrecedent').disable();
    Ext.getCmp('boutonSuivant').disable();
    // gestion du focus
    Ext.getCmp('zpr_nom').focus('', 2000); // focus de 2000 ms sinon ça ne marche pas
    Ext.getCmp('zpr_geom').setValue(geom);
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
    Ext.getCmp('zpr_geom').setValue(geom.transform(carte.getProjectionObject(),
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
    listCibles.allowBlank = true;
    if (formulaire.form.isValid()) {
        if (comboCategorie.getRawValue() == '') {
            comboCategorie.setRawValue('');
        }
        // récupération des codes depuis les listes
        listCibles.view.selectRange(0, listCibles.store.getCount() - 1);
        Ext.getCmp('zpr_cibles').setValue(listCibles.getValue());
        templateValidation('../Controleurs/Gestions/GestZpr.php', Ext.getCmp('statusbar'),
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
    // initialisation des listes
    listCibles.store.removeAll();
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

//Finalisation du formulaire
function finaliseFormulaire() {
    // traitement de l'état des listes
    remplitListe(Ext.getCmp('zpr_cibles').value, Ext.getCmp('cibles').value, comboAjoutCible, listCibles);
}