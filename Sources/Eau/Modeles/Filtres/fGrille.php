<?php
    // Fichier servant à  filtrer spécifiquement la grille des observations en cours
    // par un traitement des cas particuliers de concaténation/déconcaténation de champs
    $where = str_replace(' numerisat ', " (obr_nom || ' ' || obr_prenom) ", $where);
?>
