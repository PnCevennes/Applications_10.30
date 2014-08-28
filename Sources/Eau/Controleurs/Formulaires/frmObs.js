//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, modeDuplication = false, toucheENTREE = true,
    comboMeteo_3j, numerisat, numerisateur;

Ext.onReady(function() {
    //Combo d'auto-complétion "météo"
    comboMeteo_3j = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=saisie.enum_meteo_3j',
            fields: ['val']
        }),
        id: 'meteo_3j',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection : true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Météo des 3 jours antérieurs',
        allowBlank: false,
        blankText: "Veuillez entrer la météo des 3 jours antérieurs !"
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: function() {if (toucheENTREE) {soumettre()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'geometrie'
            }, {
                xtype: 'hidden',
                id: 'action'
            }, {
                xtype: 'hidden',
                id: 'id_obs'
            }, {
                xtype: 'hidden',
                id: 'gid'
            }, {
                xtype: 'hidden',
                id: 'mode_mesure_debit'
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
                        items: [{
                                xtype: 'datefield',
                                fieldLabel: "Date de l'observation",
                                format: 'd/m/Y',
                                id: 'date_obs',
                                allowBlank: false,
                                blankText: "Veuillez entrer la date d'observation !"
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Matière En Suspension MES',
                                id: 'm_e_s',
                                minValue: 0,
                                maxValue: 200,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Demande Chimiq. Oxygène DCO',
                                id: 'd_c_o',
                                minValue: 0,
                                maxValue: 50,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Demande Biochimiq. Oxygène DBO',
                                id: 'd_b_o',
                                minValue: 0,
                                maxValue: 50,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Carbone Organique Total COT',
                                id: 'c_o_t',
                                minValue: 0,
                                maxValue: 50,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Nitrates NO3',
                                id: 'nitrate',
                                minValue: 0,
                                maxValue: 50,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Surgent SUR (détergents)',
                                id: 'surgent',
                                minValue: 0,
                                maxValue: 50,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'radiogroup',
                                id: 'choixModeMesureDebit',
                                fieldLabel: 'Mode de mesure du débit',
                                items: [{
                                        boxLabel: 'Dilution', name: 'eltModeMesureDebit', inputValue: 'Dilution'
                                    }, {
                                        boxLabel: 'Débimètre', name: 'eltModeMesureDebit', inputValue: 'Débimètre'
                                    }
                                ],
                                listeners: {
                                    change: function(rg, r) {
                                        if (r != null) { // test obligatoire par rapport au "reset"
                                            // renseignement du contrôle caché associé
                                            switch (r.inputValue) {
                                                case 'Dilution':
                                                    Ext.getCmp('mode_mesure_debit').setValue('Dilution');
                                                    break;
                                                case 'Débimètre':
                                                    Ext.getCmp('mode_mesure_debit').setValue('Débimètre');
                                                    break;
                                            }
                                        }
                                    }
                                }
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Mesure du débit (l/s)',
                                id: 'mesure_debit',
                                minValue: 0,
                                maxValue: 500,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'textarea',
                                height: 95,
                                fieldLabel: "Remarques sur l'observation",
                                id: 'remarque_obs',
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
                    }, {
                        labelWidth: 200,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth:0.5,
                        layout: 'form',
                        items: [{
                                xtype: 'timefield',
                                fieldLabel: "Heure de l'observation",
                                id: 'heure_obs',
                                allowBlank: false,
                                blankText: "Veuillez entrer l'heure d'observation !",
                                increment: 30
                            },
                                comboMeteo_3j,
                            {
                                xtype: 'numberfield',
                                fieldLabel: 'Température',
                                id: 'temperature',
                                minValue: -5,
                                maxValue: 30,
                                decimalSeparator: '.',
                                decimalPrecision: 1
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'pH',
                                id: 'ph',
                                minValue: 0,
                                maxValue: 14,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Conductivité',
                                id: 'conductivite',
                                minValue: 0,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Oxygène dissous',
                                id: 'o2_dissoud',
                                minValue: 0,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Saturation en oxygène',
                                id: 'saturation_o2',
                                minValue: 0,
                                decimalSeparator: '.',
                                decimalPrecision: 2
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Station fixe',
                                id: 'noms',
                                readOnly: true
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Longitude',
                                id: 'longitude',
                                decimalSeparator: '.',
                                minValue: -180,
                                maxValue: 180,
                                allowBlank: false,
                                blankText: 'Veuillez saisir la longitude !',
                                decimalPrecision: 16
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Latitude',
                                id: 'latitude',
                                decimalSeparator: '.',
                                minValue: -90,
                                maxValue: 90,
                                allowBlank: false,
                                blankText: 'Veuillez saisir la latitude !',
                                decimalPrecision: 16
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
                    text: 'Dupliquer',
                    handler: dupliquer,
                    iconCls: 'dupliquer',
                    tooltip: 'Enregistrer puis dupliquer les données du formulaire'
                }, '-', {
                    text: 'Enregistrer',
                    handler: function() {
                        modeDuplication = false;
                        soumettre();
                    },
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnuler',
                    text: 'Annuler',
                    handler: function() {
                        fenetreFormulaire.hide();
                        if (Ext.getCmp('action').value == 'Ajouter') { // en ajout, il faut recharger pour enlever la géométrie
                            donneesGrille.reload();
                        }
                        modeDuplication = false;
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
        title: 'Saisie des observations',
        width: 900,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnuler').handler
    });
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

//Affichage en mode ajout
function ajoute(geom) {
    initialiseFormulaire(); // "reinitialiseFormulaire" inclus
    // initialisation des valeurs par défaut
    Ext.getCmp('numerisat').setValue(numerisat); // propre à la personne connectée
    // affectation du mode en ajout
    Ext.getCmp('action').setValue('Ajouter');
    // blocage des boutons de navigation
    Ext.getCmp('boutonPrecedent').disable();
    Ext.getCmp('boutonSuivant').disable();
    // gestion du focus
    Ext.getCmp('date_obs').focus('', 2000); // focus de 2000 ms sinon ça ne marche pas
    Ext.getCmp('geometrie').setValue(geom);
    finaliseFormulaire(); // "spatialiseFormulaire" inclus
}

//Affichage en mode modification
function modifie() {
    initialiseFormulaire(); // "reinitialiseFormulaire" inclus
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPrecedent').setDisabled(!grille.selModel.hasPrevious());
    Ext.getCmp('boutonSuivant').setDisabled(!grille.selModel.hasNext());
    // remplissage du formulaire
    var geom = coucheEditable.selectedFeatures[0].geometry.clone(); // clônage car pas de reload ensuite si annuler
    Ext.getCmp('geometrie').setValue(geom.transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')));
    var selected = grille.selModel.getSelected();
    for (var donnee in selected.data) {
        if (Ext.getCmp(donnee)) {
            if (donnee == 'heure_obs') {
                Ext.getCmp(donnee).setValue(timeRenderer(selected.data[donnee]));
            }
            else {
                Ext.getCmp(donnee).setValue(selected.data[donnee]);
            }
        }
    }
    // affectation du mode en modif
    Ext.getCmp('action').setValue('Modifier');
    finaliseFormulaire(); // "spatialiseFormulaire" inclus
}

//Fonction appelée après un enregistrement réussi ou si duplicata
function termineAffichage() {
    // mode duplication
    if (modeDuplication) {
        // réinitialisation des contrôles primaires
        reinitialiseFormulaire();
        // mise en mémoire des valeurs par défaut
        var geom = Ext.getCmp('geometrie').value;
        var station = Ext.getCmp('noms').value;
        var gid = Ext.getCmp('gid').value;
        // remise à zéro des contrôles
        formulaire.form.reset();
        // réinitialisation des valeurs par défaut
        Ext.getCmp('numerisat').setValue(numerisat); // propre à la personne connectée
        Ext.getCmp('geometrie').setValue(geom);
        Ext.getCmp('noms').setValue(station);
        Ext.getCmp('gid').setValue(gid);
        // passage forcé en mode ajout
        Ext.getCmp('action').setValue('Ajouter');
        Ext.getCmp('id_obs').setValue('');
        // blocage des boutons de navigation
        Ext.getCmp('boutonPrecedent').disable();
        Ext.getCmp('boutonSuivant').disable();
        finaliseFormulaire(); // "spatialiseFormulaire" inclus
    }
    // autres modes (ajout et modif)
    else {
        fenetreFormulaire.hide();
        modeDuplication = false;
        donneesGrille.reload();
    }
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettre() {
    if (formulaire.form.isValid()) {
        // test sur les informations du débit
        if (Ext.getCmp('mesure_debit').getValue()) {
            if (Ext.getCmp('choixModeMesureDebit').getValue() == null) {
                Ext.MessageBox.show({
                    title: 'ATTENTION : mode de mesure du débit non renseigné !!!',
                    msg: 'Le mode de mesure du débit est obligatoire quand la mesure du débit est renseignée',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            return;
            }
        }
        else {
            Ext.getCmp('mode_mesure_debit').setValue('');
        }
        // invalidation forcée des "emptyText" lors de la soumission
        if (comboMeteo_3j.getRawValue() == '') {
            comboMeteo_3j.setRawValue('');
        }
        templateValidation('../Controleurs/Gestions/GestObs.php', Ext.getCmp('statusbar'),
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

//Initialisation du formulaire incluant "reinitialiseFormulaire"
function initialiseFormulaire() {
    fenetreFormulaire.show();
    // mise à zéro des contrôles sur les onglets actifs
    formulaire.form.reset();
    // complément d'initialisation du formulaire
    reinitialiseFormulaire();
}

//Réinitialisation du formulaire
function reinitialiseFormulaire() {
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    // réinitialisation des variables globales
    toucheENTREE = true;    
}

//Finalisation du formulaire incluant "spatialiseFormulaire"
function finaliseFormulaire() {
    // traitement de la spatialité des données
    spatialiseFormulaire(Ext.getCmp('geometrie').value);
    // blocage des coordonnées si station
    Ext.getCmp('longitude').setReadOnly(Ext.getCmp('noms').value != '');
    Ext.getCmp('longitude').setReadOnly(Ext.getCmp('noms').value != '');
    // traitement du mode de mesure du débit
    switch (Ext.getCmp('mode_mesure_debit').value) {
        case 'Dilution':
            Ext.getCmp('choixModeMesureDebit').setValue('Dilution');
            break;
        case 'Débimètre':
            Ext.getCmp('choixModeMesureDebit').setValue('Débimètre');
            break;
        default:
            Ext.getCmp('choixModeMesureDebit').reset();
            break;
    }    
}

//Spatialisation du formulaire
function spatialiseFormulaire(geom) {
    // traitement de la géomérie
    Ext.getCmp('longitude').setValue(geom.x);
    Ext.getCmp('latitude').setValue(geom.y);
}

//Fonction appelée sur le click du bouton "Dupliquer"
function dupliquer() {
    modeDuplication = true;
    // si le numérisateur est aussi le connecté
    if (Ext.getCmp('numerisat').value == numerisat) {        
        soumettre(); // alors enregistrement des informations en cours également
    }
    else {
        termineAffichage(); // sinon pas d'enregistrement possible avant
    }
}

//Fonction de récupération du champ "val" sous forme de tableau
function tableauValeurs(store) {
    var tabVal = [];
    var nb = store.getCount();
    if (nb > 0) {
        tabVal = new Array(nb);
        for (var i = 0; i < nb; i++) {
            tabVal[i] = store.getAt(i).data['val'];
        }
    }
    return tabVal;
}

//Fonction de récupération du champ "field1" sous forme de tableau
function listeValeurs(cmp) {
    var lstVal = [];
    var nb = cmp.store.getCount();
    if (nb > 0) {
        lstVal = new Array(nb);
        for (var i = 0; i < nb; i++) {
            lstVal[i] = cmp.store.getAt(i).data[cmp.valueField];
        }
    }
    return lstVal;
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
