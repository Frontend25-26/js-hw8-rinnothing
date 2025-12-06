const bgBody = document.body;
const board = document.getElementById("board");
const fieldSize = 8;
const startPiecesNumber = fieldSize / 2 * 3;

function createBoard() {
    for (let i = 0; i < fieldSize; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < fieldSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add((i + j) % 2 === 0 ? "white" : "black");
            cell.dataset.i = i;
            cell.dataset.j = j;

            row.appendChild(cell);
        }
        board.appendChild(row);
    }

    resetPieces();
}

function resetPieces() {
    for (let i = 0; i < fieldSize; i++) {
        for (let j = 0; j < fieldSize; j++) {
            let cell = getCellAt(i, j);
            let piece = cell.querySelector(".piece");
            if (piece) {
                cell.removeChild(piece);
            }

            if (i < 3 && (i + j) % 2 !== 0) {
                addPiece(cell, "black", i, j);
            } else if (i > 4 && (i + j) % 2 !== 0) {
                addPiece(cell, "white", i, j);
            }
        }
    }
}

function addPiece(cell, color, row, col) {
    const piece = document.createElement("div");
    piece.classList.add("piece", color);
    piece.dataset.color = color;
    piece.dataset.col = col;
    piece.dataset.row = row;
    cell.appendChild(piece);
}

function isWhite(piece) {
    return piece.classList.contains("white");
}

function colorToDirection(piece) {
    if (isWhite(piece)) {
        return -1;
    }
    return 1;
}

function changeBackgroundColor(whiteStep) {
    if (whiteStep) {
        bgBody.classList.remove("black");
        return;
    }
    bgBody.classList.add("black");
}

function changeSelected(piece, selected) {
    if (selected) {
        piece.classList.add("selected");
        return;
    }
    piece.classList.remove("selected");
}

function getCellAt(i, j) {
    return board.querySelectorAll(".row")[i].querySelectorAll(".cell")[j];
}

function getPieceAtTheMiddle(fromCell, toCell) {
    let iFrom = parseInt(fromCell.dataset.i);
    let jFrom = parseInt(fromCell.dataset.j);
    let iTo = parseInt(toCell.dataset.i);
    let jTo = parseInt(toCell.dataset.j);

    return getCellAt((iTo + iFrom)/2, (jTo + jFrom)/2).querySelector(".piece");
}

function isCorrectEating(fromCell, toCell, direction, whiteStep) {
    let iFrom = parseInt(fromCell.dataset.i);
    let jFrom = parseInt(fromCell.dataset.j);
    let iTo = parseInt(toCell.dataset.i);
    let jTo = parseInt(toCell.dataset.j);

    if (Math.abs(jFrom - jTo) == 2 && direction * 2 == iTo - iFrom) {
        let pieceAtTheWay = getPieceAtTheMiddle(fromCell, toCell);

        if (pieceAtTheWay && (pieceAtTheWay.classList.contains("white") ^ whiteStep)) {
            return true;
        }
    }
}

function isCorrectMove(fromCell, toCell, direction, whiteStep) {
    if (toCell.querySelector(".piece")) {
        return false;
    }

    let iFrom = parseInt(fromCell.dataset.i);
    let jFrom = parseInt(fromCell.dataset.j);
    let iTo = parseInt(toCell.dataset.i);
    let jTo = parseInt(toCell.dataset.j);

    if (isCorrectEating(fromCell, toCell, direction, whiteStep)) {
        return true;
    }

    if (Math.abs(jFrom - jTo) != 1) {
        return false;
    }
    return iTo - iFrom == direction;
}

function tryEat(fromCell, toCell) {
    if (Math.abs(fromCell.dataset.i - toCell.dataset.i) != 2 && Math.abs(fromCell.dataset.j - toCell.dataset.j) != 2) {
        return false;
    }

    let pieceAtTheWay = getPieceAtTheMiddle(fromCell, toCell);
    if (!pieceAtTheWay) {
        return false;
    }

    let cell = pieceAtTheWay.closest(".cell");
    if (!cell) {
        return false;
    }

    pieceAtTheWay.classList.add("dying");
    setTimeout(() => cell.removeChild(pieceAtTheWay), 500);
    return true;
}

function hasSteps(curCell, direction, whiteStep) {
    let newI = parseInt(curCell.dataset.i) + 2*direction;
    if (newI < 0 || newI >= fieldSize) {
        return false;
    }

    let curJ = parseInt(curCell.dataset.j);
    let newJ = curJ + 2;
    if (newJ < fieldSize) {
        if (isCorrectEating(curCell, getCellAt(newI, newJ), direction, whiteStep)) {
            return true;
        }
    }
    
    newJ = curJ - 2;
    if (newJ >= 0) {
        if (isCorrectEating(curCell, getCellAt(newI, newJ), direction, whiteStep)) {
            return true;
        }
    }

    return false;
}

function movePiece(piece, newCell) {
    let cell = piece.closest(".cell");
    let dI = newCell.getBoundingClientRect().y - cell.getBoundingClientRect().y;
    let dJ = newCell.getBoundingClientRect().x - cell.getBoundingClientRect().x;

    piece.style.transform = `translate(${dJ}px, ${dI}px)`;

    setTimeout(() => {
        piece.style.transform = "translate(0px, 0px)";
        cell.removeChild(piece);
        newCell.appendChild(piece);
    }, "300");
}

function createNotification() {
    let notificationBody = document.createElement("div");
    notificationBody.classList.add("notification-body");

    let notification = document.createElement("div");
    notification.classList.add("notification");

    let header = document.createElement("h2");
    header.textContent = "Game Over!"
    notification.appendChild(header);

    notification.append("The winner is ");

    let winner = document.createElement("span");
    winner.classList.add("winner");
    winner.textContent = "None";
    notification.append(winner);

    let br = document.createElement("br");
    notification.append(br);

    let button = document.createElement("button");
    button.classList.add("repeat-button");
    button.textContent = "Play again!";
    button.addEventListener("click", function() {
        resetPieces();
        bgBody.removeChild(notificationBody);
        changeBackgroundColor(true);
    });
    notification.append(button);

    notificationBody.appendChild(notification);
    
    return notificationBody;
}

function showNotification(notification, user) {
    let winner = notification.querySelector(".winner");
    winner.textContent = user;

    bgBody.appendChild(notification);
}

const notification = createNotification();

function addBoardHandlers() {
    let pieceSelected = false;
    let fromCell;
    let piece;
    let direction;
    let whiteStep = true;
    let blackPieces = startPiecesNumber;
    let whitePieces = startPiecesNumber;

    function resetSelection() {
        pieceSelected = false;
        changeSelected(piece, false);
    }

    function resetData() {
        resetSelection();
        whiteStep = true;
        blackPieces = startPiecesNumber;
        whitePieces = startPiecesNumber;
    }

    board.addEventListener("click", function(evt) {
        if (!pieceSelected) {
            piece = evt.target.closest(".piece");
            if (!piece) {
                return;
            }
            if (whiteStep ^ isWhite(piece)) {
                return
            }
            direction = colorToDirection(piece);

            pieceSelected = true;
            changeSelected(piece, true);

            fromCell = piece.closest(".cell");
        } else {
            let cell = evt.target.closest(".cell");
            if (!cell) {
                resetSelection();
                return;
            }

            if (isCorrectMove(fromCell, cell, direction, whiteStep)) {
                movePiece(piece, cell);
                if (tryEat(fromCell, cell)) {
                    if (whiteStep) {
                        blackPieces--;
                        if (blackPieces == 0) {
                            showNotification(notification, "White");
                            resetData();
                            return;
                        }
                    } else {
                        whitePieces--;
                        if (whitePieces == 0) {
                            showNotification(notification, "Black");
                            resetData();
                            return;
                        }
                    }
                    if (hasSteps(cell, direction, whiteStep)) {
                        fromCell = cell;
                        return;
                    }
                }
                whiteStep = !whiteStep;
                changeBackgroundColor(whiteStep);
            }
            resetSelection();
        }
    });
}

createBoard();
addBoardHandlers();
