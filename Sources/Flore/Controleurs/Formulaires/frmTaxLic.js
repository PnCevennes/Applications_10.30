//Variables globales utilisées pour gérer le formulaire
var formulaireLic, fenetreFormulaireLic, toucheENTREE_Lic = true, comboStatutValid,
    comboEspecesLichens, comboExpo;

Ext.onReady(function() {
    new Ext.KeyMap(document, {
        key: Ext.EventObject.ENTER,
        ctrl: true,
        fn: EnregistrerPuisAjouterLic
    });
    //Combo d'auto-complétion "exposition"
    comboExpo = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_expo',
            fields: ['val']
        }),
        id: 'tax_lic_expo',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Exposition dominante'
    });
    //Combo d'auto-complétion "statut de validation"
    comboStatutValid = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_statut_validation',
            fields: ['val']
        }),
        hidden: true,
        id: 'tax_statut_validation',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Statut de validation'
    });
    //Combo d'auto-complétion "espèces à enjeux"
    comboEspecesLichens = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?table=inpn.v_taxref_protocole_lichens&chId=cd_nom&chVal=nom_complet',
            fields: ['id', 'val']
        }),
        id: 'cd_nom',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Espèce lichens (en latin)',
        allowBlank: false,
        listWidth:500,
        blankText: "Veuillez sélectionner l'espèce lichens observée !",
        forceSelection: true
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaireLic = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER],ctrl: false, fn: function() {if (toucheENTREE_Lic) {soumettreLic()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'tax_rq_photo'
            }, {
                xtype: 'hidden',
                id: 'tax_url_photo'
            }, {
                xtype: 'hidden',
                id: 'actionLic'
            }, {
                xtype: 'hidden',
                id: 'tax_id'
            }, {
                xtype: 'hidden',
                id: 'tax_bio_id'
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
                            comboEspecesLichens, 
                            comboExpo, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Effectif (nb de thalles)',
                                minValue: 1,
                                id: 'tax_lic_nb'
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Surface occupée (en cm²)',
                                minValue: 0,
                                id: 'tax_lic_surf'
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Hauteur moyenne (en cm)',
                                id: 'tax_lic_hauteur',
                                minValue: 0
                            }
                        ]
                    }, {
                        labelWidth: 200,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [{
                                xtype: 'textfield',
                                fieldLabel: "Numéro d'herbier",
                                id: 'tax_num_herbier'
                            }, {
                                labelSeparator: '',
                                xtype: 'textarea',
                                height: 98,
                                fieldLabel: 'Remarques : <p style="font-size:9px">(diamètre max, ...)</p>',
                                id: 'tax_rq',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE_Lic = false;
                                    },
                                    blur: function() {
                                        toucheENTREE_Lic  = true;
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
        items: formulaireLic,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    text: 'Enregistrer puis ajouter (CTRL + ENTER)',
                    handler: EnregistrerPuisAjouterLic,
                    iconCls: 'checked',
                    tooltip: "Enregistrer l'espèce en cours puis ajouter une nouvelle\n\
                        espèce sans fermer le formulaire (CTRL + ENTER)"
                }, {
                    handler: importerPhotoLic,
                    iconCls: 'photo',
                    tooltip: 'Visualiser / Charger une photo'
                }, {
                    xtype: 'label',
                    text: 'Photo:'
                }, {
                    xtype: 'textfield',
                    id: 'nom_photo_lic',
                    readOnly: true
                }, {
                    id: 'info_photo_lic',
                    iconCls: 'user_comment',
                    tooltipType : 'title',
                    disabled: true
                } , '-', {
                    id: 'boutonPrecedentLic',
                    text: 'Précédent',
                    handler: afficherPrecedentLic,
                    iconCls: 'precedent',
                    tooltip: 'Afficher la donnée précédente'
                }, '-', {
                    id: 'boutonSuivantLic',
                    text: 'Suivant',
                    handler: afficherSuivantLic,
                    iconCls: 'suivant',
                    tooltip: 'Afficher la donnée suivante'
                }, '-', {
                    text: 'Enregistrer',
                    handler: soumettreLic,
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnulerLic',
                    text: 'Annuler',
                    handler: function() {
                        fenetreFormulaireLic.hide();
                        if (Ext.getCmp('actionLic').value == 'Ajouter') { // en ajout, il faut recharger pour enlever la géométrie
                            donneesGrilleLic.reload();
                        }
                    },
                    iconCls: 'cancel'
                }
            ],
            id: 'statusbarLic',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreFormulaireLic = new Ext.Window({
        modal: true,
        resizable: false,
        title: 'Saisie des lichens du biotope sélectionné pour le protocole et la zone prospectée en cours',
        width: 900,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnulerLic').handler
    });
    //Initialisation des listes
    comboStatutValid.store.load();
    comboExpo.store.load();
    comboEspecesLichens.store.load();
});

//Affichage en mode ajout
function ajouteLic() {
    initialiseFormulaireLic();
    // affectation du mode en ajout
    Ext.getCmp('actionLic').setValue('Ajouter');
    // blocage des boutons de navigation
    Ext.getCmp('boutonPrecedentLic').disable();
    Ext.getCmp('boutonSuivantLic').disable();
    // gestion du focus
    comboEspecesLichens.focus('', 500); // focus de 500 ms sinon ça ne marche pas
    Ext.getCmp('tax_bio_id').setValue(grille.selModel.getSelected().data['bio_id']);
    if (numerisateur == 48) {
        comboStatutValid.setValue('OK (Frantz Hopkins)');
    }
    finaliseFormulaireLic();
}

//Affichage en mode modification
function modifieLic() {
    initialiseFormulaireLic();
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPrecedentLic').setDisabled(!grilleLic.selModel.hasPrevious());
    Ext.getCmp('boutonSuivantLic').setDisabled(!grilleLic.selModel.hasNext());
    // remplissage du formulaire
    var selected = grilleLic.selModel.getSelected();
    for (var donnee in selected.data) {
        if (Ext.getCmp(donnee)) {
            Ext.getCmp(donnee).setValue(selected.data[donnee]);
        }
    }
    // affectation du mode en modif
    Ext.getCmp('actionLic').setValue('Modifier');
    finaliseFormulaireLic();
}

//Fonction appelée après un enregistrement réussi
function termineAffichageLic() {
    // modes ajout et modif
    fenetreFormulaireLic.hide();
    donneesGrilleLic.reload();
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettreLic() {
  var dfd = new jQuery.Deferred();
    if (formulaireLic.form.isValid()) {
        // invalidation forcée des "emptyText" lors de la soumission
        if (comboStatutValid.getRawValue() == '') {
            comboStatutValid.setRawValue('');
        }
        if (comboExpo.getRawValue() == '') {
            comboExpo.setRawValue('');
        }
        if (comboEspecesLichens.getRawValue() == '') {
            comboEspecesLichens.setRawValue('');
        }
        else {
            comboEspecesLichens.setRawValue(comboEspecesLichens.getValue());
        }
        var dfdvalication = templateValidation('../Controleurs/Gestions/GestTaxLic.php', Ext.getCmp('statusbarLic'),
            formulaireLic, termineAffichageLic);
        dfdvalication.done(function(  ) {
          dfd.resolve();
        });
    }
    else {
        Ext.getCmp('statusbarLic').setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
        dfd.reject();
    }
    return dfd.promise();
}

//Initialisation du formulaire
function initialiseFormulaireLic() {
    // gestion des droits particuliers pour l'observateur 303 "Chargé de missions" FLORE
    if (numerisateur_droit >= 5) {
        comboStatutValid.setVisible(true);
        Ext.getCmp('tax_rq').height = 76;
    }
    fenetreFormulaireLic.show();
    // mise à zéro des contrôles sur les onglets actifs
    formulaireLic.form.reset();
    // complément d'initialisation du formulaire
    Ext.getCmp('statusbarLic').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaireLic.getEl().unmask();  // déblocage de la saisie sur le formulaire
    // réinitialisation des variables globales
    toucheENTREE_Lic = true;
}

//Finalisation du formulaire
function finaliseFormulaireLic() {
    // traitement du nom de la photo
    Ext.getCmp('nom_photo_lic').setValue(nomPhoto(Ext.getCmp('tax_url_photo').value));
    Ext.getCmp('info_photo_lic').setTooltip(Ext.getCmp('tax_rq_photo').value);
}

//Appel du formulaire d'importation photo
function importerPhotoLic() {
    importePhoto(CST_RepEspeces, 'tax_url_photo', 'tax_rq_photo', grilleLic, fenetreFormulaireLic,
    'nom_photo_lic', 'info_photo_lic');
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherPrecedentLic() {
    if (grilleLic.selModel.selectPrevious()) {
        modifieLic();
    }
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherSuivantLic() {
    if (grilleLic.selModel.selectNext()) {
        modifieLic();
    }
}


//Fonction pour enregistrer puis ajouter sans fermer le formulaire
function EnregistrerPuisAjouterLic() {
  var dfd = soumettreLic();
  dfd.done(function() {
    ajouteLic();
  });
}
