let size;
let shuffling = false;
let timerInterval;
let timer;
let pressed;

function start() {
  // Clear gameboard
  $(".gameboard").html("");
  $(".gameboard")[0].style.background = "black";

  // Get user selected size of gameboard
  size = $("#size").val();

  // Initialize timer
  clearInterval(timerInterval);
  timer = 0;
  $('.timer span').text('00:00');

  // Change size of tiles based on size of board
  $("head").append('<style type="text/css"></style>');
  let tileCSS = $("head").children(':last');
  tileCSS.html(`.tile{width:calc((100%/${size}) - 6px);height:calc((100%/${size}) - 6px);}`);

  // Add tiles to gameboard, set class, id and flex order
  for (let i = 0; i < size ** 2; i++) {
    if (i == size ** 2 - 1) {
      // Empty tile in last place
      $(".gameboard").append(`<div class='tile empty' id='tileEmpty'></div>`);
      $("#tileEmpty")[0].style.order = size ** 2 - 1;
    } else if (i % size % 2 == 1) {
      $(".gameboard").append(`<div class='tile' id='tile${i+1}'><span>${i+1}</span></div>`);
      $(`#tile${i+1}`)[0].style.order = i;
      $(`#tile${i+1}`).fitText(.15);
    } else {
      $(".gameboard").append(`<div class='tile odd' id='tile${i+1}'><span>${i+1}</span></div>`);
      $(`#tile${i+1}`)[0].style.order = i;
      $(`#tile${i+1}`).fitText(.15);
    }
  }

  // Shuffle the board after 3 seconds
  setTimeout(() => shuffle(size), 2000);
}

function shuffle() {
  shuffling = true;

  // Shuflle overlay
  $(".gameboard").append("<div class='shuffling'><img src='img/shuffling.svg' alt='Shuffling'/></div>");

  // Move a random tile every 10ms
  let shuffleInterval = setInterval(() => {
    let arr = getMoveable();
    let random = Math.floor(Math.random() * arr.length);
    moveTile(arr[random]);
  }, 10);

  // Stop shuffling after 3s
  setTimeout(stopShuffling, 3000);

  function stopShuffling() {
    clearInterval(shuffleInterval);
    shuffling = false;

    // Remove overlay
    $(".shuffling").remove();

    unlockBoard();
    startTimer();
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer += 1

    let min = Math.floor(timer / 60);
    let sec = timer % 60;

    $('.timer span').text(`${min > 9 ? min : '0'+min}:${sec > 9 ? sec : '0'+sec}`);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function checkWin() {
  // Don't check while shuffling
  if (shuffling) {
    return false;
  }

  let re = true;

  // Check every tile's order matches face value
  $('.tile').not('.empty').each((index, element) => {
    let order = element.style.order;
    if (`<span>${parseInt(order)+1}</span>` !== element.innerHTML) {
      return re = false;
    }
  });

  return re;
}

function success() {
  lockBoard();
  stopTimer();
  $('.gameboard')[0].style.background = "green";
  $('#tileEmpty')[0].style.background = "green";
}

function lockBoard() {
  // Remove click events
  $(".tile")
    .off("mousedown")
    .off("mouseup");
}

function unlockBoard() {
  $(".tile")
    .on("mousedown", (event) => pressed = event.currentTarget)
    .on("mouseup", (event) => {
      if (pressed === event.currentTarget) {
        moveTile(event.currentTarget);
      }
    });
}

function moveTile(tile) {
  pressed = null;
  // Cannot move empty tile
  if (tile.id == 'tileEmpty') {
    return;
  }

  // Get order of tile and tileEmpty
  let orderTile = tile.style.order;
  let orderEmpty = $('#tileEmpty')[0].style.order;

  // Get row and column numbers
  let rowTile = Math.floor(orderTile / size);
  let colTile = orderTile % size;
  let rowEmpty = Math.floor(orderEmpty / size);
  let colEmpty = orderEmpty % size;

  let inColumn = colTile == colEmpty;
  let inRow = rowTile == rowEmpty;

  if (inColumn) {
    moveColumn(orderTile, orderEmpty, rowTile, rowEmpty, colTile, colEmpty);
  } else if (inRow) {
    moveRow(orderTile, orderEmpty, rowTile, rowEmpty, colTile, colEmpty);
  } else {
    return;
  }

  // Check win
  if (checkWin()) {
    success();
  }
}

// Return array of moveable tiles
function getMoveable() {
  let re = []
  $('.tile').each((index, element) => {
    if (element.id != "tileEmpty") {
      isMoveable(element) ? re.push(element) : null;
    }
  });
  return re;
}

function isMoveable(tile) {
  // Get order of tile and tileEmpty
  let orderTile = tile.style.order;
  let orderEmpty = $('#tileEmpty')[0].style.order;

  // Get row and column numbers
  let rowTile = Math.floor(orderTile / size);
  let colTile = orderTile % size;
  let rowEmpty = Math.floor(orderEmpty / size);
  let colEmpty = orderEmpty % size;

  let inColumn = colTile == colEmpty;
  let inRow = rowTile == rowEmpty;

  return inColumn || inRow;
}

function moveRow(orderTile, orderEmpty, rowTile, rowEmpty, colTile, colEmpty) {
  if (colTile - colEmpty < 0) {
    // Move tiles down
    for (let i = parseInt(orderEmpty); i >= orderTile; i--) {
      moveHelper(i);
    }
  } else {
    // Move tiles up
    for (let i = parseInt(orderEmpty); i <= orderTile; i++) {
      moveHelper(i);
    }
  }
}

function moveColumn(orderTile, orderEmpty, rowTile, rowEmpty, colTile, colEmpty) {
  if (rowTile - rowEmpty < 0) {
    // Move tiles right
    for (let i = parseInt(orderEmpty); i >= orderTile; i -= parseInt(size)) {
      moveHelper(i);
    }
  } else {
    // Move tiles left
    for (let i = parseInt(orderEmpty); i <= orderTile; i += parseInt(size)) {
      moveHelper(i);
    }
  }
}

function moveHelper(i) {
  $(".tile").filter((index, element) => {
    let other = element.style.order == parseInt(i) ? element : null;
    if (other != null) {
      let hold = $('#tileEmpty')[0].style.order;
      $('#tileEmpty')[0].style.order = other.style.order;
      other.style.order = hold;
    }
  });

}
