const bgBody = document.body;
const board = document.getElementById("board");
const fieldSize = 8;

function createBoard() {
    for (let i = 0; i < 8; i++) {
        const row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add((i + j) % 2 === 0 ? "white" : "black");
            cell.dataset.i = i;
            cell.dataset.j = j;

            if (i < 3 && (i + j) % 2 !== 0) {
                addPiece(cell, "black", i, j);
            } else if (i > 4 && (i + j) % 2 !== 0) {
                addPiece(cell, "white", i, j);
            }
            row.appendChild(cell);
        }
        board.appendChild(row);
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

function isCorrectMove(fromCell, toCell, direction, whiteStep) {
    if (toCell.querySelector(".piece")) {
        return false;
    }

    let iFrom = parseInt(fromCell.dataset.i);
    let jFrom = parseInt(fromCell.dataset.j);
    let iTo = parseInt(toCell.dataset.i);
    let jTo = parseInt(toCell.dataset.j);

    if (iTo < 0 || jTo < 0 || iTo >= fieldSize || jTo >= fieldSize) {
        return false;
    }

    if (Math.abs(jFrom - jTo) == 2 && direction * 2 == iTo - iFrom) {
        let pieceAtTheWay = getCellAt((iTo + iFrom)/2, (jTo + jFrom)/2).querySelector(".piece");

        if (pieceAtTheWay && (pieceAtTheWay.classList.contains("white") ^ whiteStep)) {
            console.log(`eaten at ${(iTo + iFrom)/2} ${(jTo + jFrom)/2}`)
            return true;
        }
    }

    if (Math.abs(jFrom - jTo) != 1) {
        return false;
    }
    return iTo - iFrom == direction;
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

function addBoardHandlers() {
    let pieceSelected = false;
    let fromCell;
    let piece;
    let direction;
    let whiteStep = true;

    function resetSelection() {
        pieceSelected = false;
        changeSelected(piece, false);
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
                whiteStep = !whiteStep;
                changeBackgroundColor(whiteStep);
            }
            resetSelection();
        }
    });
}

createBoard();
addBoardHandlers();
