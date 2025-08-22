class InventoryCalculator {
    constructor() {
        this.purchases = [];
        this.sales = [];
        this.initializeEventListeners();
        this.addInitialRows();
    }

    initializeEventListeners() {
        document.getElementById('add-purchase').addEventListener('click', () => this.addPurchaseRow());
        document.getElementById('add-sale').addEventListener('click', () => this.addSaleRow());
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculateAndDisplay());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('sample-data-btn').addEventListener('click', () => this.loadSampleData());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-purchase')) {
                this.removePurchaseRow(e.target.closest('.purchase-row'));
            }
            if (e.target.classList.contains('remove-sale')) {
                this.removeSaleRow(e.target.closest('.sale-row'));
            }
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.method);
            }
        });
    }

    addInitialRows() {
        this.addPurchaseRow();
        this.addSaleRow();
    }

    addPurchaseRow() {
        const container = document.getElementById('purchases-container');
        const row = document.createElement('div');
        row.className = 'purchase-row';
        row.innerHTML = `
            <input type="date" class="purchase-date" placeholder="Date">
            <input type="number" class="purchase-quantity" placeholder="Quantity" min="1">
            <input type="number" class="purchase-price" placeholder="Unit Cost ($)" step="0.01" min="0">
            <button type="button" class="remove-purchase">Remove</button>
        `;
        container.appendChild(row);
    }

    addSaleRow() {
        const container = document.getElementById('sales-container');
        const row = document.createElement('div');
        row.className = 'sale-row';
        row.innerHTML = `
            <input type="date" class="sale-date" placeholder="Date">
            <input type="number" class="sale-quantity" placeholder="Quantity Sold" min="1">
            <input type="number" class="sale-price" placeholder="Sale Price ($)" step="0.01" min="0">
            <button type="button" class="remove-sale">Remove</button>
        `;
        container.appendChild(row);
    }

    removePurchaseRow(row) {
        const container = document.getElementById('purchases-container');
        if (container.children.length > 1) {
            row.remove();
        }
    }

    removeSaleRow(row) {
        const container = document.getElementById('sales-container');
        if (container.children.length > 1) {
            row.remove();
        }
    }

    collectData() {
        this.purchases = [];
        this.sales = [];

        document.querySelectorAll('.purchase-row').forEach(row => {
            const date = row.querySelector('.purchase-date').value;
            const quantity = parseFloat(row.querySelector('.purchase-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.purchase-price').value) || 0;
            
            if (date && quantity > 0 && price >= 0) {
                this.purchases.push({
                    date: new Date(date),
                    quantity: quantity,
                    unitCost: price,
                    totalCost: quantity * price
                });
            }
        });

        document.querySelectorAll('.sale-row').forEach(row => {
            const date = row.querySelector('.sale-date').value;
            const quantity = parseFloat(row.querySelector('.sale-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.sale-price').value) || 0;
            
            if (date && quantity > 0 && price >= 0) {
                this.sales.push({
                    date: new Date(date),
                    quantity: quantity,
                    unitPrice: price,
                    totalRevenue: quantity * price
                });
            }
        });

        this.purchases.sort((a, b) => a.date - b.date);
        this.sales.sort((a, b) => a.date - b.date);
    }

    calculateFIFO() {
        let inventory = [...this.purchases];
        let totalCOGS = 0;
        let totalSalesRevenue = 0;
        let fifoDetails = [];

        for (let sale of this.sales) {
            let remainingToSell = sale.quantity;
            totalSalesRevenue += sale.totalRevenue;
            let saleCOGS = 0;
            let saleDetails = {
                date: sale.date,
                quantity: sale.quantity,
                salePrice: sale.unitPrice,
                costBreakdown: []
            };

            while (remainingToSell > 0 && inventory.length > 0) {
                let oldestPurchase = inventory[0];
                let quantityToUse = Math.min(remainingToSell, oldestPurchase.quantity);
                let costForThisQuantity = quantityToUse * oldestPurchase.unitCost;
                
                saleCOGS += costForThisQuantity;
                remainingToSell -= quantityToUse;
                
                saleDetails.costBreakdown.push({
                    quantity: quantityToUse,
                    unitCost: oldestPurchase.unitCost,
                    totalCost: costForThisQuantity,
                    purchaseDate: oldestPurchase.date
                });

                oldestPurchase.quantity -= quantityToUse;
                if (oldestPurchase.quantity <= 0) {
                    inventory.shift();
                }
            }

            saleDetails.totalCOGS = saleCOGS;
            fifoDetails.push(saleDetails);
            totalCOGS += saleCOGS;
        }

        let endingInventoryValue = inventory.reduce((total, item) => total + (item.quantity * item.unitCost), 0);
        let grossProfit = totalSalesRevenue - totalCOGS;
        let profitMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

        return {
            cogs: totalCOGS,
            endingInventory: endingInventoryValue,
            grossProfit: grossProfit,
            profitMargin: profitMargin,
            details: fifoDetails,
            remainingInventory: inventory
        };
    }

    calculateLIFO() {
        let inventory = [...this.purchases];
        let totalCOGS = 0;
        let totalSalesRevenue = 0;
        let lifoDetails = [];

        for (let sale of this.sales) {
            let remainingToSell = sale.quantity;
            totalSalesRevenue += sale.totalRevenue;
            let saleCOGS = 0;
            let saleDetails = {
                date: sale.date,
                quantity: sale.quantity,
                salePrice: sale.unitPrice,
                costBreakdown: []
            };

            while (remainingToSell > 0 && inventory.length > 0) {
                let newestPurchase = inventory[inventory.length - 1];
                let quantityToUse = Math.min(remainingToSell, newestPurchase.quantity);
                let costForThisQuantity = quantityToUse * newestPurchase.unitCost;
                
                saleCOGS += costForThisQuantity;
                remainingToSell -= quantityToUse;
                
                saleDetails.costBreakdown.push({
                    quantity: quantityToUse,
                    unitCost: newestPurchase.unitCost,
                    totalCost: costForThisQuantity,
                    purchaseDate: newestPurchase.date
                });

                newestPurchase.quantity -= quantityToUse;
                if (newestPurchase.quantity <= 0) {
                    inventory.pop();
                }
            }

            saleDetails.totalCOGS = saleCOGS;
            lifoDetails.push(saleDetails);
            totalCOGS += saleCOGS;
        }

        let endingInventoryValue = inventory.reduce((total, item) => total + (item.quantity * item.unitCost), 0);
        let grossProfit = totalSalesRevenue - totalCOGS;
        let profitMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

        return {
            cogs: totalCOGS,
            endingInventory: endingInventoryValue,
            grossProfit: grossProfit,
            profitMargin: profitMargin,
            details: lifoDetails,
            remainingInventory: inventory
        };
    }

    calculateWeightedAverage() {
        let totalQuantity = 0;
        let totalValue = 0;
        let totalCOGS = 0;
        let totalSalesRevenue = 0;
        let waDetails = [];

        this.purchases.forEach(purchase => {
            totalQuantity += purchase.quantity;
            totalValue += purchase.totalCost;
        });

        let weightedAverageUnitCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

        for (let sale of this.sales) {
            totalSalesRevenue += sale.totalRevenue;
            let saleCOGS = sale.quantity * weightedAverageUnitCost;
            totalCOGS += saleCOGS;
            totalQuantity -= sale.quantity;

            waDetails.push({
                date: sale.date,
                quantity: sale.quantity,
                salePrice: sale.unitPrice,
                weightedAvgCost: weightedAverageUnitCost,
                totalCOGS: saleCOGS
            });
        }

        let endingInventoryValue = totalQuantity * weightedAverageUnitCost;
        let grossProfit = totalSalesRevenue - totalCOGS;
        let profitMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

        return {
            cogs: totalCOGS,
            endingInventory: endingInventoryValue,
            grossProfit: grossProfit,
            profitMargin: profitMargin,
            details: waDetails,
            weightedAverageUnitCost: weightedAverageUnitCost,
            remainingQuantity: totalQuantity
        };
    }

    calculateAndDisplay() {
        this.collectData();

        if (this.purchases.length === 0 || this.sales.length === 0) {
            alert('Please enter at least one purchase and one sale to perform calculations.');
            return;
        }

        const fifoResults = this.calculateFIFO();
        const lifoResults = this.calculateLIFO();
        const waResults = this.calculateWeightedAverage();

        this.displayResults(fifoResults, lifoResults, waResults);
        this.displayImpactAnalysis(fifoResults, lifoResults, waResults);
        this.showResults();
    }

    displayResults(fifo, lifo, wa) {
        document.getElementById('fifo-cogs').textContent = `$${fifo.cogs.toFixed(2)}`;
        document.getElementById('fifo-inventory').textContent = `$${fifo.endingInventory.toFixed(2)}`;
        document.getElementById('fifo-profit').textContent = `$${fifo.grossProfit.toFixed(2)}`;
        document.getElementById('fifo-margin').textContent = `${fifo.profitMargin.toFixed(2)}%`;

        document.getElementById('lifo-cogs').textContent = `$${lifo.cogs.toFixed(2)}`;
        document.getElementById('lifo-inventory').textContent = `$${lifo.endingInventory.toFixed(2)}`;
        document.getElementById('lifo-profit').textContent = `$${lifo.grossProfit.toFixed(2)}`;
        document.getElementById('lifo-margin').textContent = `${lifo.profitMargin.toFixed(2)}%`;

        document.getElementById('wa-cogs').textContent = `$${wa.cogs.toFixed(2)}`;
        document.getElementById('wa-inventory').textContent = `$${wa.endingInventory.toFixed(2)}`;
        document.getElementById('wa-profit').textContent = `$${wa.grossProfit.toFixed(2)}`;
        document.getElementById('wa-margin').textContent = `${wa.profitMargin.toFixed(2)}%`;

        this.currentResults = { fifo, lifo, wa };
        this.displayCalculationDetails('fifo');
    }

    displayImpactAnalysis(fifo, lifo, wa) {
        const cogsDiffFifoLifo = fifo.cogs - lifo.cogs;
        const cogsDiffFifoWa = fifo.cogs - wa.cogs;
        const cogsDiffLifoWa = lifo.cogs - wa.cogs;

        const invDiffFifoLifo = fifo.endingInventory - lifo.endingInventory;
        const invDiffFifoWa = fifo.endingInventory - wa.endingInventory;
        const invDiffLifoWa = lifo.endingInventory - wa.endingInventory;

        const taxRate = 0.25;
        const taxDiffFifoLifo = cogsDiffFifoLifo * taxRate;
        const taxDiffFifoWa = cogsDiffFifoWa * taxRate;
        const taxDiffLifoWa = cogsDiffLifoWa * taxRate;

        document.getElementById('cogs-diff-fifo-lifo').textContent = `$${cogsDiffFifoLifo.toFixed(2)}`;
        document.getElementById('cogs-diff-fifo-wa').textContent = `$${cogsDiffFifoWa.toFixed(2)}`;
        document.getElementById('cogs-diff-lifo-wa').textContent = `$${cogsDiffLifoWa.toFixed(2)}`;

        document.getElementById('inv-diff-fifo-lifo').textContent = `$${invDiffFifoLifo.toFixed(2)}`;
        document.getElementById('inv-diff-fifo-wa').textContent = `$${invDiffFifoWa.toFixed(2)}`;
        document.getElementById('inv-diff-lifo-wa').textContent = `$${invDiffLifoWa.toFixed(2)}`;

        document.getElementById('tax-diff-fifo-lifo').textContent = `$${taxDiffFifoLifo.toFixed(2)}`;
        document.getElementById('tax-diff-fifo-wa').textContent = `$${taxDiffFifoWa.toFixed(2)}`;
        document.getElementById('tax-diff-lifo-wa').textContent = `$${taxDiffLifoWa.toFixed(2)}`;

        this.applyValueColors('cogs-diff-fifo-lifo', cogsDiffFifoLifo);
        this.applyValueColors('cogs-diff-fifo-wa', cogsDiffFifoWa);
        this.applyValueColors('cogs-diff-lifo-wa', cogsDiffLifoWa);
        this.applyValueColors('inv-diff-fifo-lifo', invDiffFifoLifo);
        this.applyValueColors('inv-diff-fifo-wa', invDiffFifoWa);
        this.applyValueColors('inv-diff-lifo-wa', invDiffLifoWa);
        this.applyValueColors('tax-diff-fifo-lifo', taxDiffFifoLifo);
        this.applyValueColors('tax-diff-fifo-wa', taxDiffFifoWa);
        this.applyValueColors('tax-diff-lifo-wa', taxDiffLifoWa);
    }

    applyValueColors(elementId, value) {
        const element = document.getElementById(elementId);
        element.className = '';
        if (value > 0) {
            element.classList.add('positive');
        } else if (value < 0) {
            element.classList.add('negative');
        } else {
            element.classList.add('neutral');
        }
    }

    switchTab(method) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        this.displayCalculationDetails(method);
    }

    displayCalculationDetails(method) {
        const detailsContainer = document.getElementById('calc-details');
        const results = this.currentResults[method];
        
        if (!results) return;

        let html = '';
        
        if (method === 'fifo') {
            html = this.generateFIFODetails(results);
        } else if (method === 'lifo') {
            html = this.generateLIFODetails(results);
        } else if (method === 'wa') {
            html = this.generateWADetails(results);
        }

        detailsContainer.innerHTML = html;
    }

    generateFIFODetails(results) {
        let html = '<h4>FIFO (First In, First Out) Calculation Details</h4>';
        html += '<p>Under FIFO, the oldest inventory items are sold first.</p>';
        
        html += '<table class="calc-table">';
        html += '<thead><tr><th>Sale Date</th><th>Qty Sold</th><th>Cost Breakdown</th><th>COGS</th></tr></thead>';
        html += '<tbody>';
        
        results.details.forEach(sale => {
            html += `<tr>`;
            html += `<td>${sale.date.toLocaleDateString()}</td>`;
            html += `<td>${sale.quantity}</td>`;
            html += `<td>`;
            sale.costBreakdown.forEach((item, index) => {
                if (index > 0) html += '<br>';
                html += `${item.quantity} × $${item.unitCost.toFixed(2)} (from ${item.purchaseDate.toLocaleDateString()})`;
            });
            html += `</td>`;
            html += `<td>$${sale.totalCOGS.toFixed(2)}</td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
        
        if (results.remainingInventory.length > 0) {
            html += '<h5>Remaining Inventory:</h5>';
            html += '<table class="calc-table">';
            html += '<thead><tr><th>Purchase Date</th><th>Quantity</th><th>Unit Cost</th><th>Total Value</th></tr></thead>';
            html += '<tbody>';
            results.remainingInventory.forEach(item => {
                html += `<tr>`;
                html += `<td>${item.date.toLocaleDateString()}</td>`;
                html += `<td>${item.quantity}</td>`;
                html += `<td>$${item.unitCost.toFixed(2)}</td>`;
                html += `<td>$${(item.quantity * item.unitCost).toFixed(2)}</td>`;
                html += `</tr>`;
            });
            html += '</tbody></table>';
        }
        
        return html;
    }

    generateLIFODetails(results) {
        let html = '<h4>LIFO (Last In, First Out) Calculation Details</h4>';
        html += '<p>Under LIFO, the newest inventory items are sold first.</p>';
        
        html += '<table class="calc-table">';
        html += '<thead><tr><th>Sale Date</th><th>Qty Sold</th><th>Cost Breakdown</th><th>COGS</th></tr></thead>';
        html += '<tbody>';
        
        results.details.forEach(sale => {
            html += `<tr>`;
            html += `<td>${sale.date.toLocaleDateString()}</td>`;
            html += `<td>${sale.quantity}</td>`;
            html += `<td>`;
            sale.costBreakdown.forEach((item, index) => {
                if (index > 0) html += '<br>';
                html += `${item.quantity} × $${item.unitCost.toFixed(2)} (from ${item.purchaseDate.toLocaleDateString()})`;
            });
            html += `</td>`;
            html += `<td>$${sale.totalCOGS.toFixed(2)}</td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
        
        if (results.remainingInventory.length > 0) {
            html += '<h5>Remaining Inventory:</h5>';
            html += '<table class="calc-table">';
            html += '<thead><tr><th>Purchase Date</th><th>Quantity</th><th>Unit Cost</th><th>Total Value</th></tr></thead>';
            html += '<tbody>';
            results.remainingInventory.forEach(item => {
                html += `<tr>`;
                html += `<td>${item.date.toLocaleDateString()}</td>`;
                html += `<td>${item.quantity}</td>`;
                html += `<td>$${item.unitCost.toFixed(2)}</td>`;
                html += `<td>$${(item.quantity * item.unitCost).toFixed(2)}</td>`;
                html += `</tr>`;
            });
            html += '</tbody></table>';
        }
        
        return html;
    }

    generateWADetails(results) {
        let html = '<h4>Weighted Average Calculation Details</h4>';
        html += '<p>Under Weighted Average, all inventory costs are averaged together.</p>';
        
        html += `<p><strong>Weighted Average Unit Cost: $${results.weightedAverageUnitCost.toFixed(4)}</strong></p>`;
        
        html += '<table class="calc-table">';
        html += '<thead><tr><th>Sale Date</th><th>Qty Sold</th><th>Avg Unit Cost</th><th>COGS</th></tr></thead>';
        html += '<tbody>';
        
        results.details.forEach(sale => {
            html += `<tr>`;
            html += `<td>${sale.date.toLocaleDateString()}</td>`;
            html += `<td>${sale.quantity}</td>`;
            html += `<td>$${sale.weightedAvgCost.toFixed(4)}</td>`;
            html += `<td>$${sale.totalCOGS.toFixed(2)}</td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
        
        if (results.remainingQuantity > 0) {
            html += '<h5>Remaining Inventory:</h5>';
            html += `<p>Quantity: ${results.remainingQuantity}</p>`;
            html += `<p>Unit Cost: $${results.weightedAverageUnitCost.toFixed(4)}</p>`;
            html += `<p>Total Value: $${results.endingInventory.toFixed(2)}</p>`;
        }
        
        return html;
    }

    showResults() {
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }

    clearAll() {
        document.getElementById('purchases-container').innerHTML = '';
        document.getElementById('sales-container').innerHTML = '';
        document.getElementById('results-section').style.display = 'none';
        this.addInitialRows();
    }

    loadSampleData() {
        this.clearAll();

        const samplePurchases = [
            { date: '2024-01-15', quantity: 100, price: 10.00 },
            { date: '2024-02-10', quantity: 150, price: 12.00 },
            { date: '2024-03-05', quantity: 200, price: 11.50 },
            { date: '2024-04-20', quantity: 120, price: 13.00 }
        ];

        const sampleSales = [
            { date: '2024-02-25', quantity: 80, price: 18.00 },
            { date: '2024-03-15', quantity: 120, price: 19.50 },
            { date: '2024-04-25', quantity: 150, price: 20.00 }
        ];

        document.getElementById('purchases-container').innerHTML = '';
        document.getElementById('sales-container').innerHTML = '';

        samplePurchases.forEach(purchase => {
            const container = document.getElementById('purchases-container');
            const row = document.createElement('div');
            row.className = 'purchase-row';
            row.innerHTML = `
                <input type="date" class="purchase-date" value="${purchase.date}">
                <input type="number" class="purchase-quantity" value="${purchase.quantity}">
                <input type="number" class="purchase-price" value="${purchase.price}">
                <button type="button" class="remove-purchase">Remove</button>
            `;
            container.appendChild(row);
        });

        sampleSales.forEach(sale => {
            const container = document.getElementById('sales-container');
            const row = document.createElement('div');
            row.className = 'sale-row';
            row.innerHTML = `
                <input type="date" class="sale-date" value="${sale.date}">
                <input type="number" class="sale-quantity" value="${sale.quantity}">
                <input type="number" class="sale-price" value="${sale.price}">
                <button type="button" class="remove-sale">Remove</button>
            `;
            container.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InventoryCalculator();
});