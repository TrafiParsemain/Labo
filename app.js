let sizeCase = 12;
let cols = 61;
let lines = 31;
let randomcolor = false;

let tab_cases = [];

let busy;

let totalVictory = 0;
let totalLab = 0;
let playerPos = {
  l: 0,
  c: 0
};

let endPos = {
  l: 0,
  c: 0
};

let modeAuto = true ;
const debug = false;

////////////////// CLASS CASE AND GLOBAL FUNCTION ///////////////

class CaseJeu {

  constructor(l, c, estVide, aJoueur, aEnd, value, isTrack) {
    this.l = l;
    this.c = c;
    this.estVide = estVide;
    this.aJoueur = aJoueur;
    this.aEnd = aEnd;
    this.value = value;
    this.isTrack = isTrack;
  }

}

//Limité par min et max du tableaux (variable gloables :/)
function horsLimite(l, c) {
  if (c > 0 && c < cols - 1 && l > 0 && l < lines - 1) {
    return false;
  }
  return true;
}

//la case est elle fermée (et dans les limites)
//Ne s'appelle pas dans l'objet car si hors limite impossible de l'appeller via le tableau d'objet
function estFerme(l, c) {
  if (!horsLimite(l, c)) {
    if (!tab_cases[l][c + 1].estVide &&
      !tab_cases[l][c - 1].estVide &&
      !tab_cases[l + 1][c].estVide &&
      !tab_cases[l + 1][c - 1].estVide &&
      !tab_cases[l + 1][c + 1].estVide &&
      !tab_cases[l - 1][c].estVide &&
      !tab_cases[l - 1][c + 1].estVide &&
      !tab_cases[l - 1][c - 1].estVide) {
      return true;
    }
  }
  return false;
}

function aUnVoisonFerme(l, c) {
  if (estFerme(l - 2, c) || estFerme(l + 2, c) || estFerme(l, c + 2) || estFerme(l, c - 2)) {
    return true;
  } else {
    return false;
  }
}

function existeFerme() {
  for (l = 0; l < lines; l++) {
    for (c = 0; c < cols; c++) {
      if (estFerme(l, c)) {
        return true;
      }
    }
  }
  return false;
}




///////////////// TERRAIN HMTL//////////////////

//Creation terrain et élément de la table
function initTerrain() {

  majScore();

  $("td").remove();
  $("tr").remove();

   console.log("Creation du terrain");
  // console.log("SizeCase: " + sizeCase);
  // console.log("Lines: " + lines);
  // console.log("Cols: " + cols);

  //Creation des cases en td élément de tableaux TR // class case
  for (l = 0; l < lines; l++) {
    $("table").append("<tr class='ligne' id='line" + l + "' ></tr>");
    for (c = 0; c < cols; c++) {
      $("#line" + l).append("<td class='case' id =case" + l + "_" + c + "  ></td>");
    }
  }



  //Random color
  if (randomcolor) {
    $(".case").each(function() {
      $(this).css("background-color", randomBackColor());
    });
  }

  //console.log("creation du tableau");
  //Creation du talbeau d'objet
  for (l = 0; l < lines; l++) {
    tab_cases[l] = [];
    for (c = 0; c < cols; c++) {
      tab_cases[l][c] = new CaseJeu(l, c, false, false, false, "", false);
    }
  }

  terrainLab();

  initGame();

  majCaseClassCSS();

  if (modeAuto)startAutoPlayGod();

}


/////////////////// AFFICHAGE /////////////
function majCaseClassCSS() {
  //Creation du grillage de base
  for (l = 0; l < lines; l++) {
    for (c = 0; c < cols; c++) {

      //case vide
      if (tab_cases[l][c].estVide === true) {
        $("#case" + l + "_" + c).addClass("vide"); // Affectaion a l'affichage
      }

      //aJoueur
      if (tab_cases[l][c].aJoueur === true) {
        $("#case" + l + "_" + c).addClass("player"); // Affectaion a l'affichage
      } else {
        $("#case" + l + "_" + c).removeClass("player");
      }

      //aEnd
      if (tab_cases[l][c].aEnd === true) {
        $("#case" + l + "_" + c).addClass("end"); // Affectaion a l'affichage
      } else {
        $("#case" + l + "_" + c).removeClass("end");
      }

      //Probe (Si value est valeur numérique alors c'est du sondage pour trouver the End)
      if (Number.isInteger(tab_cases[l][c].value)) {
        $("#case" + l + "_" + c).addClass("probe"); // Affectaion a l'affichage
      } else {
        $("#case" + l + "_" + c).removeClass("probe");
      }

      //Track valide
      if (tab_cases[l][c].isTrack) {
        $("#case" + l + "_" + c).addClass("track"); // Affectaion a l'affichage
      } else {
        $("#case" + l + "_" + c).removeClass("track");
      }

    }
  }
  //Taille en pixel des cases
  //A modifier apres la creation des cases
  $('.case').css("width", sizeCase);
  $('.case').css("height", sizeCase);

  //caseShowValue();

}

function caseShowValue() {
  for (l = 0; l < lines; l++) {
    for (c = 0; c < cols; c++) {
      $('#case' + l + '_' + c).text(tab_cases[l][c].value);
    }
  }
}

//colorie les bordures et les "fermés"
function checkLab() {
  let t;
  for (l = 0; l < lines; l++) {
    for (c = 0; c < cols; c++) {
      if (tab_cases[l][c].estBordure()) {
        $("#case" + l + "_" + c).addClass("ferme");
      }
      if (tab_cases[l][c].estFerme()) {
        $("#case" + l + "_" + c).addClass("bordure");
      }

    }
  }
}

function majScore(){
  $('h3').text(totalVictory + " chemins trouvés sur " + totalLab + " labyrinthes.");
}

////////////// TERRAIN DATA //////////////


function terrainLab() {

  //Creation du grillage de base
  for (l = 1; l < lines - 1; l++) {
    if (l % 2 === 1) {
      for (c = 1; c < cols - 1; c++) {
        if (c % 2 === 1) {
          tab_cases[l][c].estVide = true; //Case mémoire
        }
      }
    }
  }

  let end_chemin;
  let direction;
  let ct = 0;
  let c_new;
  let l_new;
  let c_wall;
  let l_wall;

  ///////Premier Chemin/////////
  console.log("creation premier chemin");
  end_chemin = false;

  //Position de départ
  c = 1;
  l = 1;
  tab_cases[l][c].value = "g";
  while (!end_chemin) {

    //Choix direction et indice
    direction = randomInt(4);
    switch (direction) {
      case 0:
        c_new = c - 2;
        l_new = l;
        l_wall = l;
        c_wall = c - 1;
        break;
      case 1:
        c_new = c;
        l_new = l + 2;
        l_wall = l + 1;
        c_wall = c;
        break;
      case 2:
        c_new = c + 2;
        l_new = l;
        l_wall = l;
        c_wall = c + 1;
        break;
      case 3:
        c_new = c;
        l_new = l - 2;
        l_wall = l - 1;
        c_wall = c;
        break;
      default:
        console.log("erreur premier chemin : tirage aleatoire non prévu");
    }

    if (estFerme(l_new, c_new)) {
      tab_cases[l_wall][c_wall].estVide = true;
      c = c_new;
      l = l_new;
      tab_cases[l][c].value = "g";
    }

    //None neigbour can't be dug
    if (!estFerme(l + 2, c) && !estFerme(l - 2, c) && !estFerme(l, c - 2) && !estFerme(l, c + 2)) {
      end_chemin = true;
    }
  }

  ////////////////Next paths//////////////////
  let l_fer;
  let c_fer;
  let placed;
  let ct_path = 0;
  let premier_fermer_found;

  while (existeFerme()) {

    if (debug) {
      console.log('nouveau chemin:' + ct_path);
    }
    //Premier fermée
    premier_fermer_found = false;
    for (l = 0; l < lines; l++) {
      for (c = 0; c < cols; c++) {
        if (estFerme(l, c) && (!premier_fermer_found)) {
          l_fer = l;
          c_fer = c;
          premier_fermer_found = true;
        }
      }
    }

    if (debug) {
      console.log('placement sur gallerie grace a random');
    }
    //Cherche a se placer sur une gallerie
    placed = false;
    while (!placed) {

      l = randomInt(lines - 2) + 1;
      c = randomInt(cols - 2) + 1;

      if (tab_cases[l][c].value === 'g') placed = true;
    }
    if (debug) {
      console.log('Je suis sur le chemin i am :(' + l + ":" + c + ")");
    }
    //On est pllacé sur le Chemin
    //O va se rapprocher le plus possible du premier fermé
    //Tant qu'on a pas un voisin fermé
    if (debug) {
      console.log('rapprochement vers voisin fermé connu :(' + l_fer + ":" + c_fer + ")");
    }
    while (!aUnVoisonFerme(l, c)) {
      // un chance sur a pile ou face de se rapprocher d'abord en ligne ou en colonne
      //Ajoute du random de déplacement vers la premiere gallerie avec voisin fermé
      if (pileOuFace()) {
        if (l_fer < l) {
          l = l - 2;
        } else if (l_fer > l) {
          l = l + 2;
        } else if (c_fer < c) {
          c = c - 2;
        } else if (c_fer > c) {
          c = c + 2;
        }
      } else {
        if (c_fer < c) {
          c = c - 2;
        } else if (c_fer > c) {
          c = c + 2;
        } else if (l_fer < l) {
          l = l - 2;
        } else if (l_fer > l) {
          l = l + 2;
        }
      }
    }

    if (debug) {
      console.log('jai un voisin fermé je suis  :(' + l + ":" + c + ")");
    }

    //On est sur un L C qui a un voisin fermé
    end_chemin = false
    ct = 0;
    //Nouveau chemin !
    if (debug) {
      console.log("Parti pour un nouveau chemin");
    }
    while (!end_chemin) {

      //Choix direction et indice
      direction = randomInt(4);
      switch (direction) {
        case 0:
          c_new = c - 2;
          l_new = l;
          l_wall = l;
          c_wall = c - 1;
          break;
        case 1:
          c_new = c;
          l_new = l + 2;
          l_wall = l + 1;
          c_wall = c;
          break;
        case 2:
          c_new = c + 2;
          l_new = l;
          l_wall = l;
          c_wall = c + 1;
          break;
        case 3:
          c_new = c;
          l_new = l - 2;
          l_wall = l - 1;
          c_wall = c;
          break;
        default:
          console.log("erreur premier chemin : tirage aleatoire non prévu");
      }

      if (estFerme(l_new, c_new)) {
        tab_cases[l_wall][c_wall].estVide = true;
        c = c_new;
        l = l_new;
        tab_cases[l][c].value = "g";
      } else if (!horsLimite(l_new, c_new)) {
        //Si déja une gallerie déplacement mais pas de casse de mur
        if (tab_cases[l_new][c_new].value === 'g') {
          c = c_new;
          l = l_new;
        }
      }
      ct++;
      //compteur limite
      if (ct > 100) {
        end_chemin = true;
      }

    }

    ct_path++;
  }
  if (debug) {
    console.log("Fin des autres chemins");
  }

}



initTerrain();
//autoPlayDumb();




////// JEU //////////
function initGame() {
  tab_cases[1][1].aJoueur = true;
  playerPos.c = 1;
  playerPos.l = 1;

  let endOk = false;
  while (!endOk) {

    l = randomInt(lines);
    c = randomInt(cols);

    if (tab_cases[l][c].estVide && !tab_cases[l][c].aJoueur) {
      endOk = true;
      tab_cases[l][c].aEnd = true;
      endPos.l = l;
      endPos.c = c;
    }
  }

}

function victory() {
  if (tab_cases[playerPos.l][playerPos.c].aJoueur && tab_cases[playerPos.l][playerPos.c].aEnd) {
    totalVictory ++ ;
    if (!modeAuto)totalLab++;
    return true;
  }
  return false;
}

function endTheGame() {
  //console.log("Player has reached the end");
  initTerrain();
}

function monter() {

  let c = playerPos.c;
  let l = playerPos.l;

  if (tab_cases[l - 1][c].estVide) {
    tab_cases[l][c].aJoueur = false;
    tab_cases[l - 1][c].aJoueur = true;
    $("#case" + (l-1) + "_" + c).addClass("player");
    if (modeAuto)$("#case" + l + "_" + c).addClass("passed");
    $("#case" + l + "_" + c).removeClass("player");
    playerPos.l = l - 1;
    //majCaseClassCSS();
  }
}

function descendre() {

  let c = playerPos.c;
  let l = playerPos.l;

  if (tab_cases[l + 1][c].estVide) {
    tab_cases[l][c].aJoueur = false;
    tab_cases[l + 1][c].aJoueur = true;
    $("#case" + (l+1) + "_" + c).addClass("player");
    if (modeAuto)$("#case" + l + "_" + c).addClass("passed");
    $("#case" + l + "_" + c).removeClass("player");
    playerPos.l = l + 1;
    //majCaseClassCSS();
  }
}

function avancer() {

  let c = playerPos.c;
  let l = playerPos.l;

  if (tab_cases[l][c + 1].estVide) {
    tab_cases[l][c].aJoueur = false;
    tab_cases[l][c + 1].aJoueur = true;
    $("#case" + l + "_" + (c+1)).addClass("player");
    if (modeAuto)$("#case" + l + "_" + c).addClass("passed");
    $("#case" + l + "_" + c).removeClass("player");
    playerPos.c = c + 1;
    //majCaseClassCSS();
  }
}

function reculer() {

  let c = playerPos.c;
  let l = playerPos.l;

  if (tab_cases[l][c - 1].estVide) {
    tab_cases[l][c].aJoueur = false;
    tab_cases[l][c - 1].aJoueur = true;
    $("#case" + l + "_" + (c-1)).addClass("player");
    if (modeAuto)$("#case" + l + "_" + c).addClass("passed");
    $("#case" + l + "_" + c).removeClass("player");
    playerPos.c = c - 1;
    //majCaseClassCSS();
  }
}

//////// AUTO PLAY ////

/// ALGO DUMB////
function autoPlayDumb() {

  let direction = randomInt(4);

  switch (direction) {
    case 0:
      monter();
      break;
    case 1:
      reculer();
      break;
    case 2:
      descendre();
      break;
    case 3:
      avancer();
      break;
    default:
      console.log("pas d'action sur cette touche");
  }

  if (victory()) {
    endTheGame();
    autoPlayDumb();
  } else {
    setTimeout(function() {
      autoPlayDumb();
    }, 1);
  }
};

//Jeu auto apres trouver caseRout
function startAutoPlayGod() {
  console.log("Strat auto play")
    totalLab ++ ;
    probeAndTrackEnd();
    autoPlayGod();
}

function autoPlayGod() {

  let failure = false;
  let direction = -1 ;
  let casePlayer = tab_cases[playerPos.l][playerPos.c]


  //direction
  if (tab_cases[casePlayer.l-1 ][casePlayer.c].isTrack) {
    if (tab_cases[casePlayer.l-1][casePlayer.c].value > casePlayer.value) {
      direction = 0;
    }
  }
  if (tab_cases[casePlayer.l ][casePlayer.c-1].isTrack) {
    if (tab_cases[casePlayer.l][casePlayer.c-1].value > casePlayer.value) {
      direction = 1;
    }
  }
  if (tab_cases[casePlayer.l+1 ][casePlayer.c].isTrack) {
    if (tab_cases[casePlayer.l+1][casePlayer.c].value > casePlayer.value) {
      direction = 2;
    }
  }
  if (tab_cases[casePlayer.l ][casePlayer.c+1].isTrack) {
    if (tab_cases[casePlayer.l][casePlayer.c+1].value > casePlayer.value) {
      direction = 3;
    }
  }
  switch (direction) {
    case 0:
      monter();
      break;
    case 1:
      reculer();
      break;
    case 2:
      descendre();
      break;
    case 3:
      avancer();
      break;
    default:
      console.log("error auto play god");
      failure = true;
  }

  if (!failure) {
    if (victory()) {
      //console.log("Victory")
      endTheGame();
    } else {
      setTimeout(function() {
        autoPlayGod();
      }, 30);
    }
  } else {
    //console.log("No path to the end");
    initTerrain();
  }

}



/// Trouver route////
function probeAndTrackEnd() {
  //console.log("Tracking...");
  probeToEnd();
  trackFromEndToPlayer();
}


function probeToEnd() {

  let success = false;
  let caseToCheck = [];
  let caseOnTrack = [];
  let caseRoute;
  let caseChecked;

  //init probe (toute distance infini)
  for (l = 0; l < lines; l++) {
    for (c = 0; c < cols; c++) {
      tab_cases[l][c].value = "inf"
    }
  }

  let step = 0;
  caseOnTrack.push(tab_cases[playerPos.l][playerPos.c]);
  caseOnTrack[0].value = step;
  //tant qu'il y a des cases sur la route et que le succes n'est pas la
  while (caseOnTrack.length > 0 && !success) {

    //Caseroute suiante
    caseRoute = caseOnTrack.shift();

    //vérifions les case autour
    caseToCheck.push(tab_cases[caseRoute.l + 1][caseRoute.c]);
    caseToCheck.push(tab_cases[caseRoute.l - 1][caseRoute.c]);
    caseToCheck.push(tab_cases[caseRoute.l][caseRoute.c + 1]);
    caseToCheck.push(tab_cases[caseRoute.l][caseRoute.c - 1]);

    while (caseToCheck.length > 0) {
      caseChecked = caseToCheck.shift();
      if (caseChecked.estVide && caseChecked.value === 'inf') {
        caseChecked.value = caseRoute.value + 1;
        caseOnTrack.push(caseChecked);
      }
    }

    if (endIsProbed()) success = true;
  }

  //console.log("end probe in step:" + tab_cases[endPos.l][endPos.c].value);
  //majCaseClassCSS();
}

function endIsProbed() {
  if (tab_cases[endPos.l][endPos.c].aEnd && Number.isInteger(tab_cases[endPos.l][endPos.c].value)) {
    return true;
  } else {
    return false;
  }
}

function trackFromEndToPlayer() {

  let success = false;
  let caseToCheck = [];
  let caseOnTrack = [];
  let caseRoute;
  let caseChecked;

  console.log("strat track");

  //on part de l'arrivée
  let step = tab_cases[endPos.l][endPos.c].value;
  caseOnTrack.push(tab_cases[endPos.l][endPos.c]);
  //tant qu'il y a des cases sur la route et que le succes n'est pas la
  while (caseOnTrack.length > 0 && !success) {

    //Caseroute suiante
    caseRoute = caseOnTrack.shift();
    caseRoute.isTrack = true;

    //vérifions les case autour
    caseToCheck.push(tab_cases[caseRoute.l + 1][caseRoute.c]);
    caseToCheck.push(tab_cases[caseRoute.l - 1][caseRoute.c]);
    caseToCheck.push(tab_cases[caseRoute.l][caseRoute.c + 1]);
    caseToCheck.push(tab_cases[caseRoute.l][caseRoute.c - 1]);

    while (caseToCheck.length > 0) {
      caseChecked = caseToCheck.shift();
      if (caseChecked.value === caseRoute.value - 1) {
        caseOnTrack.push(caseChecked);
      }
    }

    if (tab_cases[playerPos.l][playerPos.c].isTrack) success = true;
  }

  //console.log("end track");
  //majCaseClassCSS();

}


//////// EVENT //////////
$(document).keypress(function(event) {
  //console.log(event.key);

  if (!busy && !modeAuto) {
    busy = true;
    switch (event.key) {
      case 'z':
        monter();
        break;
      case 'q':
        reculer();
        break;
      case 's':
        descendre();
        break;
      case 'd':
        avancer();
        break;
      default:
        console.log("pas d'action sur cette touche");
    }

    if (victory()) endTheGame();

    setTimeout(function() {
      busy = false;
    }, 10);

  }

});

//Event sur bouton
$("button").click(function() {
  var selectRow;
  selectRow = document.getElementById('dropdownrow');
  lines = selectRow.options[selectRow.selectedIndex].value

  var selectCol;
  selectCol = document.getElementById('dropdowncol');
  cols = selectCol.options[selectCol.selectedIndex].value

  var selectPixel;
  selectPixel = document.getElementById('dropdownpixel');
  sizeCase = selectPixel.options[selectPixel.selectedIndex].value

  var checkautoplay =  document.getElementById('autoplay');
  //console.log("Auto play check box : "+ checkautoplay.checked);
  modeAuto = checkautoplay.checked
  if (modeAuto)totalLab -- ;
  initTerrain();

});

//Si on passe avec la souris sur H1 il devient blue
$("h1").on("mouseover", function() {
  //$("h1").css("color", "blue");
  //$("h1").css("opacity", 1);
  //$("h1").text("RE-HELLO");
});


//////////////// Fonction simple ////////////
function randomBackColor() {
  //On change la couleur de fond au hasard
  return "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function pileOuFace() {
  if (Math.random() > 0.5) {
    return true;
  } else {
    return false;
  }
}
