<?php
    // Fichier servant à  filtrer spécifiquement la grille en cours par un traitement
    // des cas particuliers de concaténation/déconcaténation de champs
    $where = str_replace(' numerisat ', " (num.obr_nom || ' ' || num.obr_prenom) ", $where);
    $where = str_replace(' observateur ', " (obr.obr_nom || ' ' || obr.obr_prenom) ", $where);
    $where = str_replace(' zpr_affectee ', " coalesce(zpr_affectee, false) ", $where);
    $where = str_replace(' cibles ', ' saisie.liste_cibles(zpr_cibles) ', $where);
?>
