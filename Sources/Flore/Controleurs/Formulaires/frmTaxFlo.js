//Variables globales utilisées pour gérer le formulaire
var formulaireFlo, fenetreFormulaireFlo, toucheENTREE_Flo = true, comboStatutValid,
    comboEspeces, tailleGenre = 0, modeRequete = '', comboPheno, comboGermination,
    resultSoumettreFlo;

Ext.onReady(function() {
    new Ext.KeyMap(document, {
        key: Ext.EventObject.ENTER,
        ctrl: true,
        fn: EnregistrerPuisAjouterFlo
    });
    //Combo d'auto-complétion "germination"
    comboGermination = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_germination',
            fields: ['val']
        }),
        id: 'tax_flo_germination',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Germination'
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
                                id: 'choix_tax_flo_vegetatif'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_tax_flo_bourgeon'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_tax_flo_floraison'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_tax_flo_fructification'
                            }, {
                                submitValue: false,
                                xtype: 'checkbox',
                                id: 'choix_tax_flo_dissemination'
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
                                id: 'tax_flo_vegetatif',
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
                                id: 'tax_flo_bourgeon',
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
                                id: 'tax_flo_floraison',
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
                                id: 'tax_flo_fructification',
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
                                id: 'tax_flo_dissemination',
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
    //Combo d'auto-complétion "phénologie"
    comboPheno = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_pheno',
            fields: ['val']
        }),
        id: 'tax_flo_pheno',
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
        id: 'tax_statut_validation',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Statut de validation'
    });
    //Combo d'auto-complétion "espèces"
    comboEspeces = new Ext.form.ComboBox({
        submitValue: false,
        id: 'nom_complet',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jEspeces.php',
            fields: ['espece']
        }),
        allowBlank: false,
        blankText: "Veuillez sélectionner l'espèce observée !",
        emptyText: 'Saisissez 1 caractère',
        mode: 'local',
        displayField: 'espece',
        valueField: 'espece',
        fieldLabel: 'Genre Espèce (nom latin)',
        listWidth:500,
        listeners: {
            keyup: function() {
                var requete = this.getRawValue();
                if (requete.length >= 1) { // si au moins 1 lettres
                    var tabRequete = requete.split(' ', 2);
                    if (tabRequete[1] == '' && (modeRequete != 'espece')) { // si au moins 2 mots
                        modeRequete = 'espece';
                        tailleGenre = tabRequete[0].length;
                        this.store.load({params: {
                                critere: tabRequete[0],
                                mode: modeRequete
                            }
                        });
                    }
                    else {
                        if (!tabRequete[1] && (modeRequete != 'genre') && ((requete.length >= 1) ||
                        (requete.length == tailleGenre))) {
                            modeRequete = 'genre';
                            this.store.load({params: {
                                    critere: tabRequete[0],
                                    mode: modeRequete
                                }
                            });
                        }
                    }
                }
                else {
                    modeRequete = ''
                    tailleGenre = 0;
                    this.store.removeAll();
                }
            }
        }
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaireFlo = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], ctrl: false, fn: function() {if (toucheENTREE_Flo) {soumettreFlo()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'cd_nom'
            }, {
                xtype: 'hidden',
                id: 'tax_rq_photo'
            }, {
                xtype: 'hidden',
                id: 'tax_url_photo'
            }, {
                xtype: 'hidden',
                id: 'actionFlo'
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
                layout: 'column',
                items: [{
                        labelWidth: 150,
                        labelAlign: 'right',
                        defaults: {width: 250},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [comboEspeces,
                        {
                                xtype: 'textfield',
                                fieldLabel: "Numéro d'herbier",
                                id: 'tax_num_herbier'
                            }, {
                                xtype: 'textarea',
                                height: 98,
                                fieldLabel: "Remarques",
                                id: 'tax_rq',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE_Flo = false;
                                    },
                                    blur: function() {
                                        toucheENTREE_Flo  = true;
                                    }
                                }
                            },
                            comboStatutValid
                        ]
                    }, {
                        labelWidth: 200,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.5,
                        layout: 'form',
                        items: [{
                                xtype: 'radiogroup',
                                id: 'tax_flo_nb_precis',
                                fieldLabel: 'Type de comptage',
                                allowBlank: false,
                                blankText: 'Veuillez renseigner le type de comptage !',
                                items: [{
                                        boxLabel: 'Approximation', name: 'tax_flo_nb_precis', inputValue: 'f'
                                    }, {
                                        boxLabel: 'Effectif précis', name: 'tax_flo_nb_precis', inputValue: 't'
                                    }
                                ],
                                listeners: {
                                    change: function(rg, r) {
                                        // renseignement du contrôle caché associé et configuration de saisie (suite)
                                        switch (r.inputValue) {
                                            case 't':
                                                Ext.getCmp('choix_tax_flo_vegetatif').hide();
                                                Ext.getCmp('choix_tax_flo_bourgeon').hide();
                                                Ext.getCmp('choix_tax_flo_floraison').hide();
                                                Ext.getCmp('choix_tax_flo_fructification').hide();
                                                Ext.getCmp('choix_tax_flo_dissemination').hide();
                                                Ext.getCmp('tax_flo_vegetatif').show();
                                                Ext.getCmp('tax_flo_bourgeon').show();
                                                Ext.getCmp('tax_flo_floraison').show();
                                                Ext.getCmp('tax_flo_fructification').show();
                                                Ext.getCmp('tax_flo_dissemination').show();
                                                Ext.getCmp('tax_flo_vegetatif').setMinValue(1);
                                                Ext.getCmp('tax_flo_bourgeon').setMinValue(1);
                                                Ext.getCmp('tax_flo_floraison').setMinValue(1);
                                                Ext.getCmp('tax_flo_fructification').setMinValue(1);
                                                Ext.getCmp('tax_flo_dissemination').setMinValue(1);
                                                Ext.getCmp('tax_flo_nb').disable();
                                                comboPheno.disable();
                                                break;
                                            case 'f':
                                                Ext.getCmp('choix_tax_flo_vegetatif').show();
                                                Ext.getCmp('choix_tax_flo_bourgeon').show();
                                                Ext.getCmp('choix_tax_flo_floraison').show();
                                                Ext.getCmp('choix_tax_flo_fructification').show();
                                                Ext.getCmp('choix_tax_flo_dissemination').show();
                                                Ext.getCmp('tax_flo_vegetatif').hide();
                                                Ext.getCmp('tax_flo_bourgeon').hide();
                                                Ext.getCmp('tax_flo_floraison').hide();
                                                Ext.getCmp('tax_flo_fructification').hide();
                                                Ext.getCmp('tax_flo_dissemination').hide();
                                                Ext.getCmp('tax_flo_vegetatif').setMinValue(-1);
                                                Ext.getCmp('tax_flo_bourgeon').setMinValue(-1);
                                                Ext.getCmp('tax_flo_floraison').setMinValue(-1);
                                                Ext.getCmp('tax_flo_fructification').setMinValue(-1);
                                                Ext.getCmp('tax_flo_dissemination').setMinValue(-1);
                                                Ext.getCmp('tax_flo_nb').enable();
                                                comboPheno.enable();
                                                break;
                                        }
                                    }
                                }
                            },
                            listPheno, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Effectif',
                                minValue: 1,
                                id: 'tax_flo_nb'
                            },
                            comboPheno,
                            comboGermination
                        ]
                    }
                ]
            }
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotal = new Ext.Panel({
        items: formulaireFlo,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    text: 'Enregistrer puis ajouter (CTRL + ENTER)',
                    handler: EnregistrerPuisAjouterFlo,
                    iconCls: 'checked',
                    tooltip: "Enregistrer l'espèce en cours puis ajouter une nouvelle\n\
                        espèce sans fermer le formulaire (CTRL + ENTER)"
                }, {
                    handler: importerPhotoFlo,
                    iconCls: 'photo',
                    tooltip: 'Visualiser / Charger une photo'
                }, {
                    xtype: 'label',
                    text: 'Photo:'
                }, {
                    xtype: 'textfield',
                    id: 'nom_photo_flo',
                    readOnly: true
                }, {
                    id: 'info_photo_flo',
                    iconCls: 'user_comment',
                    tooltipType : 'title',
                    disabled: true
                } , '-', {
                    id: 'boutonPrecedentFlo',
                    text: 'Précédent',
                    handler: afficherPrecedentFlo,
                    iconCls: 'precedent',
                    tooltip: 'Afficher la donnée précédente'
                }, '-', {
                    id: 'boutonSuivantFlo',
                    text: 'Suivant',
                    handler: afficherSuivantFlo,
                    iconCls: 'suivant',
                    tooltip: 'Afficher la donnée suivante'
                }, '-', {
                    text: 'Enregistrer',
                    handler: soumettreFlo,
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnulerFlo',
                    text: 'Annuler',
                    handler: function() {
                        fenetreFormulaireFlo.hide();
                        if (Ext.getCmp('actionFlo').value == 'Ajouter') { // en ajout, il faut recharger pour enlever la géométrie
                            donneesGrilleFlo.reload();
                        }
                    },
                    iconCls: 'cancel'
                }
            ],
            id: 'statusbarFlo',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreFormulaireFlo = new Ext.Window({
        modal: true,
        resizable: false,
        title: 'Saisie des espèces Flore du biotope sélectionné pour le protocole et la zone prospectée en cours',
        width: 900,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnulerFlo').handler
    });
    //Initialisation des listes
    comboStatutValid.store.load();
    comboGermination.store.load();
    comboPheno.store.load();
});

//Affichage en mode ajout
function ajouteFlo() {
    initialiseFormulaireFlo();
    // affectation du mode en ajout
    Ext.getCmp('actionFlo').setValue('Ajouter');
    // blocage des boutons de navigation
    Ext.getCmp('boutonPrecedentFlo').disable();
    Ext.getCmp('boutonSuivantFlo').disable();
    // gestion du focus
    comboEspeces.focus('', 500); // focus de 500 ms sinon ça ne marche pas
    Ext.getCmp('tax_bio_id').setValue(grille.selModel.getSelected().data['bio_id']);
    Ext.getCmp('tax_flo_nb_precis').setValue('f');
    if (numerisateur == 303) {
        comboStatutValid.setValue('OK (Frantz Hopkins)');
    }
    else {
        if (numerisateur == 242) {
            comboStatutValid.setValue('OK (Emeric Sulmont)');
        }
    }
    finaliseFormulaireFlo();
}

//Affichage en mode modification
function modifieFlo() {
    initialiseFormulaireFlo();
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPrecedentFlo').setDisabled(!grilleFlo.selModel.hasPrevious());
    Ext.getCmp('boutonSuivantFlo').setDisabled(!grilleFlo.selModel.hasNext());
    // remplissage du formulaire
    var selected = grilleFlo.selModel.getSelected();
    for (var donnee in selected.data) {
        if (Ext.getCmp(donnee)) {
            Ext.getCmp(donnee).setValue(selected.data[donnee]);
        }
    }
    // affectation du mode en modif
    Ext.getCmp('actionFlo').setValue('Modifier');
    finaliseFormulaireFlo();
}

//Fonction appelée après un enregistrement réussi
function termineAffichageFlo() {
    // modes ajout et modif
    fenetreFormulaireFlo.hide();
    donneesGrilleFlo.reload();
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettreFlo() {
    resultSoumettreFlo = false;
    if (formulaireFlo.form.isValid()) {
        // réactivation forcée des contrôles "Disabled" pour permettre leur soumission
        Ext.getCmp('tax_flo_nb').enable(); // mais également contrôler le caractère obligatoire de l'effectif (champ "tax_flo_nb")
        comboPheno.enable();
        // traitement du cas du comptage imprécis pour tous les stades phénologiques
        traiteComptagePhenoImprecis();
        // invalidation forcée des "emptyText" lors de la soumission
        if (comboGermination.getRawValue() == '') {
            comboGermination.setRawValue('');
        }
        if (comboPheno.getRawValue() == '') {
            comboPheno.setRawValue('');
        }
        if (comboStatutValid.getRawValue() == '') {
            comboStatutValid.setRawValue('');
        }
        if (verifiePhenoDominanteCochee()) {
            // vérification auprès du référentiel
            Ext.Ajax.request({
                url: '../Modeles/Json/jCdNom.php',
                params: {
                    valeur: comboEspeces.value
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            Ext.getCmp('cd_nom').setValue(obj.data);
                            templateValidation('../Controleurs/Gestions/GestTaxFlo.php', Ext.getCmp('statusbarFlo'),
                                formulaireFlo, termineAffichageFlo);
                            resultSoumettreFlo = true;
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
    }
    else {
        Ext.getCmp('statusbarFlo').setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
    }
    return resultSoumettreFlo;
}

//Initialisation du formulaire
function initialiseFormulaireFlo() {
    // gestion des droits particuliers pour l'observateur 303 "Chargé de missions" FLORE
    if (numerisateur == 303 || numerisateur == 242) {
        comboStatutValid.setVisible(true);
        Ext.getCmp('tax_rq').height = 76;
    }
    fenetreFormulaireFlo.show();
    // mise à zéro des contrôles sur les onglets actifs
    formulaireFlo.form.reset();
    // complément d'initialisation du formulaire
    Ext.getCmp('statusbarFlo').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaireFlo.getEl().unmask();  // déblocage de la saisie sur le formulaire
    // réinitialisation des variables globales
    toucheENTREE_Flo = true;
    modeRequete = ''
    tailleGenre = 0;
    // réinitialisation des listes
    comboEspeces.store.removeAll();
}

//Finalisation du formulaire
function finaliseFormulaireFlo() {
    // traitement des états cochés
    Ext.getCmp('choix_tax_flo_vegetatif').setValue(Ext.getCmp('tax_flo_vegetatif').getValue() == -1);
    Ext.getCmp('choix_tax_flo_floraison').setValue(Ext.getCmp('tax_flo_floraison').getValue() == -1);
    Ext.getCmp('choix_tax_flo_bourgeon').setValue(Ext.getCmp('tax_flo_bourgeon').getValue() == -1);
    Ext.getCmp('choix_tax_flo_fructification').setValue(Ext.getCmp('tax_flo_fructification').getValue() == -1);
    Ext.getCmp('choix_tax_flo_dissemination').setValue(Ext.getCmp('tax_flo_dissemination').getValue() == -1);
    // traitement du nom de la photo
    Ext.getCmp('nom_photo_flo').setValue(nomPhoto(Ext.getCmp('tax_url_photo').value));
    Ext.getCmp('info_photo_flo').setTooltip(Ext.getCmp('tax_rq_photo').value);
}

//Appel du formulaire d'importation photo
function importerPhotoFlo() {
    importePhoto(CST_RepEspeces, 'tax_url_photo', 'tax_rq_photo', grilleFlo, fenetreFormulaireFlo,
    'nom_photo_flo', 'info_photo_flo');
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherPrecedentFlo() {
    if (grilleFlo.selModel.selectPrevious()) {
        modifieFlo();
    }
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherSuivantFlo() {
    if (grilleFlo.selModel.selectNext()) {
        modifieFlo();
    }
}

//Fonction de recalcul de la somme et du choix automatique de la dominance des phénologies
function calculePheno() {
    var tax_flo_vegetatif = 0;
    var tax_flo_bourgeon = 0;
    var tax_flo_floraison = 0;
    var tax_flo_fructification = 0;
    var tax_flo_dissemination = 0;
    if (Ext.getCmp('tax_flo_vegetatif').getValue() > 0) {
        tax_flo_vegetatif = Ext.getCmp('tax_flo_vegetatif').getValue();
    }
    if (Ext.getCmp('tax_flo_bourgeon').getValue() > 0) {
        tax_flo_bourgeon = Ext.getCmp('tax_flo_bourgeon').getValue();
    }
    if (Ext.getCmp('tax_flo_floraison').getValue() > 0) {
        tax_flo_floraison = Ext.getCmp('tax_flo_floraison').getValue();
    }
    if (Ext.getCmp('tax_flo_fructification').getValue() > 0) {
        tax_flo_fructification = Ext.getCmp('tax_flo_fructification').getValue();
    }
    if (Ext.getCmp('tax_flo_dissemination').getValue() > 0) {
        tax_flo_dissemination = Ext.getCmp('tax_flo_dissemination').getValue();
    }
    Ext.getCmp('tax_flo_nb').setValue(tax_flo_vegetatif + tax_flo_bourgeon + tax_flo_floraison +
        tax_flo_fructification + tax_flo_dissemination);
    var maxPheno = Math.max(tax_flo_vegetatif, tax_flo_bourgeon, tax_flo_floraison,
        tax_flo_fructification, tax_flo_dissemination);
       switch (maxPheno) {
           case tax_flo_vegetatif:
               comboPheno.setValue('végétatif');
           break;
           case tax_flo_bourgeon:
               comboPheno.setValue('bourgeon');
           break;
           case tax_flo_floraison:
               comboPheno.setValue('fleur');
           break;
           case tax_flo_fructification:
               comboPheno.setValue('fruit');
           break;
           case tax_flo_dissemination:
               comboPheno.setValue('dissémination');
           break;
       }
}

//Fonction pour simuler l'enregistrement booléen dans du type entier (null <=> false et -1 <=> true)
function traiteComptagePhenoImprecis() {
    if (Ext.getCmp('tax_flo_nb_precis').getValue().inputValue == 'f') {
        Ext.getCmp('tax_flo_vegetatif').setValue(null);
        Ext.getCmp('tax_flo_floraison').setValue(null);
        Ext.getCmp('tax_flo_bourgeon').setValue(null);
        Ext.getCmp('tax_flo_fructification').setValue(null);
        Ext.getCmp('tax_flo_dissemination').setValue(null);
        if (Ext.getCmp('choix_tax_flo_vegetatif').checked) {
            Ext.getCmp('tax_flo_vegetatif').setValue(-1);
        }
        if (Ext.getCmp('choix_tax_flo_bourgeon').checked) {
            Ext.getCmp('tax_flo_bourgeon').setValue(-1);
        }
        if (Ext.getCmp('choix_tax_flo_floraison').checked) {
            Ext.getCmp('tax_flo_floraison').setValue(-1);
        }
        if (Ext.getCmp('choix_tax_flo_fructification').checked) {
            Ext.getCmp('tax_flo_fructification').setValue(-1);
        }
        if (Ext.getCmp('choix_tax_flo_dissemination').checked) {
            Ext.getCmp('tax_flo_dissemination').setValue(-1);
        }
    }
}

function verifiePhenoDominanteCochee() {
    var phenoOK = true;
    if (Ext.getCmp('tax_flo_nb_precis').getValue().inputValue != 't') {
        switch (comboPheno.getValue()) {
            case 'végétatif':
                phenoOK = Ext.getCmp('choix_tax_flo_vegetatif').checked;
                break;
            case 'bourgeon':
                phenoOK = Ext.getCmp('choix_tax_flo_bourgeon').checked;
                break;
            case 'fleur':
                phenoOK = Ext.getCmp('choix_tax_flo_floraison').checked;
                break;
            case 'fruit':
                phenoOK = Ext.getCmp('choix_tax_flo_fructification').checked;
                break;
            case 'dissémination':
                phenoOK = Ext.getCmp('choix_tax_flo_dissemination').checked;
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
