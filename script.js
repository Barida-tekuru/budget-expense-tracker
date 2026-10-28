// Categories list
const categories = {
    expense: [
        "Food & Groceries",
        "Transport & Fuel",
        "Airtime & Internet Data",
        "Rent & Utilities (PHCN/Water)",
        "Black Tax / Family Support",
        "Business / Side Hustle",
        "Leisure & Outing",
        "Others"
    ],
    income: [
        "Salary / Monthly Stipend",
        "Business Revenue",
        "Freelance / Gig",
        "Family / Gifts",
        "Investment Returns",
        "Others"
    ]
};

const currencySymbols = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$"
};

// State initialization from localStorage
let transactions = JSON.parse(localStorage.getItem('naija_transactions')) || [];
let currentCurrency = localStorage.getItem('naija_currency') || 'NGN';

document.getElementById('currencySelect').value = currentCurrency;
updateCategories();

function updateCategories() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    
    categories[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function changeCurrency() {
    currentCurrency = document.getElementById('currencySelect').value;
    localStorage.setItem('naija_currency', currentCurrency);
    updateUI();
}

function formatMoney(amount) {
    const symbol = currencySymbols[currentCurrency] || '₦';
    return symbol + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addTransaction(e) {
    e.preventDefault();

    const text = document.getElementById('text').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;

    const newTransaction = {
        id: Date.now(),
        text,
        amount,
        type,
        category,
        date: new Date().toLocaleDateString()
    };

    transactions.unshift(newTransaction);
    saveAndRefresh();
    document.getElementById('transactionForm').reset();
    updateCategories();
}

function deleteTransaction(id) {
    transactions = transactions.filter(tx => tx.id !== id);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('naija_transactions', JSON.stringify(transactions));
    updateUI();
}

function updateUI() {
    const incomeTotal = transactions
        .filter(tx => tx.type === 'income')
        .reduce((acc, tx) => acc + tx.amount, 0);

    const expenseTotal = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((acc, tx) => acc + tx.amount, 0);

    const balance = incomeTotal - expenseTotal;

    document.getElementById('totalBalance').textContent = formatMoney(balance);
    document.getElementById('totalIncome').textContent = formatMoney(incomeTotal);
    document.getElementById('totalExpense').textContent = formatMoney(expenseTotal);

    renderTransactions();
}

function renderTransactions() {
    const list = document.getElementById('transactionList');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = transactions.filter(tx => 
        tx.text.toLowerCase().includes(searchQuery) || 
        tx.category.toLowerCase().includes(searchQuery)
    );

    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = `<li class="empty-state">No transactions found.</li>`;
        return;
    }

    filtered.forEach(tx => {
        const li = document.createElement('li');
        li.classList.add('transaction-item', tx.type);
        
        li.innerHTML = `
            <div class="tx-info">
                <h5>${tx.text}</h5>
                <span>${tx.category} • ${tx.date}</span>
            </div>
            <div class="tx-right">
                <span class="tx-amount">${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount)}</span>
                <button class="delete-btn" onclick="deleteTransaction(${tx.id})">&times;</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function loadSampleData() {
    transactions = [
        { id: 1, text: "Monthly Salary / Stipend", amount: 250000, type: "income", category: "Salary / Monthly Stipend", date: "10/24/2026" },
        { id: 2, text: "Fuel for Generator", amount: 15000, type: "expense", category: "Transport & Fuel", date: "10/24/2026" },
        { id: 3, text: "MTN 10GB Data Bundle", amount: 3500, type: "expense", category: "Airtime & Internet Data", date: "10/23/2026" },
        { id: 4, text: "Groceries from Bodija Market", amount: 35000, type: "expense", category: "Food & Groceries", date: "10/22/2026" }
    ];
    saveAndRefresh();
}

function clearAllData() {
    if(confirm("Are you sure you want to clear all data?")) {
        transactions = [];
        saveAndRefresh();
    }
}

// Initial render on page load
updateUI();