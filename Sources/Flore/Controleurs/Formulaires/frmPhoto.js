//Variables globales utilisées pour gérer le formulairePhoto
var formulairePhoto, fenetreformulairePhoto, suffixeRepPhoto, chURL_Photo, chRqPhoto,
    grilleLienPhoto, fenetreFormulaireLienPhoto, chNomPhoto, nomBoutonInfoPhoto,
    fctAfficherPhotoBis;

Ext.onReady(function() {
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulairePhoto = new Ext.FormPanel({
        fileUpload: true,
        frame: true,
        labelWidth: 130,
        labelAlign: 'right',
        defaults: {width: 230},
        labelSeparator: ' :',
        items: [{
                xtype: 'hidden',
                id: 'CST_cheminRelatifPhoto'
           }, {
                xtype: 'hidden',
                id: 'tampon_url_photo'
           }, {
                xtype: 'textfield',
                id: 'tampon_nom_photo',
                fieldLabel: 'Nom de la photo',
                readOnly: true
            }, {
                xtype: 'image',
                id: 'img_photo',
                width: 400,
                height: 300
            }, {
                xtype: 'textarea',
                id: 'tampon_rq_photo',
                height: 95,
                fieldLabel: 'Commentaires',
                maxLength: 254
            },
                new Ext.ux.form.FileUploadField({
                    id: 'fichierLocalPhoto',
                    buttonText: 'Parcourir...',
                    fieldLabel: 'Photo à importer',
                    emptyText: 'Sélectionner un fichier image',
                    allowBlank: false,
                    blankText: 'Veuillez sélectionner un fichier image !',
                    regex: /\.jpg|png|jpeg|gif|bmp/i,
                    regexText: "Veuillez sélectionner un fichier avec l'extension JPG, JPEG, PNG, GIF ou BMP"
                })
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotalPhoto = new Ext.Panel({
        items: formulairePhoto,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    id: 'boutonPhotoPrecedente',
                    text: 'Précédent',
                    handler: afficherPhotoPrecedente,
                    iconCls: 'precedent',
                    tooltip: 'Afficher la photo précédente'
                }, {
                    id: 'boutonEffacerPhoto',
                    text: 'Effacer',
                    handler: function() {
                        formulairePhoto.form.reset();
                        Ext.getCmp('img_photo').setSrc('');
                    },
                    iconCls: 'erase'
                }, '-', {
                    id: 'boutonImporterPhoto',
                    text: 'Importer',
                    handler: soumettrePhoto,
                    iconCls: 'import_IMG'
                }, '-', {
                    id: 'boutonEnregistrerPhoto',
                    text: 'Enregistrer',
                    handler: function() {
                        Ext.getCmp(chURL_Photo).setValue(Ext.getCmp('tampon_url_photo').value);
                        Ext.getCmp(chNomPhoto).setValue(Ext.getCmp('tampon_nom_photo').value);
                        Ext.getCmp(chRqPhoto).setValue(Ext.getCmp('tampon_rq_photo').getValue());
                        Ext.getCmp(nomBoutonInfoPhoto).setTooltip(Ext.getCmp('tampon_rq_photo').getValue());
                        fenetreformulairePhoto.hide();
                    },
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnulerPhoto',
                    text: 'Annuler',
                    handler: function() {fenetreformulairePhoto.hide();},
                    iconCls: 'cancel'
                }, {
                    id: 'boutonPhotoSuivante',
                    text: 'Suivant',
                    handler: afficherPhotoSuivante,
                    iconCls: 'suivant',
                    tooltip: 'Afficher la photo suivante'
                }
            ],
            id: 'statusbarPhoto',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreformulairePhoto = new Ext.Window({
        modal: true,
        resizable: false,
        width: 430,
        autoHeight: true,
        constrain: true,
        items: formulaireTotalPhoto,
        close: Ext.getCmp('boutonAnnulerPhoto').handler
    });
});

//Fonction appelée après un chargement réussi
function termineAffichagePhoto(data) {
    Ext.getCmp('tampon_url_photo').setValue(data);
    Ext.getCmp('tampon_nom_photo').setValue(nomPhoto(data));
    Ext.getCmp('img_photo').setSrc(Utf8.encode(CST_cheminRelatifPhoto + suffixeRepPhoto + data));
    Ext.getCmp('statusbarPhoto').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulairePhoto.getEl().unmask();
}

//Fonction appelée sur le click du bouton "Charger"
function soumettrePhoto() {
    templateValidation('../Modeles/Json/jFichierPhoto.php', Ext.getCmp('statusbarPhoto'),
        formulairePhoto, termineAffichagePhoto);
}

//Initialisation du formulaire
function initialiseformulairePhoto() {
    fenetreformulairePhoto.show();
    formulairePhoto.form.reset();
    Ext.getCmp('statusbarPhoto').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulairePhoto.getEl().unmask();  // déblocage de la saisie sur le formulaire
    Ext.getCmp('CST_cheminRelatifPhoto').setValue(CST_cheminRelatifPhoto + suffixeRepPhoto);
    Ext.getCmp('tampon_url_photo').setValue(Ext.getCmp(chURL_Photo).value);
    Ext.getCmp('tampon_nom_photo').setValue(Ext.getCmp(chNomPhoto).value);
    Ext.getCmp('tampon_rq_photo').setValue(Ext.getCmp(chRqPhoto).value);
    if (Ext.getCmp(chURL_Photo).value) {
        Ext.getCmp('img_photo').setSrc(Utf8.encode(CST_cheminRelatifPhoto + suffixeRepPhoto + Ext.getCmp(chURL_Photo).value));
    }
    else {
        Ext.getCmp('img_photo').setSrc('')
    }
    Ext.getCmp('tampon_rq_photo').focus('', 2000); // focus de 2000 ms sinon ça ne marche pas
}

//Importation photo
function importePhoto(repPhoto, urlPhoto, rqPhoto, grillePhoto, fenetreFormulairePhoto,
nomPhoto, boutonInfoPhoto) {
    suffixeRepPhoto = repPhoto;
    chURL_Photo = urlPhoto;
    chRqPhoto = rqPhoto;
    grilleLienPhoto = grillePhoto;
    fenetreFormulaireLienPhoto = fenetreFormulairePhoto;
    chNomPhoto = nomPhoto;
    nomBoutonInfoPhoto = boutonInfoPhoto;
    initialiseformulairePhoto();
    Ext.getCmp('boutonImporterPhoto').show();
    Ext.getCmp('boutonEffacerPhoto').show();
    Ext.getCmp('boutonEnregistrerPhoto').show();
    Ext.getCmp('boutonAnnulerPhoto').show();
    Ext.getCmp('fichierLocalPhoto').show();
    Ext.getCmp('boutonPhotoPrecedente').hide();
    Ext.getCmp('boutonPhotoSuivante').hide();
    Ext.getCmp('tampon_rq_photo').setReadOnly(false);
    fenetreformulairePhoto.setTitle('Chargement - fichier photo');
}

//Affichage photo
function affichePhoto(repPhoto, urlPhoto, rqPhoto, grillePhoto, fenetreFormulairePhoto,
nomPhoto, boutonInfoPhoto, affichagePhotoBis) {
    suffixeRepPhoto = repPhoto;
    chURL_Photo = urlPhoto;
    chRqPhoto = rqPhoto;
    grilleLienPhoto = grillePhoto;
    fenetreFormulaireLienPhoto = fenetreFormulairePhoto;
    chNomPhoto = nomPhoto;
    nomBoutonInfoPhoto = boutonInfoPhoto;
    fctAfficherPhotoBis = affichagePhotoBis;
    fenetreFormulaireLienPhoto.hide(); // masquage du formulaire de saisie suite à l'appel de la méthode "modifier"
    initialiseformulairePhoto(); // affichage du formulaire photo
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPhotoPrecedente').setDisabled(!grilleLienPhoto.selModel.hasPrevious());
    Ext.getCmp('boutonPhotoSuivante').setDisabled(!grilleLienPhoto.selModel.hasNext());
    Ext.getCmp('boutonImporterPhoto').hide();
    Ext.getCmp('boutonEffacerPhoto').hide();
    Ext.getCmp('boutonEnregistrerPhoto').hide();
    Ext.getCmp('boutonAnnulerPhoto').hide();
    Ext.getCmp('fichierLocalPhoto').hide();
    Ext.getCmp('boutonPhotoPrecedente').show();
    Ext.getCmp('boutonPhotoSuivante').show();
    Ext.getCmp('tampon_rq_photo').setReadOnly(true);
    fenetreformulairePhoto.setTitle('Visualisation - fichier photo');
}

//Fonction d'affichage de la photo précédente dans la grille
function afficherPhotoPrecedente() {
    if (grilleLienPhoto.selModel.selectPrevious()) {
        affichagePhoto();
    }
}

//Fonction d'affichage de la photo suivante dans la grille
function afficherPhotoSuivante() {
    if (grilleLienPhoto.selModel.selectNext()) {
        affichagePhoto();
    }
}