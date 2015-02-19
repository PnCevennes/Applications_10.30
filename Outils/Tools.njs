//Fonction pour afficher le formulaire photo
function affichagePhoto() {
    var notifier = new EventNotifier();
    setTimeout(notifier, 1000); // attente de 1000 ms sinon ça ne marche pas
    notifier.wait->();
    if (fctAfficherPhotoBis) {
        afficherPhotoBis();
    }
    else {
        afficherPhoto();
    }
}



