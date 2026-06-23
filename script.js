let placedStages = [];
const gridSize = 12;
let stageIdCounter = 0;
let currentOrientation = 'horizontal';
let currentDragData = null;
let dragPreview = null;

function createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.position = 'relative';

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;

        cell.addEventListener('dragover', dragOver);
        cell.addEventListener('dragleave', dragLeave);
        cell.addEventListener('drop', dropStage);

        grid.appendChild(cell);
    }

    dragPreview = document.createElement('div');
    dragPreview.id = 'drag-preview';
    document.body.appendChild(dragPreview);
}

function setupRotateButton() {
    const rotateBtn = document.getElementById('rotate-btn');
    rotateBtn.addEventListener('click', () => {
        currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        rotateBtn.textContent = currentOrientation === 'horizontal'
            ? "🔄 หมุนเวที 115 cm (แนวนอน)"
            : "🔄 หมุนเวที 115 cm (แนวตั้ง)";
    });
}

function dragStart(e) {
    const option = e.currentTarget;
    currentDragData = {
        width: parseInt(option.dataset.width),
        height: parseInt(option.dataset.height),
        priceLite: parseInt(option.dataset.lite)
    };

    e.dataTransfer.setData('text/plain', JSON.stringify(currentDragData));
    option.classList.add('dragging');
    updateDragPreview();
}

function dragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    hideDragPreview();
}

function updateDragPreview() {
    if (!currentDragData || !dragPreview) return;

    const is115 = currentDragData.width === 115;
    const dragOrient = currentDragData.isExisting ? currentDragData.orientation : currentOrientation;
    const w = (is115 && dragOrient === 'horizontal') ? 2 : 1;
    const h = (is115 && dragOrient === 'vertical') ? 2 : 1;

    dragPreview.style.width = `${w * 48 + (w - 1) * 3}px`;
    dragPreview.style.height = `${h * 48 + (h - 1) * 3}px`;
    dragPreview.style.display = 'flex';
    dragPreview.textContent = `${currentDragData.height}cm`;
}

function hideDragPreview() {
    if (dragPreview) dragPreview.style.display = 'none';
}

function dragOver(e) {
    e.preventDefault();
    if (!currentDragData) return;

    const cell = e.currentTarget;
    cell.classList.remove('dragover-invalid');

    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const dragOrient = currentDragData.isExisting ? currentDragData.orientation : currentOrientation;
    const w = (currentDragData.width === 115 && dragOrient === 'horizontal') ? 2 : 1;
    const h = (currentDragData.width === 115 && dragOrient === 'vertical') ? 2 : 1;

    if (col + w > gridSize || row + h > gridSize) {
        cell.classList.add('dragover-invalid');
    } else {
        cell.classList.add('dragover');
    }

    dragPreview.style.left = `${e.pageX + 20}px`;
    dragPreview.style.top = `${e.pageY + 20}px`;
}

function dragLeave(e) {
    e.currentTarget.classList.remove('dragover', 'dragover-invalid');
}

function dropStage(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    cell.classList.remove('dragover', 'dragover-invalid');
    hideDragPreview();

    if (!currentDragData) return;

    const startIndex = parseInt(cell.dataset.index);
    const dragOrient = currentDragData.isExisting ? currentDragData.orientation : currentOrientation;

    if (currentDragData.isExisting) {
        removeStage(currentDragData.stageId);
    }

    const success = placeStage(currentDragData, startIndex, dragOrient);
    if (success) {
        currentDragData = null;
    }
}

function removeStage(id) {
    const stageIndex = placedStages.findIndex(s => s.id === id);
    if (stageIndex === -1) return;
    const stage = placedStages[stageIndex];
    stage.cells.forEach(idx => {
        const cell = document.querySelector(`.grid-cell[data-index="${idx}"]`);
        if (cell) {
            cell.classList.remove('occupied');
            cell.style.border = '';
            cell.style.boxShadow = '';
            cell.style.backgroundColor = '';
        }
    });
    if (stage.overlay) stage.overlay.remove();
    placedStages.splice(stageIndex, 1);
}

function rotatePlacedStage(id) {
    const stage = placedStages.find(s => s.id === id);
    if (!stage || stage.data.width === 60) return;

    stage.cells.forEach(idx => {
        const cell = document.querySelector(`.grid-cell[data-index="${idx}"]`);
        cell.classList.remove('occupied');
        cell.style.border = '';
        cell.style.boxShadow = '';
        cell.style.backgroundColor = '';
    });

    const newOrientation = stage.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    const w = newOrientation === 'horizontal' ? 2 : 1;
    const h = newOrientation === 'vertical' ? 2 : 1;

    let canPlace = true;
    if (stage.col + w > gridSize || stage.row + h > gridSize) canPlace = false;
    else {
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                const idx = (stage.row + r) * gridSize + (stage.col + c);
                const target = document.querySelector(`.grid-cell[data-index="${idx}"]`);
                if (!target || target.classList.contains('occupied')) {
                    canPlace = false; break;
                }
            }
        }
    }

    if (canPlace) {
        const data = stage.data;
        const startIndex = stage.row * gridSize + stage.col;
        removeStage(id);
        placeStage(data, startIndex, newOrientation);
    } else {
        stage.cells.forEach(idx => {
            const cell = document.querySelector(`.grid-cell[data-index="${idx}"]`);
            cell.classList.add('occupied');
            cell.style.border = '1px solid transparent';
            cell.style.boxShadow = 'none';
            cell.style.backgroundColor = 'transparent';
        });
        alert("ไม่สามารถหมุนได้ พื้นที่ถูกใช้งานแล้วหรือติดขอบ");
    }
}

function placeStage(data, startIndex, orientation) {
    const row = Math.floor(startIndex / gridSize);
    const col = startIndex % gridSize;

    const w = (data.width === 115 && orientation === 'horizontal') ? 2 : 1;
    const h = (data.width === 115 && orientation === 'vertical') ? 2 : 1;

    if (col + w > gridSize || row + h > gridSize) {
        alert("ไม่สามารถวางเกินขอบได้");
        return false;
    }

    const cellsToOccupy = [];
    let canPlace = true;

    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            const idx = (row + r) * gridSize + (col + c);
            const target = document.querySelector(`.grid-cell[data-index="${idx}"]`);
            if (!target || target.classList.contains('occupied')) {
                canPlace = false;
                break;
            }
            cellsToOccupy.push(idx);
        }
        if (!canPlace) break;
    }

    if (!canPlace) {
        alert("พื้นที่นี้ถูกใช้งานแล้ว");
        return false;
    }

    const color = data.width === 115 ? '#facc15' : '#86efac';

    cellsToOccupy.forEach(idx => {
        const target = document.querySelector(`.grid-cell[data-index="${idx}"]`);
        target.classList.add('occupied');
        target.style.border = '1px solid transparent';
        target.style.boxShadow = 'none';
        target.style.backgroundColor = 'transparent';
        target.textContent = '';
    });

    const overlay = document.createElement('div');
    overlay.className = 'stage-overlay';
    overlay.style.position = 'absolute';
    overlay.style.left = `${15 + col * 51}px`;
    overlay.style.top = `${15 + row * 51}px`;
    overlay.style.width = `${w * 48 + (w - 1) * 3}px`;
    overlay.style.height = `${h * 48 + (h - 1) * 3}px`;
    overlay.style.backgroundColor = color;
    overlay.style.border = '3px solid #854d0e';
    overlay.style.boxShadow = '0 0 0 3px rgba(234, 179, 8, 0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontWeight = '700';
    overlay.style.fontSize = '14px';
    overlay.style.color = '#1e40af';
    overlay.style.pointerEvents = 'auto';
    overlay.style.zIndex = '10';
    overlay.style.boxSizing = 'border-box';

    const sizeText = data.width === 115 ? '115x60' : '60x60';
    overlay.innerHTML = `<div style="text-align:center; line-height:1.2;">${sizeText}<br><span style="font-size:11px">(${data.height}cm)</span></div>`;

    document.getElementById('grid').appendChild(overlay);

    stageIdCounter++;
    const currentId = stageIdCounter;

    overlay.style.cursor = 'grab';
    overlay.title = 'คลิกเพื่อหมุน / ลากเพื่อย้ายหรือลบ';
    overlay.draggable = true;

    overlay.addEventListener('dragstart', (e) => {
        const stage = placedStages.find(s => s.id === currentId);
        if (!stage) return;
        currentDragData = {
            ...stage.data,
            isExisting: true,
            stageId: currentId,
            orientation: stage.orientation
        };
        e.dataTransfer.setData('text/plain', 'existing');
        stage.cells.forEach(idx => {
            const cell = document.querySelector(`.grid-cell[data-index="${idx}"]`);
            cell.classList.remove('occupied');
            cell.style.border = '';
            cell.style.boxShadow = '';
            cell.style.backgroundColor = '';
        });
        setTimeout(() => overlay.style.display = 'none', 0);
        updateDragPreview();
    });

    overlay.addEventListener('dragend', (e) => {
        if (currentDragData && currentDragData.isExisting) {
            const stage = placedStages.find(s => s.id === currentDragData.stageId);
            if (stage) {
                stage.cells.forEach(idx => {
                    const cell = document.querySelector(`.grid-cell[data-index="${idx}"]`);
                    cell.classList.add('occupied');
                    cell.style.border = '1px solid transparent';
                    cell.style.boxShadow = 'none';
                    cell.style.backgroundColor = 'transparent';
                });
                stage.overlay.style.display = 'flex';
            }
            currentDragData = null;
        }
        hideDragPreview();
    });

    overlay.addEventListener('click', (e) => {
        rotatePlacedStage(currentId);
    });

    placedStages.push({
        id: currentId,
        data: data,
        orientation: orientation,
        price: data.priceLite,
        cells: cellsToOccupy,
        row: row,
        col: col,
        w: w,
        h: h,
        overlay: overlay
    });
    calculateTotal(true);
    return true;
}

// Functions อื่นๆ
function changeQty(btn, delta) {
    const qtySpan = btn.parentElement.querySelector('.qty');
    let qty = parseInt(qtySpan.textContent) || 0;
    qty = Math.max(0, qty + delta);
    qtySpan.textContent = qty;
    calculateTotal(false);
}

function updateCornerWarnings(updateAccessoryQty = false) {
    const warningContainer = document.getElementById('warning-container');
    if (!warningContainer) return;

    // Calculate corner collisions
    const vertexMap = {};
    placedStages.forEach(stage => {
        const r = stage.row;
        const c = stage.col;
        const w = stage.w;
        const h = stage.h;

        // The 4 corners of each stage deck correspond to these grid vertices
        const corners = [
            `${r},${c}`,
            `${r},${c + w}`,
            `${r + h},${c}`,
            `${r + h},${c + w}`
        ];

        corners.forEach(key => {
            vertexMap[key] = (vertexMap[key] || 0) + 1;
        });
    });

    let plat1 = 0;
    let plat2 = 0;
    let plat3 = 0;
    let plat4 = 0;

    for (const key in vertexMap) {
        const count = vertexMap[key];
        if (count === 1) {
            plat1++;
        } else if (count === 2) {
            plat2++;
        } else if (count === 3) {
            plat3++;
        } else if (count === 4) {
            plat4++;
        }
    }

    // Auto-update accessory inputs if layout has changed
    if (updateAccessoryQty) {
        const p1QtySpan = document.querySelector('#acc-plat1 .qty');
        const p2QtySpan = document.querySelector('#acc-plat2 .qty');
        const p3QtySpan = document.querySelector('#acc-plat3 .qty');
        const p4QtySpan = document.querySelector('#acc-plat4 .qty');
        if (p1QtySpan) p1QtySpan.textContent = plat1;
        if (p2QtySpan) p2QtySpan.textContent = plat2;
        if (p3QtySpan) p3QtySpan.textContent = plat3;
        if (p4QtySpan) p4QtySpan.textContent = plat4;
    }

    // Generate warning HTML
    if (plat1 > 0 || plat2 > 0 || plat3 > 0 || plat4 > 0) {
        let warningHtml = `
            <div class="warning-title">
                ⚠️ คำแนะนำอุปกรณ์เชื่อมต่อเวที
            </div>
            <div class="warning-list">
        `;
        if (plat1 > 0) {
            warningHtml += `
                <div class="warning-item">
                    <span class="warning-badge">Plat 1</span> 
                    มุมที่ไม่ชนกับใคร จำนวน <strong>${plat1}</strong> จุด (ต้องใช้ Plat 1 จำนวน <strong>${plat1}</strong> ชิ้น)
                </div>
            `;
        }
        if (plat2 > 0) {
            warningHtml += `
                <div class="warning-item">
                    <span class="warning-badge">Plat 2</span> 
                    มุมชนกัน 2 มุม จำนวน <strong>${plat2}</strong> จุด (ต้องใช้ Plat 2 จำนวน <strong>${plat2}</strong> ชิ้น)
                </div>
            `;
        }
        if (plat3 > 0) {
            warningHtml += `
                <div class="warning-item">
                    <span class="warning-badge">Plat 3</span> 
                    มุมชนกัน 3 มุม (หรือชนกันเป็นรูปตัว L) จำนวน <strong>${plat3}</strong> จุด (ต้องใช้ Plat 3 จำนวน <strong>${plat3}</strong> ชิ้น)
                </div>
            `;
        }
        if (plat4 > 0) {
            warningHtml += `
                <div class="warning-item">
                    <span class="warning-badge">Plat 4</span> 
                    มุมชนกัน 4 มุม จำนวน <strong>${plat4}</strong> จุด (ต้องใช้ Plat 4 จำนวน <strong>${plat4}</strong> ชิ้น)
                </div>
            `;
        }
        warningHtml += `</div>`;
        warningContainer.innerHTML = warningHtml;
        warningContainer.style.display = 'block';
    } else {
        warningContainer.innerHTML = '';
        warningContainer.style.display = 'none';
    }
}

function calculateTotal(layoutChanged = false) {
    // Update warnings and sync accessory counts if needed
    updateCornerWarnings(layoutChanged);

    let total = placedStages.reduce((sum, stage) => sum + stage.price, 0);

    document.querySelectorAll('.accessory').forEach(acc => {
        const qty = parseInt(acc.querySelector('.qty').textContent) || 0;
        total += qty * parseInt(acc.dataset.price);
    });

    document.getElementById('total-amount').textContent = total.toLocaleString('th-TH') + " บาท";
}

function clearGrid() {
    if (confirm("ล้างการจัดวางทั้งหมดใช่หรือไม่?")) {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('occupied');
            cell.style.border = '';
            cell.style.boxShadow = '';
            cell.style.backgroundColor = '';
            cell.textContent = '';
        });
        document.querySelectorAll('.stage-overlay').forEach(el => el.remove());
        placedStages = [];
        calculateTotal(true);
    }
}

// Initialize
window.onload = () => {
    createGrid();
    setupRotateButton();

    const draggable = document.getElementById('active-stage-draggable');
    if (draggable) {
        draggable.addEventListener('dragstart', dragStart);
        draggable.addEventListener('dragend', dragEnd);
    }

    const selector = document.getElementById('stage-selector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            const data = JSON.parse(e.target.value);
            draggable.dataset.width = data.width;
            draggable.dataset.depth = data.depth;
            draggable.dataset.height = data.height;
            draggable.dataset.lite = data.lite;
            draggable.dataset.pro = data.pro;

            document.getElementById('active-stage-name').textContent = data.name;
            document.getElementById('active-stage-lite').textContent = `Lite ${data.lite.toLocaleString()}`;
            document.getElementById('active-stage-pro').textContent = `Pro ${data.pro.toLocaleString()}`;
        });
    }

    const trashBin = document.getElementById('trash-bin');
    if (trashBin) {
        trashBin.addEventListener('dragover', e => {
            e.preventDefault();
            trashBin.style.background = '#fca5a5';
        });
        trashBin.addEventListener('dragleave', e => {
            trashBin.style.background = '#fef2f2';
        });
        trashBin.addEventListener('drop', e => {
            e.preventDefault();
            trashBin.style.background = '#fef2f2';
            if (currentDragData && currentDragData.isExisting) {
                removeStage(currentDragData.stageId);
                currentDragData = null;
                calculateTotal(true);
            }
        });
    }

    calculateTotal(true);
};