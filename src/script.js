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

function colorToDirection(piece) {
    if (piece.classList.contains("white")) {
        return -1;
    }
    return 1;
}

function isCorrectMove(iFrom, jFrom, iTo, jTo, direction) {
    if (iTo < 0 || jTo < 0 || iTo >= fieldSize || jTo >= fieldSize) {
        return false;
    }
    if (Math.abs(jFrom - jTo) != 1) {
        return false;
    }
    return iTo - iFrom == direction;
}

function movePiece(piece, iTo, jTo) {
    let cell = piece.closest(".cell");

    let newRow = board.querySelectorAll(".row")[iTo];
    let newCell = newRow.querySelectorAll(".cell")[jTo];
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
    let i, j;
    let piece;
    let direction;

    board.addEventListener("click", function(evt) {
        if (!pieceSelected) {
            piece = evt.target.closest(".piece");
            if (!piece) {
                pieceSelected = false;
                return;
            }
            direction = colorToDirection(piece);

            let cell = piece.closest(".cell");
            i = cell.dataset.i;
            j = cell.dataset.j;
            pieceSelected = true;
        } else {
            let cell = evt.target.closest(".cell");
            if (!cell) {
                pieceSelected = false;
                return;
            }

            let iTo = cell.dataset.i;
            let jTo = cell.dataset.j;
            if (isCorrectMove(i, j, iTo, jTo, direction)) {
                movePiece(piece, iTo, jTo);
            }
            pieceSelected = false;
        }
    });
}

createBoard();
addBoardHandlers();
