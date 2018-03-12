class GridControl {
    constructor(element, rules) {
        this.element = element;
        this.initialRules = rules;

        this.template = [];
        var templateStrLines = rules.templateArea.split('|');
        for (var i=0; i<templateStrLines.length; i++) {
            var templateLines = [];

            var areas = templateStrLines[i].split(' ');
            for (var j=0; j<areas.length; j++) {
                templateLines.push(areas[j]);
            }

            this.template.push(templateLines);
        }

        this.cards = {};
        for (var i=0; i<this.element.children.length; i++) {
            this.cards[rules.areas[i]] = new CardControl(this.element.children[i], this, rules.areas[i]);
        }

        this.element.style.display = 'grid';
        this.element.style.gridTemplateRows = rules.templateRows;
        this.element.style.gridTemplateColumns = rules.templateColumns;

        this.applyTemplate();
    }

    get rules() {
        var rules = this.initialRules;

        var templateArea = '';
        for (var i=0; i<this.template.length; i++) {
            for(var j=0; j<this.template[0].length; j++) {
                templateArea += this.template[i][j];
                if (j < this.template[0].length-1) templateArea += ' ';
            }
            if (i < this.template.length-1) templateArea += '|';
        }

        rules.templateArea = templateArea;
        return rules;
    }

    applyTemplate() {
        var res = '';

        for (var i=0; i<this.template.length; i++) {
            var line = '';

            for (var j=0; j<this.template[i].length; j++) {
                line += this.template[i][j];

                if (this.template[i][j] == '_') line += i + '_' + j;

                if (j < this.template[i].length-1) line += ' ';
            }

            res += '"' + line + '"';

            if (i < this.template.length-1) res += ' ';
        }

        this.element.style.gridTemplateAreas = res;
    }

    getAreaPosition(area) {
        var pos = null;

        var i=0;
        var found = false;
        while (i<this.template.length && !found) {

            var j=0;
            while (j<this.template[i].length && !found) {
                if (this.template[i][j] == area) {
                    found = true;
                    pos = {row: i, col: j, height: 0, width: 0};
                }
                j++;
            }
            i++;
        }

        if (found) {
            var i = 1;
            while (pos.col+i<this.template[0].length && this.template[pos.row][pos.col+i] == area) {
                i++;
            }
            pos.width = i;

            var i = 1;
            while (pos.row+i<this.template.length && this.template[pos.row+i][pos.col] == area) {
                i++;
            }
            pos.height = i;
        }

        return pos;
    }
}

class CardControl {
    constructor(element, grid, area) {
        this.element = element;
        this.grid = grid;
        this.element.style.gridArea = area;
        this.position = this.grid.getAreaPosition(area);
    }

    get area() {
        return this.element.style.gridArea[this.element.style.gridArea.length-1];
    }

    spanRight() {
        if (this.position.col + this.position.width-1 == this.grid.template.length[0]-1) return false;

        for (var i = this.position.row; i < this.position.row + this.position.height; i++) {
            if (this.grid.template[i][this.position.col+this.position.width] != '_') {
                return false;
            }
        }

        for (var i = this.position.row; i < this.position.row + this.position.height; i++) {
            this.grid.template[i][this.position.col+this.position.width] = this.area;
        }

        this.position.width++;
        this.grid.applyTemplate();
        return true;
    }

    spanBottom() {
        if (this.position.row + this.position.height-1 == grid.length-1) return false;

        for (var i = this.position.col; i < this.position.col + this.position.width; i++) {
            if (this.grid.template[this.position.row + this.position.height][i] != '_') return false;
        }

        for (var i = this.position.col; i < this.position.col + this.position.width; i++) {
            this.grid.template[this.position.row + this.position.height][i] = this.area;
        }

        this.position.height++;
        this.grid.applyTemplate();
        return true;
    }

    unSpanRight() {
        if (this.position.width == 1) return false;

        for (var i = this.position.row; i < this.position.row + this.position.height; i++) {
            this.grid.template[i][this.position.col+this.position.width-1] = '_';
        }

        this.position.width--;
        this.grid.applyTemplate();
        return true;
    }

    unSpanBottom() {
        if (this.position.height == 1) return false;

        for (var i = this.position.col; i < this.position.col + this.position.width; i++) {
            this.grid.template[this.position.row + this.position.height-1][i] = '_';
        }

        this.position.height--;
        this.grid.applyTemplate();
        return true;
    }

    switchWith(otherCard) {
        for (var i=this.position.row; i < this.position.row + this.position.height; i++) {
            for (var j=this.position.col; j < this.position.col + this.position.width; j++) {
                this.grid.template[i][j] = otherCard.area;
            }
        }

        for (var i=otherCard.position.row; i < otherCard.position.row + otherCard.position.height; i++) {
            for (var j=otherCard.position.col; j < otherCard.position.col + otherCard.position.width; j++) {
                this.grid.template[i][j] = this.area;
            }
        }

        var position = this.position;
        this.position = otherCard.position;
        otherCard.position = position;

        this.grid.applyTemplate();
    }

    moveToEmptyCell(row, col) {
        this.grid.template[row][col] = this.area;

        for (var i=this.position.row; i < this.position.row + this.position.height; i++) {
            for (var j=this.position.col; j < this.position.col + this.position.width; j++) {
                this.grid.template[i][j] = '_';
            }
        }

        this.position = {row: row, col: col, height: 1, width: 1};
        this.grid.applyTemplate();
    }
}


// Mastodon

function setupDropZones() {
    var cpt = 0;
    for (var i = 0; i < grid.template.length; i++) {
        for (var j = 0; j < grid.template[i].length; j++) {

            if (grid.template[i][j] == '_') {
                var dropzone = document.createElement('div');
                dropzone.className = "dropzone";

                dropzone.id = i + '-' + j;

                dropzone.addEventListener('dragover', function (event) {
                    event.preventDefault();
                });

                dropzone.addEventListener('drop', function (event) {
                    event.preventDefault();
                    var pos = this.id.split('-');
                    var card = grid.cards[event.dataTransfer.getData('text')];
                    card.moveToEmptyCell(parseInt(pos[0]), parseInt(pos[1]));
                });

                grid.element.appendChild(dropzone);
            }
        }
    }
}

function removeDropZones() {
    var dropzones = document.getElementsByClassName('dropzone');

    while (dropzones.length > 0) {
        grid.element.removeChild(dropzones[0]);
    }
}

function setupCard(element) {
    element.style.position = 'relative';

    element.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    element.addEventListener('drop', function (event) {
        event.preventDefault();
        var thisCard = grid.cards[this.style.gridArea[this.style.gridArea.length-1]];
        var otherCard = grid.cards[event.dataTransfer.getData('text')];
        thisCard.switchWith(otherCard);
    });

    var dragbtn = document.createElement('div');
    dragbtn.className = 'dragbtn';
    dragbtn.setAttribute('draggable', 'true');
    element.appendChild(dragbtn);
    dragbtn.addEventListener('dragstart', function (event) {
        document.getElementsByClassName('upload-area')[0].style.display = 'none';
        let gridArea = event.target.parentElement.style.gridArea;
        event.dataTransfer.setData("Text", gridArea[gridArea.length-1]);
        setupDropZones();
    });
    dragbtn.addEventListener('dragend', function () {
        document.getElementsByClassName('upload-area')[0].style.display = null;
        removeDropZones();
    });

    var resizebtn = document.createElement('div');
    resizebtn.className = 'resizebtn';
    element.appendChild(resizebtn);
    resizebtn.addEventListener('mousedown', function (event) {
        event.preventDefault();
        let gridArea = this.parentNode.style.gridArea;
        var card = grid.cards[gridArea[gridArea.length-1]];
        var cellWidth = card.element.offsetWidth / card.position.width;
        var cellHeight = card.element.offsetHeight / card.position.height;
        var initialX = event.pageX;
        var initialY = event.pageY;

        document.onmousemove = function (event) {
            document.body.style.cursor = "nw-resize";
            if (event.pageX > initialX + cellWidth / 2 && card.spanRight()) {
                initialX += cellWidth;
            } else if (event.pageX < initialX - cellWidth / 2 && card.unSpanRight()) {
                initialX -= cellWidth;
            }

            if (event.pageY > initialY + cellHeight / 2 && card.spanBottom()) {
                initialY += cellHeight;
            } else if (event.pageY < initialY - cellHeight / 2 && card.unSpanBottom()) {
                initialY -= cellHeight;
            }
        };

        document.onmouseup = function () {
            document.body.style.cursor = "auto";
            document.onmousemove = null;
            document.onmouseup = null;
        };
    });
}

function setupGrid(columnsContainer, rules) {
    var grid = new GridControl(columnsContainer, rules);

    new MutationObserver(function () {
        var columns = document.getElementsByClassName('columns-area')[0].children;
        let i = 0;
        for (let area of rules.areas) {
            if (columns[i].style.gridArea == "") {
                columns[i].style.gridArea = area;
                grid.cards[area].element = columns[i];
                setupCard(columns[i]);
            }
            i++;
        }
    }).observe(columnsContainer, { childList: true });

    return grid;
}

var rules;
if (GM_getValue('savedRules')) {
    rules = JSON.parse(GM_getValue('savedRules'));
} else {
    rules = {
        'areas': ['a', 'b', 'c', 'd'],
        'templateArea': 'a b c d _|a b c d _',
        'templateRows': 'repeat(2, 1fr)',
        'templateColumns': 'repeat(5, 19.5vw)'
    };
}

var grid;

var columnsContainer = document.getElementsByClassName('columns-area')[0];
if (columnsContainer) {
    grid = setupGrid(columnsContainer, rules);
} else {
    // In case the script is loaded before the components (As for GreaseMonkey)
    new MutationObserver(function () {
        columnsContainer = document.getElementsByClassName('columns-area')[0];
        grid = setupGrid(columnsContainer, rules);
        this.disconnect();
    }).observe(document.body.firstElementChild, { childList: true });
}

window.onbeforeunload = function () {
    GM_setValue('savedRules', JSON.stringify(grid.rules));
};

GM_addStyle('.columns-area {grid-gap: .5vw;padding: .5rem .25vw;height: 100vh; max-width: 100vw;} .column, .drawer {margin: 0 !important;padding: 0 !important;width: 100%;} .resizebtn {position: absolute;bottom: 0;right: 0;height: 20px;width: 20px;background-color: #ccc;border: none;border-radius: 50% 0 0 0;opacity: 0.2;cursor: nw-resize;} .resizebtn:hover {opacity: 1;} .dragbtn {position: absolute;bottom: 5px;left: 5px;height: 35px;width: 35px;background-color: #ccc;border: none;border-radius: 50%;opacity: 0.2;cursor: move;} .dragbtn:hover {opacity: 1;} .dropzone {border: 2px dashed #ccc;border-radius: .4rem;} .column:nth-child(3) .column-icon {top: 0}');